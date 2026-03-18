from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.database import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(String, index=True)
    title = Column(String)
    datetime = Column(String) # Store as string for flexibility from AI
    location = Column(String, nullable=True)
    participants = Column(Text, nullable=True) # JSON serialized list
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
