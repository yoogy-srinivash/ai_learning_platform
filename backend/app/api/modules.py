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