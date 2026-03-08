from sqlalchemy import Column, String, Text, Boolean, DateTime
from datetime import datetime
from app.database import Base

class Email(Base):
    __tablename__ = "emails"

    id = Column(String, primary_key=True) # Gmail ID
    gmail_id = Column(String, unique=True, index=True)
    sender = Column(String, index=True)
    subject = Column(String)
    snippet = Column(Text, nullable=True)
    body = Column(Text, nullable=True)
    date = Column(String)
    ai_processed = Column(Boolean, default=False)
    
    # Analysis fields
    summary = Column(Text, nullable=True)
    priority = Column(String, default="medium")
    sentiment = Column(String, default="neutral")
    key_points = Column(Text, nullable=True) # JSON serialized list
    meeting_detected = Column(Boolean, default=False)
    requires_followup = Column(Boolean, default=False)
    followup_deadline = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
