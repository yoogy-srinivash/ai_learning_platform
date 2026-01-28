from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)

    # 🔹 NEW
    started = Column(Boolean, default=False, nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)

    # 🔹 EXISTING (unchanged)
    completed = Column(Boolean, default=False, nullable=False)
    score = Column(Integer, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # relationships
    user = relationship("User", back_populates="progress")
    task = relationship("Task", back_populates="progress")

    __table_args__ = (
        UniqueConstraint("user_id", "task_id", name="uq_user_task_progress"),
    )