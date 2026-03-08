from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.database import get_db
from services.meeting_service import meeting_service
from typing import List

router = APIRouter(prefix="/meetings", tags=["Meetings"])

@router.get("/")
async def fetch_meetings(db: Session = Depends(get_db)):
    return meeting_service.get_meetings(db)

@router.post("/")
async def add_meeting(meeting_data: dict = Body(...), db: Session = Depends(get_db)):
    return meeting_service.create_meeting(db, meeting_data)
