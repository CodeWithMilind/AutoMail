from services.llm_service import generate_ai_analysis

def generate_ai_summary(email_body: str) -> str:
    """
    Backward compatibility wrapper for AI summary.
    """
    analysis = generate_ai_analysis(email_body)
    return analysis.get("summary", "")

def generate_email_reply(email_text: str) -> str:
    """
    Sends a prompt to the active LLM to generate a professional email reply.
    """
    # This could also be moved to llm_service for full provider support
    # For now, keeping it simple as it's a specific task.
    # TODO: Refactor this into llm_service.py for better provider abstraction
    from services.llm_service import get_settings, ollama_analyze, groq_analyze
    import ollama
    from groq import Groq
    import os

    settings = get_settings()
    provider = settings.get("llm_provider", "ollama")
    prompt = f"You are an executive secretary. Write a professional email reply for the following email: {email_text[:2000]}"

    try:
        if provider == "groq":
            api_key = settings.get("groq_api_key") or os.getenv("GROQ_API_KEY")
            client = Groq(api_key=api_key)
            response = client.chat.completions.create(
                model=settings.get("groq_model", "llama-3.3-70b-versatile"),
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        else:
            response = ollama.chat(
                model=settings.get("ollama_model", "llama3"),
                messages=[{"role": "user", "content": prompt}]
            )
            return response["message"]["content"]
    except Exception as e:
        return f"Error generating reply: {str(e)}"
