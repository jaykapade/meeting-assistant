import requests
import json

OLLAMA_URL = "http://ollama:11434/api/generate"  # 'ollama' is the container name


def generate_summary(transcript_text):
    prompt = f"""
    You are a professional meeting assistant. 
    Summarize the following meeting transcript and extract key action items.
    
    Transcript:
    {transcript_text}
    
    Output JSON format: {{ "summary": "...", "action_items": ["...", "..."] }}
    """

    payload = {
        "model": "mistral",  # or "llama3"
        "prompt": prompt,
        "format": "json",   # Ollama supports native JSON mode now!
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=payload)
    response.raise_for_status()

    result = response.json()
    # Parse the actual text response from Ollama
    return json.loads(result["response"])
