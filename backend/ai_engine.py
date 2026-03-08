import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3"

def generate_email_reply(email_text: str) -> str:
    """
    Sends a prompt to Ollama to generate a professional email reply.
    """
    prompt = f"You are an executive secretary. Write a professional email reply for the following email: {email_text}"
    
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False
    }
    
    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        result = response.json()
        return result.get("response", "Error: No response from AI engine.")
    except requests.exceptions.RequestException as e:
        return f"Error connecting to Ollama: {str(e)}"
