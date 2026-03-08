import json
import ollama
import time
from groq import Groq
from app.config import settings
from utils.ai_prompt_templates import get_analysis_prompt, get_reply_prompt

class AIService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.groq_api_key = settings.GROQ_API_KEY
        self.groq_model = settings.GROQ_MODEL
        self.ollama_model = settings.OLLAMA_MODEL
        self.groq_client = Groq(api_key=self.groq_api_key) if self.groq_api_key else None

    def analyze_email(self, subject, sender, body):
        prompt = get_analysis_prompt(subject, sender, body)
        
        if self.provider == "groq" and self.groq_client:
            return self._groq_analyze(prompt)
        else:
            return self._ollama_analyze(prompt)

    def generate_reply(self, original_email):
        prompt = get_reply_prompt(original_email)
        
        if self.provider == "groq" and self.groq_client:
            return self._groq_generate(prompt)
        else:
            return self._ollama_generate(prompt)

    def _groq_analyze(self, prompt):
        try:
            response = self.groq_client.chat.completions.create(
                model=self.groq_model,
                messages=[
                    {"role": "system", "content": "You are an AI executive assistant. Return ONLY valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                timeout=10.0
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Groq Analyze Error: {e}")
            return None

    def _ollama_analyze(self, prompt):
        try:
            response = ollama.chat(
                model=self.ollama_model,
                messages=[{"role": "user", "content": prompt}]
            )
            content = response["message"]["content"]
            start = content.find("{")
            end = content.rfind("}") + 1
            return json.loads(content[start:end])
        except Exception as e:
            print(f"Ollama Analyze Error: {e}")
            return None

    def _groq_generate(self, prompt):
        try:
            response = self.groq_client.chat.completions.create(
                model=self.groq_model,
                messages=[{"role": "user", "content": prompt}],
                timeout=10.0
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Groq Generate Error: {e}")
            return "Error generating AI reply."

    def analyze_batch(self, batch_data: list):
        """
        batch_data: list of dicts with {id, subject, sender, body}
        """
        prompt = "Analyze these 10 emails and return a JSON list of objects. Each object must have: {id, summary, priority, sentiment, tasks, meeting_detected, meeting_info, requires_followup, followup_deadline}.\n\n"
        for i, email in enumerate(batch_data):
            prompt += f"--- Email {i+1} (ID: {email['id']}) ---\n"
            prompt += f"Subject: {email['subject']}\nSender: {email['sender']}\nBody: {email['body'][:1000]}\n\n"
        
        prompt += "Return ONLY the JSON list."
        
        if self.provider == "groq" and self.groq_client:
            return self._groq_analyze_batch(prompt)
        else:
            return self._ollama_analyze_batch(prompt)

    def _groq_analyze_batch(self, prompt):
        try:
            response = self.groq_client.chat.completions.create(
                model=self.groq_model,
                messages=[
                    {"role": "system", "content": "You are an AI executive assistant. Return ONLY valid JSON list."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}, # Groq supports this, but for list it's better to wrap in an object
                timeout=30.0
            )
            content = response.choices[0].message.content
            data = json.loads(content)
            return data.get("emails") if isinstance(data, dict) else data
        except Exception as e:
            print(f"Groq Batch Analyze Error: {e}")
            return None

    def _ollama_analyze_batch(self, prompt):
        try:
            response = ollama.chat(
                model=self.ollama_model,
                messages=[{"role": "user", "content": prompt}]
            )
            content = response["message"]["content"]
            start = content.find("[")
            end = content.rfind("]") + 1
            return json.loads(content[start:end])
        except Exception as e:
            print(f"Ollama Batch Analyze Error: {e}")
            return None

ai_service = AIService()
