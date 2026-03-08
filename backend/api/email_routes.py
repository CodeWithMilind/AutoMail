from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from services.gmail_service import GmailService
from models.email_model import Email
from typing import List

router = APIRouter(prefix="/gmail/emails", tags=["Emails"])

@router.get("/")
async def get_emails(limit: int = 25, db: Session = Depends(get_db)):
    """
    Fetch latest emails from Gmail and sync with DB.
    """
    # Assuming access token is in session or header for simplicity
    # In production, use session-based auth
    gmail_service = GmailService() # In real app, pass the user's token
    emails_data, error = gmail_service.fetch_latest_emails(limit=limit)
    
    if error == "gmail_auth_required":
        return {"error": "gmail_auth_required"}
    if error:
        raise HTTPException(status_code=500, detail=error)
    
    # Sync with DB
    for data in emails_data:
        existing = db.query(Email).filter(Email.gmail_id == data['id']).first()
        if not existing:
            new_email = Email(**data)
            db.add(new_email)
    
    db.commit()
    
    # Return enriched emails from DB
    return db.query(Email).order_by(Email.date.desc()).limit(limit).all()

@router.get("/{email_id}")
async def get_email_detail(email_id: str, db: Session = Depends(get_db)):
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    
    if not email.body:
        gmail_service = GmailService()
        body = gmail_service.fetch_email_body(email.gmail_id)
        if body:
            email.body = body
            db.commit()
            db.refresh(email)
            
    return email
