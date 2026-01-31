from sqlalchemy import Column, String, DateTime, LargeBinary, Integer, Text
from sqlalchemy.sql import func
from database import Base

class PageData(Base):
    __tablename__ = "page_data"

    id = Column(Integer, primary_key=True, index=True)
    main_title = Column(String, default="Falnote")
    main_subtitle = Column(String, default="Future Growth Strategy")
    content = Column(Text, default="{}")  # JSON string
    background_image = Column(LargeBinary, nullable=True)
    partner_logo = Column(LargeBinary, nullable=True)
    card_images = Column(Text, default="{}")  # JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    modified_by = Column(String, default="system")

class ProjectCard(Base):
    __tablename__ = "project_cards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    image = Column(LargeBinary, nullable=True)
    formatting = Column(Text, default="{}")  # JSON string for formatting
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    date_time = Column(String)
    location = Column(String)
    event_type = Column(String)  # "sportsplex" or "school"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
