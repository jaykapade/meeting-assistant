import requests
import logging
import os

logger = logging.getLogger(__name__)


WHISPER_API_URL = "http://localhost:9000"

base_path = os.path.dirname(os.path.abspath(__file__))
logger.info(f"Base path: {base_path}")
# Go one level up from ai-service and into uploads
uploads_base = os.path.abspath(os.path.join(base_path, "..", "uploads"))


def transcribe_audio(file_path: str) -> str:
    url = f"{WHISPER_API_URL}/asr"

    # Join uploads path with file_path (filename or relative path)
    full_file_path = os.path.join(uploads_base, file_path)

    # Verify file exists before sending
    if not os.path.exists(full_file_path):
        raise FileNotFoundError(f"Audio file not found at: {full_file_path}")

    try:
        logger.info(f"Sending audio file to Whisper: {full_file_path}")
        with open(full_file_path, 'rb') as f:
            files = {'audio_file': (full_file_path, f, 'audio/mpeg')}
            response = requests.post(url, files=files, timeout=300)

        response.raise_for_status()
        result = response.text
        logger.info(f"Transcription result: {result}")
        return result

    except Exception as e:
        logger.error(f"Transcription service failed: {e}")
        raise e
