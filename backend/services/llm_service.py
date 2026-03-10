import os
import json
import ollama
import time
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SETTINGS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "settings.json")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def get_settings():
    if not os.path.exists(SETTINGS_FILE):
        default_settings = {
            "llm_provider": "groq",
            "groq_api_key": GROQ_API_KEY or "",
            "ollama_model": "llama3",
            "groq_model": "llama3-70b-8192"
        }
        save_settings(default_settings)
        return default_settings
    
    with open(SETTINGS_FILE, "r") as f:
        return json.load(f)

def save_settings(settings):
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=4)

def ollama_analyze(text, model="llama3"):
    clean_text = text[:2000]
    prompt = f"""
    Analyze the following email and return a JSON object with:
    1. "summary": A 2-sentence concise summary.
    2. "tasks": A list of extracted actionable tasks. Each task should be: {{"title": "", "description": "", "due_date": "YYYY-MM-DD or null", "priority": "low|medium|high"}}
    3. "priority": Determine priority (high|medium|low) based on sender importance, deadlines, meeting mentions, and action requests.
    4. "sentiment": Either "positive", "neutral", or "negative".
    5. "key_points": A list of strings representing main points.
    6. "is_meeting_related": Boolean (true if a meeting request, calendar invite, or scheduling discussion is found).
    7. "meeting_info": If is_meeting_related is true, provide: {{"title": "", "time": "", "location": "", "participants": []}}.
    8. "requires_followup": Boolean (true if the email asks a question or requires a response).
    9. "followup_deadline": A relative time string like "24 hours", "2 days", etc., if a follow-up is needed.

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
        start = content.find("{")
        end = content.rfind("}") + 1
        result = json.loads(content[start:end])
        print(f"Ollama Analysis Time: {time.time() - start_time:.2f}s")
        return result
    except Exception as e:
        print(f"Ollama Error: {e}")
        return None

def groq_analyze(text, api_key, model="llama3-70b-8192"):
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set. Add it to backend/.env")
    
    clean_text = text[:2000]
    client = Groq(api_key=api_key)
    model = model or "llama3-70b-8192"
    
    try:
        start_time = time.time()
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI executive assistant that analyzes emails. Return ONLY valid JSON."
                },
                {
                    "role": "user",
                    "content": f"""Analyze this email and return JSON only:
{{
  "summary": "A 2-sentence concise summary.",
  "priority": "low|medium|high",
  "tasks": [
    {{
      "title": "Task name",
      "description": "Short description",
      "due_date": "YYYY-MM-DD or null",
      "priority": "low|medium|high"
    }}
  ],
  "sentiment": "positive|neutral|negative",
  "key_points": ["Point 1", "Point 2"],
  "is_meeting_related": true/false,
  "meeting_info": {{"title": "", "time": "", "location": "", "participants": []}},
  "requires_followup": true/false,
  "followup_deadline": "24 hours|2 days|null"
}}

Email content:
{clean_text}
"""
                }
            ],
            response_format={"type": "json_object"},
            timeout=10.0
        )
        content = response.choices[0].message.content
        result = json.loads(content)
        print(f"Groq Analysis Time ({model}): {time.time() - start_time:.2f}s")
        return result
    except Exception as e:
        print(f"Groq Error: {e}")
        return None

def generate_ai_analysis(text):
    settings = get_settings()
    provider = settings.get("llm_provider", "groq")
    print(f"--- Active AI Provider: {provider} ---")
    
    analysis = None
    if provider == "groq":
        analysis = groq_analyze(
            text, 
            settings.get("groq_api_key") or GROQ_API_KEY, 
            settings.get("groq_model", "llama3-70b-8192")
        )
    else:
        analysis = ollama_analyze(
            text, 
            settings.get("ollama_model", "llama3")
        )
    
    if not analysis:
        print("AI analysis failed or timed out. Returning fallback.")
        return {
            "summary": "Analysis unavailable. Please check your API key and provider settings.",
            "tasks": [],
            "priority": "medium",
            "sentiment": "neutral",
            "key_points": [],
            "is_meeting_related": False,
            "meeting_info": None,
            "requires_followup": False,
            "followup_deadline": None
        }
    
    return analysis
