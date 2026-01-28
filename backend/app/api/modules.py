from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, exists
from typing import List, Optional

from app.db.deps import get_db
from app.api.deps import get_current_user
from app.models.module import Module
from app.models.task import Task
from app.models.user import User
from app.models.user_progress import UserProgress
from app.api.schemas.module import ModuleRead

router = APIRouter(prefix="/modules", tags=["modules"])


# -------------------------
# Existing endpoints
# -------------------------

@router.get("", response_model=List[ModuleRead])
def list_modules(
    roadmap_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Module)

    if roadmap_id is not None:
        query = query.filter(Module.roadmap_id == roadmap_id)

    modules = query.order_by(Module.month_number).all()
    return modules


@router.get("/{module_id}", response_model=ModuleRead)
def get_module(module_id: int, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


# -------------------------
# Module completion %
# -------------------------

@router.get("/{module_id}/progress")
def module_progress(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_tasks = (
        db.query(func.count(Task.id))
        .filter(Task.module_id == module_id)
        .scalar()
    )

    if total_tasks == 0:
        return {
            "module_id": module_id,
            "total_tasks": 0,
            "completed_tasks": 0,
            "completion_percentage": 0,
        }

    completed_tasks = (
        db.query(func.count(UserProgress.id))
        .join(Task, Task.id == UserProgress.task_id)
        .filter(
            Task.module_id == module_id,
            UserProgress.user_id == current_user.id,
            UserProgress.completed.is_(True),
        )
        .scalar()
    )

    completion_percentage = round(
        (completed_tasks / total_tasks) * 100,
        2,
    )

    return {
        "module_id": module_id,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_percentage": completion_percentage,
    }


# -------------------------
# NEXT TASK (FIXED & SCALABLE)
# -------------------------

@router.get("/{module_id}/next-task")
def next_task_for_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1️⃣ Validate module
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    # 2️⃣ Find first incomplete task (DB-level)
    next_task = (
        db.query(Task)
        .filter(Task.module_id == module_id)
        .filter(
            ~exists().where(
                UserProgress.user_id == current_user.id,
                UserProgress.task_id == Task.id,
                UserProgress.completed.is_(True),
            )
        )
        .order_by(Task.id)
        .first()
    )

    # 3️⃣ All tasks completed
    if not next_task:
        return {
            "module_completed": True,
            "module": {
                "id": module.id,
                "month_number": module.month_number,
                "title": module.title,
            },
            "message": "All tasks in this module are completed",
        }

    # 4️⃣ Return next task
    return {
        "module_completed": False,
        "module": {
            "id": module.id,
            "month_number": module.month_number,
            "title": module.title,
        },
        "task": {
            "id": next_task.id,
            "type": next_task.type,
            "title": next_task.title,
            "content": next_task.content_json,
            "points": next_task.points,
        },
    }