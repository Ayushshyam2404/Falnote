"""Falnote API - Note-taking application with real-time sync"""
from fastapi import FastAPI, WebSocket, Depends, File, UploadFile, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
import models
import schemas
from websocket_manager import manager
import json
import uuid
import base64
import os
from config import DEBUG

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Falnote API", version="1.0.0")

# Configure CORS based on environment
if DEBUG:
    allowed_origins = ["*"]
else:
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    allowed_origins = [frontend_url]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket endpoint for real-time sync
@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_json()
            
            # Broadcast to all other connected clients
            message = {
                "type": data.get("type"),
                "data": data.get("data"),
                "session_id": session_id,
                "timestamp": str(__import__("datetime").datetime.now())
            }
            
            await manager.broadcast(message, exclude_session=session_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
        # Notify others that a client disconnected
        await manager.broadcast({
            "type": "user_disconnected",
            "session_id": session_id
        })
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, session_id)

# REST API Endpoints

@app.get("/")
def read_root():
    """Health check endpoint - always returns OK even if database is down"""
    import os
    env = os.getenv("ENVIRONMENT", "development")
    return {
        "status": "ok",
        "message": "Falnote API is running",
        "environment": env
    }

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint with database connectivity"""
    try:
        # Test database connection
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": f"connection failed: {str(e)}"}, 503

@app.get("/api/page-data")
def get_page_data(db: Session = Depends(get_db)):
    """Get current page data"""
    page_data = db.query(models.PageData).first()
    if not page_data:
        page_data = models.PageData()
        db.add(page_data)
        db.commit()
        db.refresh(page_data)
    
    # Parse JSON content if it's a string
    if isinstance(page_data.content, str):
        page_data.content = json.loads(page_data.content) if page_data.content else {}
    
    # Convert to dict and handle binary image encoding
    response = {
        "id": page_data.id,
        "main_title": page_data.main_title or "",
        "main_subtitle": page_data.main_subtitle or "",
        "content": page_data.content or {},
        "modified_by": page_data.modified_by or "",
        "background_image": base64.b64encode(page_data.background_image).decode('utf-8') if page_data.background_image else None,
        "partner_logo": base64.b64encode(page_data.partner_logo).decode('utf-8') if page_data.partner_logo else None,
        "created_at": page_data.created_at,
        "updated_at": page_data.updated_at
    }
    
    return response

@app.put("/api/page-data")
def update_page_data(page_data: schemas.PageDataUpdate, db: Session = Depends(get_db)):
    """Update page data"""
    try:
        db_page = db.query(models.PageData).first()
        if not db_page:
            db_page = models.PageData()
            db.add(db_page)
        
        if page_data.main_title is not None:
            db_page.main_title = page_data.main_title
        if page_data.main_subtitle is not None:
            db_page.main_subtitle = page_data.main_subtitle
        if page_data.content is not None:
            db_page.content = json.dumps(page_data.content)
        if page_data.modified_by is not None:
            db_page.modified_by = page_data.modified_by
        
        db.commit()
        db.refresh(db_page)
        
        # Parse content back to dict before returning
        content = {}
        if db_page.content:
            try:
                content = json.loads(db_page.content)
            except:
                content = {}
        
        # Only include background_image if it exists and can be encoded
        bg_image = None
        if db_page.background_image:
            try:
                bg_image = base64.b64encode(db_page.background_image).decode('utf-8')
            except:
                pass
        
        # Only include partner_logo if it exists and can be encoded
        partner_logo = None
        if db_page.partner_logo:
            try:
                partner_logo = base64.b64encode(db_page.partner_logo).decode('utf-8')
            except:
                pass
        
        return {
            "id": db_page.id,
            "main_title": db_page.main_title or "Falnote",
            "main_subtitle": db_page.main_subtitle or "Future Growth Strategy",
            "content": content,
            "modified_by": db_page.modified_by or "system",
            "background_image": bg_image,
            "partner_logo": partner_logo,
            "created_at": db_page.created_at.isoformat() if db_page.created_at else None,
            "updated_at": db_page.updated_at.isoformat() if db_page.updated_at else None
        }
    except Exception as e:
        db.rollback()
        if DEBUG:
            print(f"[DEBUG] Error updating page data: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

@app.post("/api/page-data/image")
async def upload_page_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload background image"""
    content = await file.read()
    
    db_page = db.query(models.PageData).first()
    if not db_page:
        db_page = models.PageData()
        db.add(db_page)
    
    db_page.background_image = content
    db.commit()
    
    return {"message": "Image uploaded successfully"}

