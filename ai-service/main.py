import os
import json
import time
import redis
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = os.getenv('REDIS_PORT', 6379)
QUEUE_NAME = "meeting_jobs"


def process_meeting_job(job_data):
    meeting_id = job_data.get('meeting_id')
    file_path = job_data.get('file_path')

    logger.info(f"Processing meeting job for meeting {meeting_id}")

    try:
        # 1.Update DB -> processing
        # update_meeting_status(meeting_id, "processing")
        logger.info(f"Status updated to processing for {meeting_id}")

        # 2. Transcribe (Whisper)
        logger.info("🎙️ Starting Transcription...")
        # transcript = transcribe_audio(file_path)
        transcript = "Fake transcript for testing"  # Placeholder
        time.sleep(2)  # Simulate work

        # 3. Summarize (Ollama)
        logger.info("🧠 Generating Summary with Ollama...")
        # summary, action_items = generate_summary(transcript)
        summary = "Fake summary"
        action_items = ["Action 1", "Action 2"]

        # 4. Update DB -> Completed
        # update_meeting_result(meeting_id, transcript, summary, action_items)
        logger.info(f"✅ Job {meeting_id} Completed Successfully")

    except Exception as e:
        logger.error(f"❌ Job Failed: {str(e)}")
        # update_meeting_status(meeting_id, "failed")


def start_consumer():
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

    while True:
        # BLPOP returns a tuple: (queue_name, data)
        # timeout=0 means wait forever
        task = r.blpop(QUEUE_NAME, timeout=0)

        if task:
            queue, raw_data = task
            try:
                job_data = json.loads(raw_data)
                process_job(job_data)
            except json.JSONDecodeError:
                logger.error(f"Failed to decode JSON: {raw_data}")


if __name__ == "__main__":
    start_consumer()
