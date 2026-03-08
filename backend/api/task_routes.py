from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from services.task_service import task_service
from typing import List, Optional

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("/")
async def fetch_tasks(status: Optional[str] = None, db: Session = Depends(get_db)):
    return task_service.get_tasks(db, status)

@router.post("/")
async def add_task(task_data: dict = Body(...), db: Session = Depends(get_db)):
    return task_service.create_task(db, task_data)

@router.patch("/{task_id}")
async def patch_task(task_id: int, update_data: dict = Body(...), db: Session = Depends(get_db)):
    updated = task_service.update_task(db, task_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated

@router.delete("/{task_id}")
async def remove_task(task_id: int, db: Session = Depends(get_db)):
    if not task_service.delete_task(db, task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}