@app.post("/api/page-data/partner-logo")
async def upload_partner_logo(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload partner hotel logo"""
    content = await file.read()
    
    db_page = db.query(models.PageData).first()
    if not db_page:
        db_page = models.PageData()
        db.add(db_page)
    
    db_page.partner_logo = content
    db.commit()
    
    return {"message": "Partner logo uploaded successfully"}

@app.post("/api/project-cards/{card_id}/image")
async def upload_card_image(card_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload image for a project card"""
    content = await file.read()
    
    db_card = db.query(models.ProjectCard).filter(models.ProjectCard.id == card_id).first()
    if not db_card:
        # Create new card if it doesn't exist
        db_card = models.ProjectCard(id=card_id)
        db.add(db_card)
    
    db_card.image = content
    db.commit()
    db.refresh(db_card)
    
    return {
        "message": "Card image uploaded successfully",
        "card_id": card_id,
        "image": base64.b64encode(db_card.image).decode('utf-8') if db_card.image else None
    }

@app.get("/api/project-cards")
def get_project_cards(db: Session = Depends(get_db)):
    """Get all project cards"""
    cards = db.query(models.ProjectCard).order_by(models.ProjectCard.order).all()
    
    response = []
    for card in cards:
        # Parse formatting from JSON string
        formatting = {}
        if card.formatting:
            try:
                formatting = json.loads(card.formatting)
            except (json.JSONDecodeError, TypeError):
                formatting = {}
        
        card_data = {
            "id": card.id,
            "title": card.title,
            "description": card.description,
            "order": card.order,
            "formatting": formatting,
            "image": base64.b64encode(card.image).decode('utf-8') if card.image else None,
            "created_at": card.created_at,
            "updated_at": card.updated_at
        }
        response.append(card_data)
    
    return response

@app.post("/api/project-cards", response_model=schemas.ProjectCardResponse)
def create_project_card(card: schemas.ProjectCardCreate, db: Session = Depends(get_db)):
    """Create a new project card"""
    db_card = models.ProjectCard(**card.dict())
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

@app.put("/api/project-cards/{card_id}", response_model=schemas.ProjectCardResponse)
def update_project_card(card_id: int, card: schemas.ProjectCardUpdate, db: Session = Depends(get_db)):
    """Update a project card"""
    db_card = db.query(models.ProjectCard).filter(models.ProjectCard.id == card_id).first()
    if not db_card:
        return {"error": "Card not found"}
    
    update_data = card.dict(exclude_unset=True)
    
    # Handle formatting - convert dict to JSON string
    if 'formatting' in update_data and update_data['formatting'] is not None:
        db_card.formatting = json.dumps(update_data['formatting'])
        del update_data['formatting']
    
    # Update other fields
    for key, value in update_data.items():
        if value is not None:
            setattr(db_card, key, value)
    
    db.commit()
    db.refresh(db_card)
    
    # Return with parsed formatting
    formatting = {}
    if db_card.formatting:
        try:
            formatting = json.loads(db_card.formatting)
        except (json.JSONDecodeError, TypeError):
            formatting = {}
    
    return {
        "id": db_card.id,
        "title": db_card.title,
        "description": db_card.description,
        "order": db_card.order,
        "formatting": formatting,
        "image": base64.b64encode(db_card.image).decode('utf-8') if db_card.image else None,
        "created_at": db_card.created_at,
        "updated_at": db_card.updated_at
    }

@app.delete("/api/project-cards/{card_id}")
def delete_project_card(card_id: int, db: Session = Depends(get_db)):
    """Delete a project card"""
    db_card = db.query(models.ProjectCard).filter(models.ProjectCard.id == card_id).first()
    if not db_card:
        return {"error": "Card not found"}
    
    db.delete(db_card)
    db.commit()
    return {"message": "Card deleted"}

@app.get("/api/events", response_model=list[schemas.EventResponse])
def get_events(event_type: str = None, db: Session = Depends(get_db)):
    """Get all events, optionally filtered by type"""
    query = db.query(models.Event)
    if event_type:
        query = query.filter(models.Event.event_type == event_type)
    return query.all()

@app.post("/api/events", response_model=schemas.EventResponse)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    """Create a new event"""
    db_event = models.Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.put("/api/events/{event_id}", response_model=schemas.EventResponse)
def update_event(event_id: int, event: schemas.EventUpdate, db: Session = Depends(get_db)):
    """Update an event"""
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        return {"error": "Event not found"}
    
    for key, value in event.dict(exclude_unset=True).items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event

@app.delete("/api/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Delete an event"""
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        return {"error": "Event not found"}
    
    db.delete(db_event)
    db.commit()
    return {"message": "Event deleted"}

@app.get("/api/status")
def get_status(db: Session = Depends(get_db)):
    """Get API status and connection info"""
    return {
        "status": "ok",
        "active_connections": manager.get_active_clients_count(),
        "debug": DEBUG
    }

@app.on_event("startup")
async def startup_event():
    print("Application started")
    
    # Initialize default project cards if they don't exist
    from database import SessionLocal
    db = SessionLocal()
    try:
        # Create database tables
        models.Base.metadata.create_all(bind=engine)
        print("Database tables created/verified")
        
        existing_cards = db.query(models.ProjectCard).count()
        if existing_cards == 0:
            default_cards = [
                models.ProjectCard(id=1, title="Project 1", description="Add project details", order=1),
                models.ProjectCard(id=2, title="Project 2", description="Add project details", order=2),
                models.ProjectCard(id=3, title="Project 3", description="Add project details", order=3),
            ]
            db.add_all(default_cards)
            db.commit()
            print("Default project cards initialized")
        else:
            print(f"Database already has {existing_cards} project cards")
    except Exception as e:
        print(f"Error initializing project cards: {e}")
        db.rollback()
    finally:
        db.close()

@app.on_event("shutdown")
async def shutdown_event():
    print("Application shutdown")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
