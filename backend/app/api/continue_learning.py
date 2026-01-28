from fastapi import APIRouter, Depends
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
    prefix="/continue-learning",
    tags=["continue-learning"],
)


@router.get("")
def continue_learning(
    roadmap_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ------------------------------------------------
    # 1️⃣ Resume last started (not completed)
    # ------------------------------------------------
    resume_query = (
        db.query(UserProgress)
        .join(Task)
        .join(Module)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.completed.is_(False),
        )
    )

    if roadmap_id:
        resume_query = resume_query.filter(Module.roadmap_id == roadmap_id)

    last_progress = (
        resume_query
        .order_by(desc(UserProgress.created_at))
        .first()
    )

    if last_progress:
        return _build_task_response(
            db,
            last_progress.task_id,
            resume=True,
        )

    # ------------------------------------------------
    # 2️⃣ First incomplete task (ordered)
    # ------------------------------------------------

    # ✅ FIX: compute completed tasks FIRST (cheap query)
    completed_task_ids = {
        p.task_id
        for p in db.query(UserProgress.task_id)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.completed.is_(True),
        )
        .all()
    }

    tasks_query = (
        db.query(Task)
        .join(Module)
        .join(Roadmap)
        .order_by(
            Roadmap.id,
            Module.month_number,
            Task.id,
        )
    )

    if roadmap_id:
        tasks_query = tasks_query.filter(Module.roadmap_id == roadmap_id)

    tasks = tasks_query.all()

    for task in tasks:
        if task.id not in completed_task_ids:
            return _build_task_response(
                db,
                task.id,
                resume=False,
            )

    # ------------------------------------------------
    # 3️⃣ Everything completed
    # ------------------------------------------------
    if roadmap_id:
        return {
            "roadmap_id": roadmap_id,
            "all_completed": True,
            "message": "🎉 Roadmap completed!",
        }

    return {
        "all_completed": True,
        "message": "🎉 You have completed all available content!",
    }


# ------------------------------------------------
# Helper
# ------------------------------------------------
def _build_task_response(
    db: Session,
    task_id: int,
    resume: bool,
):
    task = db.query(Task).filter(Task.id == task_id).first()
    module = db.query(Module).filter(Module.id == task.module_id).first()
    roadmap = db.query(Roadmap).filter(Roadmap.id == module.roadmap_id).first()

    return {
        "resume": resume,
        "roadmap": {
            "id": roadmap.id,
            "title": roadmap.title,
        },
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
