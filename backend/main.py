import os
import json
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from ai_engine import generate_email_reply, generate_ai_summary
from services.llm_service import generate_ai_analysis, get_settings, save_settings
from services.db_service import get_db, create_task, get_tasks, update_task, delete_task, save_analyzed_email, AnalyzedEmail, Task, create_meeting, create_followup, get_meetings, get_pending_followups
from services.gmail_service import fetch_latest_emails
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks
from auth import oauth
import requests
import time
import base64
from datetime import datetime, timedelta, date
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Auto Email AI Assistant Backend")

# --- Utility Functions ---

def decode_base64_url(data):
    if not data: return ""
    try:
        return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
    except:
        return ""

def get_email_body(payload):
    def find_text_part(part):
        if part.get("mimeType") == "text/plain":
            return decode_base64_url(part.get("body", {}).get("data", ""))
        if "parts" in part:
            for subpart in part["parts"]:
                text = find_text_part(subpart)
                if text: return text
        return ""
    
    body = find_text_part(payload)
    if not body and "body" in payload:
        body = decode_base64_url(payload.get("body", {}).get("data", ""))
    return body

def process_email_analysis(email_id: str, access_token: str, db: Session):
    """
    Background task to analyze an email if not already analyzed.
    """
    try:
        # Check if already analyzed
        existing = db.query(AnalyzedEmail).filter(AnalyzedEmail.id == email_id).first()
        if existing:
            return

        # Fetch full email
        url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{email_id}?format=full"
        res = requests.get(url, headers={"Authorization": f"Bearer {access_token}"})
        if not res.ok: return
        
        data = res.json()
        headers = data.get("payload", {}).get("headers", [])
        sender = next((h["value"] for h in headers if h["name"] == "From"), "Unknown Sender")
        subject = next((h["value"] for h in headers if h["name"] == "Subject"), "No Subject")
        snippet = data.get("snippet", "")
        body = get_email_body(data.get("payload", {})) or snippet
        
        # AI Analysis
        analysis = generate_ai_analysis(body[:2000])
        
        # Save Analyzed Email
        save_analyzed_email(db, {
            "id": email_id,
            "sender": sender,
            "subject": subject,
            "summary": analysis.get("summary", snippet),
            "priority": analysis.get("priority", "medium"),
            "sentiment": analysis.get("sentiment", "neutral"),
            "key_points": json.dumps(analysis.get("key_points", [])),
            "meeting_detected": analysis.get("is_meeting_related", False),
            "requires_followup": analysis.get("requires_followup", False),
            "followup_deadline": analysis.get("followup_deadline"),
            "timestamp": datetime.utcnow()
        })
        
        # Save Meeting if detected
        if analysis.get("is_meeting_related"):
            meeting_info = analysis.get("meeting_info", {})
            create_meeting(db, {
                "email_id": email_id,
                "title": meeting_info.get("title") or f"Meeting: {subject}",
                "datetime": meeting_info.get("time"),
                "location": meeting_info.get("location"),
                "participants": json.dumps(meeting_info.get("participants", []))
            })

        # Save Follow-up if detected
        if analysis.get("requires_followup"):
            deadline_str = analysis.get("followup_deadline", "24 hours")
            # Basic parsing for relative time
            hours = 24
            if "hour" in deadline_str:
                try: hours = int(deadline_str.split()[0])
                except: pass
            elif "day" in deadline_str:
                try: hours = int(deadline_str.split()[0]) * 24
                except: pass
            
            create_followup(db, {
                "email_id": email_id,
                "reminder_time": datetime.utcnow() + timedelta(hours=hours),
                "status": "pending"
            })
        
        # Save Tasks
        extracted_tasks = analysis.get("tasks", [])
        for task_info in extracted_tasks:
            title = task_info.get("title") if isinstance(task_info, dict) else str(task_info)
            description = task_info.get("description", "") if isinstance(task_info, dict) else ""
            priority = task_info.get("priority", analysis.get("priority", "medium")) if isinstance(task_info, dict) else analysis.get("priority", "medium")
            due_date_str = task_info.get("due_date")
            
            due_date = None
            if due_date_str:
                try:
                    due_date = datetime.strptime(due_date_str, "%Y-%m-%d")
                except:
                    pass
            
            if title:
                create_task(db, {
                    "title": title,
                    "description": description,
                    "email_id": email_id,
                    "email_sender": sender,
                    "priority": priority,
                    "status": "pending",
                    "due_date": due_date
                })
        print(f"Successfully auto-analyzed email: {email_id}")
    except Exception as e:
        print(f"Error in background analysis for {email_id}: {e}")

