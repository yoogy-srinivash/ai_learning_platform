from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.deps import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.roadmap import Roadmap
from app.models.module import Module
from app.models.task import Task
from app.models.user_progress import UserProgress

router = APIRouter(
    prefix="/roadmaps",
    tags=["roadmaps"],
)


@router.get("/{roadmap_id}/next")
def roadmap_next_task(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # -------------------------
    # 1️⃣ Validate roadmap
    # -------------------------
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.id == roadmap_id)
        .first()
    )

    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    # -------------------------
    # 2️⃣ Resume last incomplete task
    # -------------------------
    last_progress = (
        db.query(UserProgress)
        .join(Task)
        .join(Module)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.completed.is_(False),
            Module.roadmap_id == roadmap_id,
        )
        .order_by(desc(UserProgress.created_at))
        .first()
    )

    if last_progress:
        return _task_payload(db, last_progress.task_id, resume=True)

    # -------------------------
    # 3️⃣ First incomplete task
    # -------------------------
    tasks = (
        db.query(Task)
        .join(Module)
        .filter(Module.roadmap_id == roadmap_id)
        .order_by(Module.month_number, Task.id)
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

    for task in tasks:
        if task.id not in completed_task_ids:
            return _task_payload(db, task.id, resume=False)

    # -------------------------
    # 4️⃣ Roadmap completed
    # -------------------------
    return {
        "roadmap_id": roadmap_id,
        "all_completed": True,
        "message": "🎉 Roadmap completed!",
    }


# -------------------------
# Helper
# -------------------------
def _task_payload(db: Session, task_id: int, resume: bool):
    task = db.query(Task).filter(Task.id == task_id).first()
    module = db.query(Module).filter(Module.id == task.module_id).first()

    return {
        "resume": resume,
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
        "all_completed": False,
    }
