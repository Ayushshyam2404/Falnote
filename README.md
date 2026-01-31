# Falnote

A modern, full-stack note-taking application with real-time synchronization capabilities. Falnote allows users to create, edit, and manage notes with support for rich content, images, and live collaboration features.

## Overview

Falnote is built with a FastAPI backend and React TypeScript frontend, deployed on Render. The application features WebSocket-based real-time updates, PostgreSQL database persistence, and a responsive user interface.

## Technology Stack

### Backend
- FastAPI 0.115.0 - Modern Python web framework for building APIs
- SQLAlchemy 2.0.36 - Object-relational mapping (ORM)
- PostgreSQL 15+ - Relational database
- Uvicorn 0.32.0 - ASGI web server with uvloop support
- WebSockets 13.1 - Real-time bidirectional communication
- psycopg2-binary 2.9.10 - PostgreSQL database adapter

### Frontend
- React 18 - UI library
- TypeScript - Type-safe JavaScript
- Vite - Modern build tool
- Axios - HTTP client
- Tailwind CSS - Utility-first CSS framework

### Deployment
- Render - Cloud platform for hosting
- Docker - Containerization
- GitHub - Version control and CI/CD

## Project Structure

```
Fenil-sir-report/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration and environment variables
│   ├── database.py          # Database connection and session management
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── websocket_manager.py # WebSocket connection management
│   ├── requirements.txt     # Python dependencies
│   ├── render.yaml          # Render deployment configuration
│   └── Dockerfile           # Docker container definition
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx         # React entry point
│   │   ├── App.tsx          # Root component
│   │   ├── api.ts           # API client configuration
│   │   ├── types.ts         # TypeScript type definitions
│   │   ├── hooks.ts         # Custom React hooks
│   │   ├── components/      # Reusable React components
│   │   └── styles/          # CSS stylesheets
│   ├── public/              # Static assets
│   ├── package.json         # Node dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vite.config.ts       # Vite build configuration
│   ├── render.yaml          # Render deployment configuration
│   └── Dockerfile           # Docker container definition
│
├── PROJECT_README.md        # Project documentation
├── QUICKSTART_PYTHON.md     # Python setup guide
└── setup.sh                 # Initial setup script
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 16+
- PostgreSQL 15+
- pip and npm package managers

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/Ayushshyam2404/Falnote.git
cd Fenil-sir-report
```

2. Run the setup script:
```bash
bash setup.sh
```

3. Create a Python virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

4. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

5. Configure environment variables in backend:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

6. Initialize the database:
```bash
python3 -m models
```

7. Start the backend server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

8. In a new terminal, install frontend dependencies:
```bash
cd frontend
npm install
```

9. Start the frontend development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` with the API running on `http://localhost:8000`.

## API Endpoints

### Health Checks
- `GET /` - Basic health check
- `GET /health` - Health check with database connectivity
- `GET /health/db` - Database connection test

### Page Data
- `GET /api/page-data` - Retrieve page data
- `PUT /api/page-data` - Update page data
- `POST /api/page-data/image` - Upload page image
- `POST /api/page-data/partner-logo` - Upload partner logo

### Project Cards
- `GET /api/project-cards` - List all project cards
- `POST /api/project-cards` - Create project card
- `PUT /api/project-cards/{id}` - Update project card
- `DELETE /api/project-cards/{id}` - Delete project card

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

### WebSocket
- `WS /ws/{session_id}` - Real-time synchronization endpoint

## Environment Variables

### Backend (.env)
```
DEBUG=false
ENVIRONMENT=production
FRONTEND_URL=https://falnote-frontend.onrender.com
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key-here
```

### Frontend (.env)
```
VITE_API_URL=https://falnote-api.onrender.com
VITE_WS_URL=wss://falnote-api.onrender.com
```

## Deployment

### Deploy to Render

1. Push changes to GitHub:
```bash
git add -A
git commit -m "Your commit message"
git push origin main
```

2. Render automatically deploys on push:
   - Frontend service: https://falnote-frontend.onrender.com
   - Backend service: https://falnote-api.onrender.com

3. Database is managed through Render's PostgreSQL service

### Environment Configuration

Backend environment variables are set in Render dashboard:
1. Navigate to falnote-api service settings
2. Go to Environment Variables
3. Add or update required variables
4. Service will automatically rebuild and redeploy

## Database

The application uses PostgreSQL 15+ for data persistence. Database migrations and table creation are handled automatically on application startup.

### Backup and Recovery

To backup the database:
```bash
pg_dump postgresql://user:password@host:port/database > backup.sql
```

To restore:
```bash
psql postgresql://user:password@host:port/database < backup.sql
```

## CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured to allow requests from:
- All Render domains (*.onrender.com)
- Local development (localhost:*)

Configuration is in `backend/main.py` using FastAPI's CORSMiddleware.

## Performance Optimization

- Database connection pooling enabled
- WebSocket heartbeat monitoring for connection health
- Uvicorn with uvloop for async performance
- Vite for optimized frontend builds
- SQLAlchemy pre_ping for connection validation

## Troubleshooting

### Database Connection Issues
1. Verify DATABASE_URL is set correctly
2. Check PostgreSQL service is running
3. Ensure database credentials are valid
4. Test connection: `curl https://falnote-api.onrender.com/health`

### CORS Errors
1. Verify FRONTEND_URL matches your deployment domain
2. Clear browser cache and hard refresh (Ctrl+Shift+R)
3. Check browser DevTools Console for specific error messages

### WebSocket Connection Issues
1. Ensure WebSocket upgrade headers are present
2. Check firewall rules allow WebSocket traffic
3. Verify VITE_WS_URL points to correct backend

## Development Best Practices

- Use TypeScript for type safety in frontend development
- Follow PEP 8 style guide for Python code
- Write tests for new features
- Document API changes in code comments
- Use meaningful commit messages

## Security

- Environment variables are kept secure in Render dashboard
- Database credentials never committed to version control
- CORS configured to prevent unauthorized cross-origin access
- WebSocket connections validated per session
- Input validation on all API endpoints

## License

This project is proprietary. Unauthorized use, modification, or distribution is prohibited.

## Support

For issues, feature requests, or questions, please contact the development team or create an issue on GitHub.

## Contributors

Ayush Shyam - Development Lead

---

Last Updated: February 1, 2026
