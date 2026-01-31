# Quick Start Guide - Falnote

## 1️⃣ Install PostgreSQL

### macOS (using Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

### Or use Docker
```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

## 2️⃣ Create Database

```bash
psql -U postgres
CREATE DATABASE falnote;
\q
```

## 3️⃣ Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

## 4️⃣ Configure Environment

Edit `backend/.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/falnote
SECRET_KEY=your-secret-key-here
DEBUG=True
```

## 5️⃣ Start Backend

```bash
cd backend
source venv/bin/activate
python main.py
```

Server runs at: `http://localhost:8000`

## 6️⃣ Start Frontend (in new terminal)

```bash
cd frontend
npm run dev
```

App available at: `http://localhost:3000`

## 🧪 Test Real-Time Sync

1. Open `http://localhost:3000` in two browser windows
2. Enable "Edit Mode" in one window
3. Edit some text or upload an image
4. Watch it sync instantly to the other window! 🎉

## 📚 Full Documentation

See `PROJECT_README.md` for detailed information.
