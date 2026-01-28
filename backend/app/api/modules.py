from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
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
# NEW: Module completion %
# -------------------------

@router.get("/{module_id}/progress")
def module_progress(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1️⃣ Total tasks in module
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

    # 2️⃣ Completed tasks by this user
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
        (completed_tasks / total_tasks) * 100, 2
    )

    return {
        "module_id": module_id,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_percentage": completion_percentage,
    }

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

    # 2️⃣ Fetch all tasks in module (ordered)
    tasks = (
        db.query(Task)
        .filter(Task.module_id == module_id)
        .order_by(Task.id)
        .all()
    )

    if not tasks:
        return {
            "module_completed": True,
            "message": "No tasks in this module",
        }

    # 3️⃣ Get completed task IDs for user
    completed_task_ids = {
        p.task_id
        for p in db.query(UserProgress)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.completed.is_(True),
        )
        .all()
    }

    # 4️⃣ Find first incomplete task
    for task in tasks:
        if task.id not in completed_task_ids:
            return {
                "module_completed": False,
                "module": {
                    "id": module.id,
                    "month_number": module.month_number,
                    "title": module.title,
                },
                "task": {
                    "id": task.id,
                    "type": task.type,
                    "title": task.title,
                    "content": task.content_json,
                    "points": task.points,
                },
            }

    # 5️⃣ All tasks done
    return {
        "module_completed": True,
        "module": {
            "id": module.id,
            "month_number": module.month_number,
            "title": module.title,
        },
        "message": "All tasks in this module are completed",
    }