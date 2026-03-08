from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    email_id = Column(String, index=True, nullable=True)
    email_sender = Column(String, nullable=True)
    priority = Column(String, default="medium") # low, medium, high
    status = Column(String, default="pending") # pending, approved, completed
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
