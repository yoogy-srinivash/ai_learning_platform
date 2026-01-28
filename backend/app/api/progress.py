from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_current_user
from app.db.deps import get_db
from app.models.user import User
from app.models.task import Task
from app.models.user_progress import UserProgress
from app.models.module import Module


router = APIRouter(prefix="/progress", tags=["progress"])

@router.post("/start/{task_id}")
def start_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1️⃣ Validate task
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # 2️⃣ Get or create progress row
    progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.task_id == task_id,
        )
        .first()
    )

    if not progress:
        progress = UserProgress(
            user_id=current_user.id,
            task_id=task_id,
        )
        db.add(progress)

    # 3️⃣ Mark as started (idempotent)
    progress.started = True

    db.commit()

    return {
        "task_id": task_id,
        "started": True,
    }

# ---------------------------
# Mark task as completed
# ---------------------------
@router.post("/complete/{task_id}")
def complete_task(
    task_id: int,
    score: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.task_id == task_id,
        )
        .first()
    )

    if progress and progress.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task already completed",
        )

    if not progress or not progress.started:
        raise HTTPException(
            status_code=400,
            detail="Task must be started before completing",
    )

    if not progress:
        progress = UserProgress(
            user_id=current_user.id,
            task_id=task_id,
        )
        db.add(progress)

    progress.completed = True
    progress.score = score
    progress.completed_at = datetime.utcnow()

    db.commit()

    return {
        "task_id": task_id,
        "completed": True,
        "score": score,
    }


# ---------------------------
# Roadmap progress (percentage)
# ---------------------------
@router.get("/roadmap/{roadmap_id}")
def roadmap_progress(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # total tasks in roadmap
    total_tasks = (
        db.query(Task)
        .join(Module)
        .filter(Module.roadmap_id == roadmap_id)
        .count()
    )

    if total_tasks == 0:
        raise HTTPException(
            status_code=404,
            detail="No tasks found for this roadmap",
        )

    # completed tasks by user
    completed_tasks = (
        db.query(UserProgress)
        .join(Task)
        .join(Module)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.completed.is_(True),
            Module.roadmap_id == roadmap_id,
        )
        .count()
    )

    progress_percent = round(
        (completed_tasks / total_tasks) * 100, 2
    )

    return {
        "roadmap_id": roadmap_id,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "progress_percent": progress_percent,
    }