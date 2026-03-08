from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from services.ai_service import ai_service
from models.email_model import Email
from utils.email_cleaner import clean_email_body

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/analyze-email")
async def analyze_email(email_id: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """
    Manually trigger AI analysis for a single email.
    """
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    
    if not email.body:
        # Should have body before analysis
        return {"error": "Email body missing, please fetch it first"}
        
    cleaned_body = clean_email_body(email.body)
    analysis = ai_service.analyze_email(email.subject, email.sender, cleaned_body)
    
    if analysis:
        # Update email model
        email.summary = analysis.get("summary", "")
        email.priority = analysis.get("priority", "medium")
        email.sentiment = analysis.get("sentiment", "neutral")
        email.key_points = str(analysis.get("key_points", []))
        email.meeting_detected = analysis.get("meeting_detected", False)
        email.requires_followup = analysis.get("requires_followup", False)
        email.followup_deadline = analysis.get("followup_deadline")
        email.ai_processed = True
        
        db.commit()
        db.refresh(email)
        return {"status": "success", "analysis": analysis}
        
    return {"status": "error", "message": "AI analysis failed"}

@router.post("/generate-reply")
async def generate_reply(email_id: str = Body(..., embed=True), db: Session = Depends(get_db)):
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email or not email.body:
        raise HTTPException(status_code=404, detail="Email body not found")
        
    reply = ai_service.generate_reply(email.body[:2000])
    return {"reply": reply}
