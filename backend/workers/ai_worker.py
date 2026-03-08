import time
import json
from sqlalchemy.orm import Session
from app.database import SessionLocal
from models.email_model import Email
from services.ai_service import ai_service
from services.task_service import task_service
from services.meeting_service import meeting_service
from utils.email_cleaner import clean_email_body

def run_worker():
    print("AI Background Worker Started...")
    while True:
        db = SessionLocal()
        try:
            # Fetch unprocessed emails that have a body
            unprocessed = db.query(Email).filter(
                Email.ai_processed == False,
                Email.body != None
            ).limit(10).all()
            
            if not unprocessed:
                print("No emails to process. Sleeping for 10s...")
                time.sleep(10)
                continue
            
            print(f"Processing batch of {len(unprocessed)} emails...")
            
            batch_data = []
            for email in unprocessed:
                batch_data.append({
                    "id": email.id,
                    "subject": email.subject,
                    "sender": email.sender,
                    "body": clean_email_body(email.body)
                })
            
            results = ai_service.analyze_batch(batch_data)
            
            if results and isinstance(results, list):
                for res in results:
                    email_id = res.get("id")
                    email = db.query(Email).filter(Email.id == email_id).first()
                    if email:
                        email.summary = res.get("summary")
                        email.priority = res.get("priority", "medium")
                        email.sentiment = res.get("sentiment", "neutral")
                        email.key_points = str(res.get("key_points", []))
                        email.meeting_detected = res.get("meeting_detected", False)
                        email.requires_followup = res.get("requires_followup", False)
                        email.followup_deadline = res.get("followup_deadline")
                        email.ai_processed = True
                        
                        # Handle Tasks
                        tasks = res.get("tasks", [])
                        for t in tasks:
                            task_service.create_task(db, {
                                "email_id": email_id,
                                "title": t.get("title"),
                                "description": t.get("description"),
                                "priority": t.get("priority", "medium"),
                                "due_date": None # TODO: Parse due date string
                            })
                            
                        # Handle Meeting
                        if email.meeting_detected:
                            m_info = res.get("meeting_info", {})
                            meeting_service.create_meeting(db, {
                                "email_id": email_id,
                                "title": m_info.get("title") or f"Meeting: {email.subject}",
                                "datetime": m_info.get("time"),
                                "location": m_info.get("location"),
                                "participants": m_info.get("participants", [])
                            })
                
                db.commit()
                print(f"Successfully processed {len(unprocessed)} emails.")
            else:
                print("Batch analysis failed. Retrying in 30s...")
                time.sleep(30)
                
        except Exception as e:
            print(f"Worker Error: {e}")
            db.rollback()
            time.sleep(30)
        finally:
            db.close()
        
        time.sleep(5)

if __name__ == "__main__":
    run_worker()
