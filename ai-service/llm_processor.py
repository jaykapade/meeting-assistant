import requests
import json
import logging
import os
import re

logger = logging.getLogger(__name__)

# Configure Ollama URL from environment variables
OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'localhost')
OLLAMA_PORT = os.getenv('OLLAMA_PORT', '11434')
OLLAMA_URL = f"http://{OLLAMA_HOST}:{OLLAMA_PORT}/api/generate"


def clean_json_text(text):
    """
    Cleans JSON text that might be wrapped in markdown code blocks or have extra whitespace.
    """
    if not text:
        return "{}"

    # Remove markdown code blocks if present
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)

    # Find JSON object/array boundaries
    start_idx = text.find('{')
    if start_idx == -1:
        start_idx = text.find('[')

    if start_idx != -1:
        # Find matching closing brace/bracket
        depth = 0
        end_idx = start_idx
        for i in range(start_idx, len(text)):
            if text[i] == '{' or text[i] == '[':
                depth += 1
            elif text[i] == '}' or text[i] == ']':
                depth -= 1
                if depth == 0:
                    end_idx = i + 1
                    break
        text = text[start_idx:end_idx]

    return text.strip()


def generate_summary(transcript_text):
    """
    Sends transcript to Ollama and expects a JSON response with summary and action items.
    """

    if not transcript_text:
        return {"summary": "No transcript available", "action_items": []}

    prompt = f"""
    You are an expert secretary. Analyze the following meeting transcript.

    1. Write a professional summary (approx 3-5 sentences).
    2. Extract concrete action items (tasks assigned to specific people or general todos).

    Transcript:
    {transcript_text[:12000]}

    (Note: We truncate to 12k chars to avoid hitting context limits on smaller models)

    Output STRICTLY in this JSON format, with no extra text:
    {{
        "summary": "...",
        "action_items": ["...", "..."]
    }}
    """

    payload = {
        "model": "mistral",  # or "llama3"
        "prompt": prompt,
        "format": "json",   # Ollama supports native JSON mode now!
        "stream": False
    }

    try:
        logger.info(
            f"🧠 Sending {len(transcript_text)} chars to Ollama at {OLLAMA_URL}...")

        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()

        result_json = response.json()
        ai_content = result_json.get("response", "")

        # Clean and Parse
        cleaned_json = clean_json_text(ai_content)
        parsed_data = json.loads(cleaned_json)

        return parsed_data

    except json.JSONDecodeError:
        logger.error(
            f"Failed to parse JSON from Ollama. Raw response: {ai_content}")
        # Fallback so the pipeline doesn't crash
        return {
            # Just return raw text as summary
            "summary": ai_content[:500] + "...",
            "action_items": []
        }
    except Exception as e:
        logger.error(f"Ollama service failed: {e}")
        return {"summary": "Error generating summary", "action_items": []}
