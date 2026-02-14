from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.deps import get_db
from app.models.user import User
from app.models.task import Task
from app.models.user_progress import UserProgress
from app.models.module import Module

router = APIRouter(prefix="/modules", tags=["tasks"])


@router.get("/{module_id}/tasks")
def list_tasks_for_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tasks = (
        db.query(Task)
        .filter(Task.module_id == module_id)
        .order_by(Task.id)
        .all()
    )

    completed_task_ids = {
        p.task_id
        for p in db.query(UserProgress)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.completed.is_(True),
        )
        .all()
    }

    return [
        {
            "id": task.id,
            "type": task.type,
            "title": task.title,
            "content": task.content_json,
            "points": task.points,
            "completed": task.id in completed_task_ids,
        }
        for task in tasks
    ]


# ✅ NEW ENDPOINT — GET SINGLE TASK
@router.get("/tasks/{task_id}")
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    completed = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.task_id == task_id,
            UserProgress.completed.is_(True),
        )
        .first()
        is not None
    )

    return {
        "id": task.id,
        "title": task.title,
        "type": task.type,
        "content": task.content_json,
        "points": task.points,
        "completed": completed,
    }


@router.post("/tasks/{task_id}/complete")
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    existing_progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.task_id == task_id,
        )
        .first()
    )

    if existing_progress:
        return {
            "message": "Task already completed",
            "next_task": None,
        }

    progress = UserProgress(
        user_id=current_user.id,
        task_id=task_id,
        completed=True,
    )
    db.add(progress)
    db.commit()

    completed_task_ids = {
        p.task_id
        for p in db.query(UserProgress)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.completed.is_(True),
        )
        .all()
    }

    next_task = (
        db.query(Task)
        .join(Module, Task.module_id == Module.id)
        .filter(
            Task.id.notin_(completed_task_ids),
            Module.roadmap_id == task.module.roadmap_id,
        )
        .order_by(
            Module.month_number.asc(),
            Task.id.asc(),
        )
        .first()
    )

    return {
        "message": "Task completed",
        "next_task": (
            {
                "id": next_task.id,
                "title": next_task.title,
                "type": next_task.type,
            }
            if next_task
            else None
        ),
    }
