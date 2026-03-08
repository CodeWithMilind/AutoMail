from sqlalchemy.orm import Session
from models.task_model import Task
from datetime import datetime

class TaskService:
    def create_task(self, db: Session, task_data: dict):
        db_task = Task(**task_data)
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    def get_tasks(self, db: Session, status: str = None):
        query = db.query(Task)
        if status:
            query = query.filter(Task.status == status)
        return query.order_by(Task.created_at.desc()).all()

    def update_task(self, db: Session, task_id: int, update_data: dict):
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if db_task:
            for key, value in update_data.items():
                setattr(db_task, key, value)
            db.commit()
            db.refresh(db_task)
        return db_task

    def delete_task(self, db: Session, task_id: int):
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if db_task:
            db.delete(db_task)
            db.commit()
            return True
        return False

task_service = TaskService()
