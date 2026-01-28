from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.deps import get_db
from app.models.user import User
from app.models.task import Task
from app.models.user_progress import UserProgress

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
            "content": task.content_json,   # ✅ correct field
            "points": task.points,
            "completed": task.id in completed_task_ids,
        }
        for task in tasks
    ]
