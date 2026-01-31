# Falnote - Modern Dashboard with Real-Time Sync

A professional React + FastAPI application with real-time synchronization across multiple users using WebSockets and PostgreSQL.

## Project Structure

```
Fenil-sir-report/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── database.py         # Database configuration
│   ├── config.py           # Configuration
│   ├── websocket_manager.py # WebSocket connection management
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx         # Main component
│   │   ├── main.tsx        # Entry point
│   │   ├── api.ts          # API client
│   │   ├── hooks.ts        # Custom React hooks
│   │   ├── types.ts        # TypeScript types
│   │   ├── components/     # React components
│   │   └── styles/         # CSS styles
│   ├── index.html          # HTML template
│   ├── package.json        # NPM dependencies
│   ├── vite.config.ts      # Vite configuration
│   └── tsconfig.json       # TypeScript configuration
└── README.md               # This file
```

## Features

✅ **Real-Time Sync** - WebSocket-based synchronization across multiple users
✅ **Modern UI** - React with TypeScript
✅ **Powerful Backend** - FastAPI with async support
✅ **Database** - PostgreSQL for persistent storage
✅ **Responsive Design** - Mobile-friendly interface
✅ **Edit Mode** - Click to edit text and upload images
✅ **Live Collaboration** - See changes from other users instantly

## Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL 12+

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Configure Database

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```
DATABASE_URL=postgresql://username:password@localhost:5432/falnote
SECRET_KEY=your-secret-key
DEBUG=True
```

### 3. Initialize Database

```bash
# Make sure PostgreSQL is running
psql -U postgres -c "CREATE DATABASE falnote;"

# The tables will be created automatically when the app starts
```

### 4. Run Backend

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## Frontend Setup

### 1. Install Node Dependencies

```bash
cd frontend
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Development Workflow

1. **Backend** runs on `http://localhost:8000`
2. **Frontend** runs on `http://localhost:3000`
3. Changes are synced in real-time via WebSocket
4. All data persists in PostgreSQL

### Making Changes

- **Edit text**: Click on any text while in "Edit Mode"
- **Upload images**: Click logo or use upload dialog
- **See updates**: Other users see your changes instantly

## API Endpoints

### REST API
- `GET /api/page-data` - Get page data
- `PUT /api/page-data` - Update page data
- `POST /api/page-data/image` - Upload background image
- `GET /api/project-cards` - Get all project cards
- `POST /api/project-cards` - Create project card
- `PUT /api/project-cards/{id}` - Update project card
- `DELETE /api/project-cards/{id}` - Delete project card
- `GET /api/events` - Get events
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

### WebSocket
- `WS /ws/{session_id}` - Real-time sync connection

## Production Deployment

### Backend (FastAPI)
Use gunicorn with uvicorn workers:

```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Frontend (React)
Build and serve:

```bash
npm run build
# Serves as static files from dist/
```

### Database
Use managed PostgreSQL service (AWS RDS, DigitalOcean, etc.)

## Troubleshooting

**WebSocket connection failed?**
- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in `backend/main.py`

**Database connection error?**
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env`

**Image uploads not working?**
- Check file size limits
- Ensure backend can write to database

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/falnote
SECRET_KEY=your-secret-key-change-in-production
DEBUG=True
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## License

Powered By Orange Falcon LLC
