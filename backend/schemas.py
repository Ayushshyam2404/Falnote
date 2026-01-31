from pydantic import BaseModel, field_serializer, field_validator
from datetime import datetime
from typing import Optional, Dict
import base64
import json

class PageDataBase(BaseModel):
    main_title: Optional[str] = None
    main_subtitle: Optional[str] = None
    content: Dict = {}
    modified_by: Optional[str] = None

class PageDataCreate(PageDataBase):
    pass

class PageDataUpdate(BaseModel):
    main_title: Optional[str] = None
    main_subtitle: Optional[str] = None
    content: Optional[Dict] = None
    modified_by: Optional[str] = None

class PageDataResponse(BaseModel):
    id: int
    main_title: Optional[str] = None
    main_subtitle: Optional[str] = None
    content: Optional[Dict] = {}
    modified_by: Optional[str] = None
    background_image: Optional[str] = None
    partner_logo: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @field_validator('content', mode='before')
    @classmethod
    def parse_content(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return {}
        return v or {}

    class Config:
        from_attributes = True

class ProjectCardBase(BaseModel):
    title: str
    description: str
    order: int = 0

class ProjectCardCreate(ProjectCardBase):
    pass

class ProjectCardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    formatting: Optional[Dict] = None
    order: Optional[int] = None

class ProjectCardResponse(BaseModel):
    id: int
    title: str
    description: str
    image: Optional[str] = None
    formatting: Optional[Dict] = {}
    order: int = 0
    created_at: datetime
    updated_at: datetime

    @field_validator('formatting', mode='before')
    @classmethod
    def parse_formatting(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return {}
        return v or {}

    class Config:
        from_attributes = True

class EventBase(BaseModel):
    name: str
    date_time: str
    location: str
    event_type: str

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    name: Optional[str] = None
    date_time: Optional[str] = None
    location: Optional[str] = None
    event_type: Optional[str] = None

class EventResponse(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WebSocketMessage(BaseModel):
    type: str
    data: Dict
    session_id: str
