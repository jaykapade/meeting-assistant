from models.meeting import MeetingStatus
from db.db_ops import update_meeting_status, save_results, mark_failed
from db.session import SessionLocal
import os
import json
import time
import signal
import redis
import logging
from dotenv import load_dotenv
from audio_processor import transcribe_audio
from llm_processor import generate_summary

# Load environment variables FIRST, before any other imports that depend on them
load_dotenv()

# Now import modules that depend on environment variables

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', '6379'))
QUEUE_NAME = "meeting_jobs"

# Global flag for graceful shutdown
shutdown_flag = False


def process_meeting_job(job_data):
    # Job data uses 'id'
    meeting_id = job_data.get('id')
    file_path = job_data.get('file_path')

    if not meeting_id:
        logger.error(f"Missing meeting_id in job_data: {job_data}")
        return

    logger.info(f"Starting job for meeting {meeting_id}")

    # Create database session
    db = SessionLocal()
    try:
        # 1.Update DB -> processing
        update_meeting_status(db, meeting_id, MeetingStatus.processing)
        logger.info(f"Status updated to processing for {meeting_id}")

        # 2. Transcribe (Whisper)
        logger.info("🎙️ Starting Transcription...")
        transcript = transcribe_audio(file_path)

        # 3. Summarize (Ollama)
        logger.info("🧠 Generating Summary with Ollama...")
        result = generate_summary(transcript)
        summary = result.get("summary", "")
        action_items = result.get("action_items", [])

        # 4. Update DB -> Completed
        save_results(
            db,
            meeting_id,
            transcript=transcript,
            summary=summary,
            action_items=action_items
        )
        logger.info(f"✅ Job {meeting_id} Completed Successfully")

    except Exception as e:
        logger.error(f"❌ Job Failed: {str(e)}")
        try:
            mark_failed(db, meeting_id)
        except Exception as db_error:
            logger.error(f"Failed to mark meeting as failed: {db_error}")
    finally:
        db.close()


def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    global shutdown_flag
    logger.info(
        "\n🛑 Shutdown signal received. Finishing current job and exiting...")
    shutdown_flag = True


def start_consumer():
    global shutdown_flag

    # Register signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Connect to Redis
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT,
                        decode_responses=True)
        r.ping()
        logger.info("✅ Connected to Redis")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        return

    logger.info(f"🎧 Waiting for jobs in queue: '{QUEUE_NAME}'...")
    logger.info("Press Ctrl+C to stop gracefully")

    while not shutdown_flag:
        try:
            # Use a timeout so we can check shutdown_flag periodically
            # timeout=5 means check every 5 seconds
            task = r.blpop(QUEUE_NAME, timeout=5)

            if task:
                queue, raw_data = task
                try:
                    job_data = json.loads(raw_data)
                    logger.info(
                        f"Job received for meeting_id: {job_data.get('id')}")
                    process_meeting_job(job_data)
                except json.JSONDecodeError:
                    logger.error(f"Failed to decode JSON: {raw_data}")
        except KeyboardInterrupt:
            # This should be caught by signal handler, but just in case
            break
        except Exception as e:
            if not shutdown_flag:
                logger.error(f"Error in consumer loop: {e}")

    logger.info("👋 Consumer stopped gracefully")


if __name__ == "__main__":
    start_consumer()