# --- API Endpoints ---

# Secret key for SessionMiddleware
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend is running"}

# Auth routes
@app.get("/auth/google")
async def login_google(request: Request):
    redirect_uri = os.getenv("REDIRECT_URI", "http://localhost:8000/auth/callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/callback")
async def auth_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user = token.get('userinfo')
        if user:
            # For simplicity, we redirect back to the frontend dashboard
            # In a real app, you would store session/cookie here
            frontend_dashboard_url = "http://localhost:3000/dashboard"
            return RedirectResponse(url=frontend_dashboard_url)
        return {"error": "Failed to get user info"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/auth/user")
async def get_user(request: Request):
    # This is a placeholder for session-based user retrieval
    # For now, it could return dummy data or be implemented with JWT/Sessions
    return {"email": "user@example.com", "name": "Google User"}

class SettingsUpdate(BaseModel):
    llm_provider: str
    groq_api_key: str = None
    ollama_model: str = None
    groq_model: str = None

@app.get("/settings")
async def get_app_settings():
    return get_settings()

@app.post("/settings")
async def update_app_settings(settings: SettingsUpdate):
    current_settings = get_settings()
    new_settings = settings.dict(exclude_unset=True)
    current_settings.update(new_settings)
    save_settings(current_settings)
    return current_settings

# Task routes
class TaskCreate(BaseModel):
    title: str
    description: str = None
    email_id: str = None
    email_sender: str = None
    priority: str = "medium"
    status: str = "pending"

class TaskUpdate(BaseModel):
    priority: str = None
    status: str = None
    title: str = None
    description: str = None

@app.get("/tasks")
async def fetch_tasks(status: str = None, db: Session = Depends(get_db)):
    return get_tasks(db, status)

@app.post("/tasks")
async def add_task(task: TaskCreate, db: Session = Depends(get_db)):
    return create_task(db, task.dict())

@app.patch("/tasks/{task_id}")
async def patch_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    updated = update_task(db, task_id, task.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated

@app.delete("/tasks/{task_id}")
async def remove_task(task_id: int, db: Session = Depends(get_db)):
    if not delete_task(db, task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}

class AnalyzeEmailRequest(BaseModel):
    email_id: str
    subject: str = None
    body: str = None
    sender: str = None

@app.post("/analyze-email")
async def analyze_single_email(request_data: AnalyzeEmailRequest, db: Session = Depends(get_db)):
    """
    Manually trigger AI analysis for a single email.
    """
    email_id = request_data.email_id
    
    # Check cache
    analyzed = db.query(AnalyzedEmail).filter(AnalyzedEmail.id == email_id).first()
    if analyzed:
        return {"status": "cached", "id": email_id}
    
    # If content not provided, we might need to fetch it, but user prompt implies sending it
    if not request_data.body:
        raise HTTPException(status_code=400, detail="Email body is required for analysis")
    
    analysis = generate_ai_analysis(request_data.body)
    
    # Save results
    save_analyzed_email(db, {
        "id": email_id,
        "sender": request_data.sender or "Unknown Sender",
        "subject": request_data.subject or "No Subject",
        "summary": analysis.get("summary", ""),
        "priority": analysis.get("priority", "medium"),
        "sentiment": analysis.get("sentiment", "neutral"),
        "key_points": json.dumps(analysis.get("key_points", [])),
        "meeting_detected": analysis.get("is_meeting_related", False),
        "timestamp": datetime.utcnow()
    })
    
    # Save tasks
    extracted_tasks = analysis.get("tasks", [])
    for task_info in extracted_tasks:
        title = task_info.get("title") if isinstance(task_info, dict) else str(task_info)
        description = task_info.get("description", "") if isinstance(task_info, dict) else ""
        priority = task_info.get("priority", analysis.get("priority", "medium")) if isinstance(task_info, dict) else analysis.get("priority", "medium")
        due_date_str = task_info.get("due_date") if isinstance(task_info, dict) else analysis.get("meeting_date")
        
        due_date = None
        if due_date_str:
            try: due_date = datetime.strptime(due_date_str, "%Y-%m-%d")
            except: pass

        if title:
            create_task(db, {
                "title": title,
                "description": description,
                "email_id": email_id,
                "email_sender": request_data.sender,
                "priority": priority,
                "status": "pending",
                "due_date": due_date
            })
            
    return {"status": "success", "id": email_id, "analysis": analysis}

class AnalyzeEmailsRequest(BaseModel):
    email_ids: list[str]

@app.post("/api/analyze-emails")
async def analyze_emails_endpoint(request_data: AnalyzeEmailsRequest, request: Request, db: Session = Depends(get_db)):
    """
    Process specific emails and run AI analysis on them.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: Missing or invalid token")
    
    access_token = auth_header.split(" ")[1]
    results = []
    
    for email_id in request_data.email_ids:
        try:
            # Re-use the background analysis logic synchronously for this endpoint
            process_email_analysis(email_id, access_token, db)
            results.append({"id": email_id, "status": "success"})
        except Exception as e:
            results.append({"id": email_id, "status": "error", "message": str(e)})
            
    return {"results": results}

# Dashboard and AI Insights
@app.get("/api/dashboard")
async def get_dashboard_stats(request: Request, db: Session = Depends(get_db)):
    # Get current time for filtering
    now = datetime.utcnow()
    today_start = datetime.combine(date.today(), datetime.min.time())
    
    # 1. Emails Today (Real count from analyzed emails table)
    emails_today = db.query(AnalyzedEmail).filter(AnalyzedEmail.timestamp >= today_start).count()
    
    # 2. Tasks Extracted (Total tasks)
    tasks_extracted = db.query(Task).count()
    
    # 3. High Priority Pending Tasks
    high_priority_tasks = db.query(Task).filter(Task.priority == "high", Task.status == "pending").count()
    
    # 4. Meetings Scheduled (Count emails where meeting_detected is True)
    meetings_scheduled = db.query(AnalyzedEmail).filter(AnalyzedEmail.meeting_detected == True, AnalyzedEmail.timestamp >= today_start).count()
    
    # 5. Weekly Activity
    weekly_activity = []
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    current_day_idx = now.weekday() 
    
    for i in range(7):
        day_date = today_start - timedelta(days=(current_day_idx - i))
        day_end = day_date + timedelta(days=1)
        
        task_count = db.query(Task).filter(Task.created_at >= day_date, Task.created_at < day_end).count()
        email_count = db.query(AnalyzedEmail).filter(AnalyzedEmail.timestamp >= day_date, AnalyzedEmail.timestamp < day_end).count()
        
        weekly_activity.append({
            "day": days[i],
            "emails": email_count,
            "tasks": task_count
        })
        
    return {
        "emails_today": emails_today,
        "tasks_extracted": tasks_extracted,
        "high_priority_tasks": high_priority_tasks,
        "meetings_scheduled": meetings_scheduled,
        "weekly_activity": weekly_activity
    }

@app.get("/api/ai-insights")
async def get_ai_insights(db: Session = Depends(get_db)):
    insights = []
    
    # 1. High priority pending tasks
    high_tasks = db.query(Task).filter(Task.priority == "high", Task.status == "pending").order_by(Task.created_at.desc()).all()
    if high_tasks:
        insights.append({
            "type": "warning",
            "message": f"Critical: {high_tasks[0].title} needs your attention",
            "time": "Just now"
        })
    
    # 2. Follow-up reminders
    pending_followups = db.query(Followup).filter(Followup.status == "pending").all()
    for fu in pending_followups:
        # Get email subject for context
        analyzed = db.query(AnalyzedEmail).filter(AnalyzedEmail.id == fu.email_id).first()
        if analyzed:
            insights.append({
                "type": "task",
                "message": f"Follow-up needed for: {analyzed.subject}",
                "time": "Reminder"
            })
    
    # 3. Meetings detected
    recent_meetings = db.query(Meeting).order_by(Meeting.created_at.desc()).limit(3).all()
    for m in recent_meetings:
        insights.append({
            "type": "calendar",
            "message": f"New Meeting: {m.title} at {m.datetime}",
            "time": "Scheduled"
        })
    
    # 4. Daily task summary
    today_start = datetime.combine(datetime.utcnow().date(), datetime.min.time())
    tasks_today = db.query(Task).filter(Task.created_at >= today_start).count()
    if tasks_today > 0:
        insights.append({
            "type": "success",
            "message": f"AI detected {tasks_today} actionable tasks today",
            "time": "Updated"
        })
        
    return insights

@app.get("/api/meetings")
async def fetch_meetings(db: Session = Depends(get_db)):
    return get_meetings(db)

@app.get("/api/followups")
async def fetch_followups(db: Session = Depends(get_db)):
    return get_pending_followups(db)

@app.get("/api/emails")
async def get_emails_api(limit: int = 10, db: Session = Depends(get_db)):
    """
    Fetch latest emails from Gmail and enrich with analysis data from DB.
    """
    emails, error = fetch_latest_emails(limit=limit)
    if error == "gmail_auth_required":
        return {"error": "gmail_auth_required"}
    if error:
        raise HTTPException(status_code=500, detail=error)
    
    # Enrich with DB data
    for email in emails:
        analyzed = db.query(AnalyzedEmail).filter(AnalyzedEmail.id == email["id"]).first()
        if analyzed:
            email["priority"] = analyzed.priority
            email["is_meeting_related"] = analyzed.meeting_detected
            email["tasks_extracted"] = db.query(Task).filter(Task.email_id == email["id"]).count()
            email["ai_summary"] = analyzed.summary
        else:
            email["priority"] = "medium"
            email["tasks_extracted"] = 0
            email["ai_summary"] = email.get("snippet", "")
            
    # Sort: High priority first
    priority_map = {"high": 0, "medium": 1, "low": 2}
    emails.sort(key=lambda x: priority_map.get(x.get("priority", "medium"), 1))
    
    return emails

@app.get("/auth/gmail/login")
async def gmail_login():
    """
    Initiate Gmail OAuth2 flow.
    """
    from google_auth_oauthlib.flow import Flow
    
    client_config = {
        "web": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost:8000/auth/gmail/callback"],
        }
    }
    
    flow = Flow.from_client_config(
        client_config,
        scopes=['https://www.googleapis.com/auth/gmail.readonly']
    )
    flow.redirect_uri = "http://localhost:8000/auth/gmail/callback"
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    
    return RedirectResponse(authorization_url)

@app.get("/auth/gmail/callback")
async def gmail_callback(request: Request):
    """
    Handle Gmail OAuth2 callback and save token.json.
    """
    from google_auth_oauthlib.flow import Flow
    
    client_config = {
        "web": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost:8000/auth/gmail/callback"],
        }
    }
    
    flow = Flow.from_client_config(
        client_config,
        scopes=['https://www.googleapis.com/auth/gmail.readonly']
    )
    flow.redirect_uri = "http://localhost:8000/auth/gmail/callback"
    
    code = request.query_params.get('code')
    if not code:
        return {"error": "No code provided"}
        
    flow.fetch_token(code=code)
    creds = flow.credentials
    
    with open('token.json', 'w') as token:
        token.write(creds.to_json())
        
    return RedirectResponse(url="http://localhost:3000/dashboard")

@app.get("/gmail/emails")
async def get_gmail_emails(request: Request, background_tasks: BackgroundTasks, pageToken: str = None, db: Session = Depends(get_db)):
    """
    Fetch latest emails from Gmail using the backend gmail_service.
    Triggers background analysis for new emails.
    """
    emails, error = fetch_latest_emails(limit=10)
    if error == "gmail_auth_required":
        return {"error": "gmail_auth_required"}
    if error:
        raise HTTPException(status_code=500, detail=error)
    
    # 2. Check analysis status and trigger background tasks
    for email in emails:
        # Check if already analyzed
        analyzed = db.query(AnalyzedEmail).filter(AnalyzedEmail.id == email["id"]).first()
        email["is_analyzed"] = analyzed is not None
        
        # 3. Trigger background analysis if not analyzed
        if not analyzed:
            # Note: process_email_analysis needs an access_token. 
            # We can get it from our backend creds.
            from services.gmail_service import get_gmail_service
            service, _ = get_gmail_service()
            if service:
                access_token = service._http.credentials.token
                background_tasks.add_task(process_email_analysis, email["id"], access_token, db)
            
    return {
        "emails": emails,
        "nextPageToken": None # The fetch_latest_emails doesn't support pageToken yet
    }

@app.get("/gmail/emails/{email_id}")
async def get_email_detail(email_id: str, request: Request, db: Session = Depends(get_db)):
    """
    Fetch full email body and return AI summary.
    Uses backend-managed gmail_service.
    """
    from services.gmail_service import get_gmail_service
    service, error = get_gmail_service()
    if error == "gmail_auth_required":
        return {"error": "gmail_auth_required"}
    if error:
        raise HTTPException(status_code=500, detail=error)
    
    try:
        # Check for pre-analyzed data
        analyzed = db.query(AnalyzedEmail).filter(AnalyzedEmail.id == email_id).first()
        
        # Always fetch message for display
        msg = service.users().messages().get(userId='me', id=email_id).execute()
        
        payload = msg.get('payload', {})
        headers = payload.get('headers', [])
        sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), 'Unknown Sender')
        subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
        date_str = next((h['value'] for h in headers if h['name'].lower() == 'date'), 'Unknown Date')
        snippet = msg.get('snippet', "")
        body = get_email_body(payload) or snippet

        if analyzed:
            summary = analyzed.summary
            priority = analyzed.priority
            sentiment = analyzed.sentiment
            key_points = json.loads(analyzed.key_points) if analyzed.key_points else []
            tasks_list = db.query(Task).filter(Task.email_id == email_id).all()
            return {
                "id": email_id,
                "sender": sender,
                "subject": subject,
                "date": date_str,
                "body": body,
                "ai_summary": summary,
                "sentiment": sentiment,
                "key_points": key_points,
                "tasks": [{"title": t.title, "priority": t.priority, "description": t.description, "due_date": t.due_date} for t in tasks_list],
                "priority": priority,
                "is_meeting_related": analyzed.meeting_detected
            }
        
        # If not pre-analyzed, analyze now
        analysis = generate_ai_analysis(body[:2000])
        
        # Save analysis result
        save_analyzed_email(db, {
            "id": email_id,
            "sender": sender,
            "subject": subject,
            "summary": analysis.get("summary", snippet),
            "priority": analysis.get("priority", "medium"),
            "sentiment": analysis.get("sentiment", "neutral"),
            "key_points": json.dumps(analysis.get("key_points", [])),
            "meeting_detected": analysis.get("is_meeting_related", False),
            "timestamp": datetime.utcnow()
        })
        
        # Save tasks
        extracted_tasks = analysis.get("tasks", [])
        for task_info in extracted_tasks:
            title = task_info.get("title") if isinstance(task_info, dict) else str(task_info)
            description = task_info.get("description", "") if isinstance(task_info, dict) else ""
            priority = task_info.get("priority", analysis.get("priority", "medium")) if isinstance(task_info, dict) else analysis.get("priority", "medium")
            due_date_str = task_info.get("due_date") if isinstance(task_info, dict) else analysis.get("meeting_date")
            
            due_date = None
            if due_date_str:
                try: due_date = datetime.strptime(due_date_str, "%Y-%m-%d")
                except: pass

            if title:
                create_task(db, {
                    "title": title,
                    "description": description,
                    "email_id": email_id,
                    "email_sender": sender,
                    "priority": priority,
                    "status": "pending",
                    "due_date": due_date
                })

        return {
            "id": email_id,
            "sender": sender,
            "subject": subject,
            "date": date_str,
            "body": body,
            "ai_summary": analysis.get("summary", snippet),
            "sentiment": analysis.get("sentiment", "neutral"),
            "key_points": analysis.get("key_points", []),
            "tasks": analysis.get("tasks", []),
            "priority": analysis.get("priority", "medium"),
            "is_meeting_related": analysis.get("is_meeting_related", False)
        }
        
    except Exception as e:
        print(f"Detail Fetch Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class EmailRequest(BaseModel):
    email: str

class EmailResponse(BaseModel):
    reply: str

@app.post("/generate-email", response_model=EmailResponse)
async def generate_email(request: EmailRequest):
    """
    Endpoint to generate a professional email reply based on input text.
    """
    if not request.email:
        raise HTTPException(status_code=400, detail="Email content cannot be empty")
    
    reply = generate_email_reply(request.email)
    
    if reply.startswith("Error"):
        raise HTTPException(status_code=500, detail=reply)
    
    return EmailResponse(reply=reply)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
