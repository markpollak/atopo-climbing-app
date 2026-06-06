from pydantic import BaseModel
from typing import Optional


class RouteUpdate(BaseModel):
    name: Optional[str] = None
    grade: Optional[str] = None
    stars: Optional[int] = None
    style: Optional[str] = None
    len: Optional[int] = None
    desc: Optional[str] = None
    warn: Optional[str] = None
    color: Optional[str] = None
    line: Optional[list] = None
    stances: Optional[list] = None
    status: Optional[str] = None
    sector_id: Optional[int] = None


class CragUpdate(BaseModel):
    name: Optional[str] = None
    area: Optional[str] = None
    type: Optional[str] = None
    walkin: Optional[str] = None
    aspect: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    access_notes: Optional[str] = None
    approach: Optional[str] = None
    photo_aspect: Optional[float] = None
