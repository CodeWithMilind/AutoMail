import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from ai_engine import generate_email_reply
from auth import oauth
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
