from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RoadmapBase(BaseModel):
    title: str
    description: Optional[str] = None
    difficulty: Optional[str] = None


class RoadmapCreate(RoadmapBase):
    pass


class RoadmapRead(RoadmapBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True