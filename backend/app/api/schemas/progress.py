from pydantic import BaseModel


class RoadmapProgressResponse(BaseModel):
    roadmap_id: int
    total_tasks: int
    completed_tasks: int
    progress_percent: float

    class Config:
        from_attributes = True