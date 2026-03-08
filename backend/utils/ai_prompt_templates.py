def get_analysis_prompt(subject, sender, body):
    return f"""
    Analyze the following email and return a JSON object with:
    1. "summary": A 2-sentence concise summary.
    2. "tasks": A list of extracted actionable tasks. Each task should be: {{"title": "", "description": "", "due_date": "YYYY-MM-DD or null", "priority": "low|medium|high"}}
    3. "priority": Determine priority (high|medium|low) based on sender importance, deadlines, meeting mentions, and action requests.
    4. "sentiment": Either "positive", "neutral", or "negative".
    5. "key_points": A list of strings representing main points.
    6. "meeting_detected": Boolean (true if a meeting request, calendar invite, or scheduling discussion is found).
    7. "meeting_info": If meeting_detected is true, provide: {{"title": "", "time": "", "location": "", "participants": []}}.
    8. "requires_followup": Boolean (true if the email asks a question or requires a response).
    9. "followup_deadline": A relative time string like "24 hours", "2 days", etc., if a follow-up is needed.

    Email:
    Subject: {subject}
    Sender: {sender}
    Body: {body}

    Return ONLY the JSON.
    """

def get_reply_prompt(original_email):
    return f"""
    You are an AI executive assistant. Write a professional and polite reply to the following email.
    The reply should be concise and address any questions or action items mentioned in the original email.

    Original Email:
    {original_email}

    Reply:
    """
