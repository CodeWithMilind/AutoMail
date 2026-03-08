import os
import json
import ollama
import time
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SETTINGS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "settings.json")

def get_settings():
    if not os.path.exists(SETTINGS_FILE):
        default_settings = {
            "llm_provider": "ollama",
            "groq_api_key": os.getenv("GROQ_API_KEY", ""),
            "ollama_model": "llama3",
            "groq_model": "llama-3.1-8b-instant"
        }
        save_settings(default_settings)
        return default_settings
    
    with open(SETTINGS_FILE, "r") as f:
        return json.load(f)

def save_settings(settings):
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=4)

def ollama_analyze(text, model="llama3"):
    # Truncate text to 2000 characters to keep it fast
    clean_text = text[:2000]
    prompt = f"""
    Analyze the following email and return a JSON object with:
    1. "summary": A 2-sentence concise summary.
    2. "tasks": A list of extracted actionable tasks or an empty list if none.
    3. "priority": Either "high", "medium", or "low" based on urgency.

    Email:
    {clean_text}

    Return ONLY the JSON.
    """
    try:
        start_time = time.time()
        response = ollama.chat(
            model=model,
            messages=[{"role": "user", "content": prompt}]
        )
        content = response["message"]["content"]
        # Basic JSON extraction from response
        start = content.find("{")
        end = content.rfind("}") + 1
        result = json.loads(content[start:end])
        print(f"Ollama Analysis Time: {time.time() - start_time:.2f}s")
        return result
    except Exception as e:
        print(f"Ollama Error: {e}")
        return None

def groq_analyze(text, api_key, model="llama-3.1-8b-instant"):
    if not api_key:
        print("Groq Error: Missing API Key")
        return None
    
    # Truncate text to 2000 characters to keep it fast
    clean_text = text[:2000]
    client = Groq(api_key=api_key)
    # Ensure model has a fallback
    model = model or "llama-3.1-8b-instant"
    prompt = f"""
    Analyze the following email and return a JSON object with:
    1. "summary": A 2-sentence concise summary.
    2. "tasks": A list of extracted actionable tasks or an empty list if none.
    3. "priority": Either "high", "medium", or "low" based on urgency.

    Email:
    {clean_text}

    Return ONLY the JSON.
    """
    try:
        start_time = time.time()
        # Adding a timeout of 8 seconds to prevent hanging
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            timeout=8.0 
        )
        result = json.loads(response.choices[0].message.content)
        print(f"Groq Analysis Time ({model}): {time.time() - start_time:.2f}s")
        return result
    except Exception as e:
        print(f"Groq Error: {e}")
        return None

def generate_ai_analysis(text):
    settings = get_settings()
    provider = settings.get("llm_provider", "ollama")
    print(f"--- Active AI Provider: {provider} ---")
    
    analysis = None
    if provider == "groq":
        analysis = groq_analyze(
            text, 
            settings.get("groq_api_key") or os.getenv("GROQ_API_KEY"), 
            settings.get("groq_model", "llama-3.1-8b-instant")
        )
    else:
        analysis = ollama_analyze(
            text, 
            settings.get("ollama_model", "llama3")
        )
    
    # Fallback structure if LLM fails or times out
    if not analysis:
        print("AI analysis failed or timed out. Returning fallback.")
        return {
            "summary": "Analysis unavailable. Please try again later.",
            "tasks": [],
            "priority": "medium"
        }
    
    return analysis
