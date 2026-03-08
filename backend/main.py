import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from ai_engine import generate_email_reply, generate_ai_summary
from services.llm_service import generate_ai_analysis, get_settings, save_settings
from services.db_service import get_db, create_task, get_tasks, update_task, delete_task
from sqlalchemy.orm import Session
from fastapi import Depends
from auth import oauth
import requests
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Auto Email AI Assistant Backend")

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

@app.get("/gmail/emails")
async def get_gmail_emails(request: Request, pageToken: str = None):
    """
    Fetch latest 10 emails from Gmail. Returns metadata only (FAST).
    Supports pagination with pageToken.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: Missing or invalid token")
    
    access_token = auth_header.split(" ")[1]
    
    try:
        # 1. Fetch message IDs (Limit to 10 for pagination)
        list_url = "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10"
        if pageToken:
            list_url += f"&pageToken={pageToken}"
            
        list_res = requests.get(list_url, headers={"Authorization": f"Bearer {access_token}"})
        list_res.raise_for_status()
        list_data = list_res.json()
        
        messages = list_data.get("messages", [])
        nextPageToken = list_data.get("nextPageToken")
        
        # 2. Fetch metadata for each message (Sender, Subject, Date, Snippet)
        email_list = []
        for msg in messages:
            detail_url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg['id']}?format=metadata"
            detail_res = requests.get(detail_url, headers={"Authorization": f"Bearer {access_token}"})
            if not detail_res.ok:
                continue
                
            detail_data = detail_res.json()
            headers = detail_data.get("payload", {}).get("headers", [])
            
            sender = next((h["value"] for h in headers if h["name"] == "From"), "Unknown Sender")
            subject = next((h["value"] for h in headers if h["name"] == "Subject"), "No Subject")
            date = next((h["value"] for h in headers if h["name"] == "Date"), "Unknown Date")
            snippet = detail_data.get("snippet", "")
            
            email_list.append({
                "id": msg["id"],
                "sender": sender,
                "subject": subject,
                "snippet": snippet,
                "date": date
            })
            
        return {
            "emails": email_list,
            "nextPageToken": nextPageToken
        }
        
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/gmail/emails/{email_id}")
async def get_email_detail(email_id: str, request: Request, db: Session = Depends(get_db)):
    """
    Fetch full email body and generate AI summary on-demand (ONLY when clicked).
    Optimized for speed.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: Missing or invalid token")
    
    access_token = auth_header.split(" ")[1]
    
    try:
        start_total = time.time()
        
        # 1. Fetch full message
        detail_url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{email_id}?format=full"
        detail_res = requests.get(detail_url, headers={"Authorization": f"Bearer {access_token}"})
        detail_res.raise_for_status()
        detail_data = detail_res.json()
        
        headers = detail_data.get("payload", {}).get("headers", [])
        sender = next((h["value"] for h in headers if h["name"] == "From"), "Unknown Sender")
        subject = next((h["value"] for h in headers if h["name"] == "Subject"), "No Subject")
        date = next((h["value"] for h in headers if h["name"] == "Date"), "Unknown Date")
        snippet = detail_data.get("snippet", "")
        
        # 2. Extract and clean body
        body = ""
        payload = detail_data.get("payload", {})
        import base64
        
        def decode_data(data):
            if not data: return ""
            try:
                return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
            except:
                return ""

        def find_text_part(part):
            if part.get("mimeType") == "text/plain":
                return decode_data(part.get("body", {}).get("data", ""))
            if "parts" in part:
                for subpart in part["parts"]:
                    text = find_text_part(subpart)
                    if text: return text
            return ""

        body = find_text_part(payload)
        
        if not body:
            # Fallback to snippet if no text/plain part found
            body = snippet
        
        # Truncate for AI
        clean_body = body[:2000]
        
        # 3. Generate AI Analysis (Summary, Tasks, Priority)
        # This now happens in ONE call inside llm_service
        analysis = generate_ai_analysis(clean_body)

        # 4. Save extracted tasks to database
        extracted_tasks = analysis.get("tasks", [])
        for task_info in extracted_tasks:
            if isinstance(task_info, dict):
                title = task_info.get("title")
                priority = task_info.get("priority", "medium")
            else:
                title = str(task_info)
                priority = "medium"
            
            if title:
                create_task(db, {
                    "title": title,
                    "email_id": email_id,
                    "email_sender": sender,
                    "priority": priority,
                    "status": "pending"
                })

        print(f"Total Detail Fetch + Analysis Time: {time.time() - start_total:.2f}s")

        return {
            "id": email_id,
            "sender": sender,
            "subject": subject,
            "date": date,
            "body": body,
            "ai_summary": analysis.get("summary", snippet),
            "tasks": analysis.get("tasks", []),
            "priority": analysis.get("priority", "medium")
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
