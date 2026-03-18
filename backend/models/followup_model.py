from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class Followup(Base):
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(String, index=True)
    reminder_time = Column(DateTime)
    status = Column(String, default="pending") # pending, completed
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
