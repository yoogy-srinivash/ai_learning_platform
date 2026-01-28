from pydantic import BaseModel
from typing import Optional


class ModuleBase(BaseModel):
    month_number: int
    title: str
    description: Optional[str] = None


class ModuleCreate(ModuleBase):
    roadmap_id: int


class ModuleRead(ModuleBase):
    id: int
    roadmap_id: int

    class Config:
        from_attributes = True
