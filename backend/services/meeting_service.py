from sqlalchemy.orm import Session
from models.meeting_model import Meeting
from datetime import datetime
import json

class MeetingService:
    def create_meeting(self, db: Session, meeting_data: dict):
        if 'participants' in meeting_data and isinstance(meeting_data['participants'], list):
            meeting_data['participants'] = json.dumps(meeting_data['participants'])
            
        db_meeting = Meeting(**meeting_data)
        db.add(db_meeting)
        db.commit()
        db.refresh(db_meeting)
        return db_meeting

    def get_meetings(self, db: Session):
        return db.query(Meeting).order_by(Meeting.created_at.desc()).all()

meeting_service = MeetingService()
