from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database Setup
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "automail.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Email Model (New)
class AnalyzedEmail(Base):
    __tablename__ = "analyzed_emails"

    id = Column(String, primary_key=True) # Gmail ID
    sender = Column(String, index=True)
    subject = Column(String)
    summary = Column(Text, nullable=True)
    priority = Column(String, default="medium")
    sentiment = Column(String, default="neutral")
    key_points = Column(Text, nullable=True) # JSON serialized list
    meeting_detected = Column(Boolean, default=False)
    requires_followup = Column(Boolean, default=False)
    followup_deadline = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Meeting Model
class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(String, index=True)
    title = Column(String)
    datetime = Column(String) # Store as string for flexibility from AI
    location = Column(String, nullable=True)
    participants = Column(Text, nullable=True) # JSON serialized list
    created_at = Column(DateTime, default=lambda: datetime.utcnow())

# Follow-up Model
class Followup(Base):
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(String, index=True)
    reminder_time = Column(DateTime)
    status = Column(String, default="pending") # pending, completed
    created_at = Column(DateTime, default=lambda: datetime.utcnow())

# Task Model (Updated)
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
    created_at = Column(DateTime, default=lambda: datetime.utcnow())

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CRUD Operations for Tasks
def create_task(db, task_data):
    db_task = Task(**task_data)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_tasks(db, status=None):
    query = db.query(Task)
    if status:
        query = query.filter(Task.status == status)
    return query.order_by(Task.created_at.desc()).all()

def update_task(db, task_id, update_data):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task:
        for key, value in update_data.items():
            setattr(db_task, key, value)
        db.commit()
        db.refresh(db_task)
    return db_task

def delete_task(db, task_id):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
        return True
    return False

# CRUD Operations for Emails (New)
def save_analyzed_email(db, email_data):
    db_email = db.query(AnalyzedEmail).filter(AnalyzedEmail.id == email_data["id"]).first()
    if db_email:
        # Update existing
        for key, value in email_data.items():
            setattr(db_email, key, value)
    else:
        # Create new
        db_email = AnalyzedEmail(**email_data)
        db.add(db_email)
    db.commit()
    db.refresh(db_email)
    return db_email

def get_analyzed_emails(db, limit=10):
    return db.query(AnalyzedEmail).order_by(AnalyzedEmail.timestamp.desc()).limit(limit).all()

# CRUD for Meetings
def create_meeting(db, meeting_data):
    db_meeting = Meeting(**meeting_data)
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

def get_meetings(db):
    return db.query(Meeting).all()

# CRUD for Followups
def create_followup(db, followup_data):
    db_followup = Followup(**followup_data)
    db.add(db_followup)
    db.commit()
    db.refresh(db_followup)
    return db_followup

def get_pending_followups(db):
    return db.query(Followup).filter(Followup.status == "pending").all()
