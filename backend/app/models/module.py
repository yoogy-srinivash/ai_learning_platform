from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"), nullable=False)

    month_number = Column(Integer, nullable=False)  # 1–4
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
 
    tasks = relationship(
        "Task",
        back_populates="module",
        cascade="all, delete-orphan",
    )

    # relationships
    roadmap = relationship("Roadmap", back_populates="modules")