#!/bin/bash

# Falnote Development Setup Script

echo "🚀 Setting up Falnote (FastAPI + React + PostgreSQL)..."

# Backend Setup
echo ""
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Created .env file - Please update with your PostgreSQL credentials"
fi

cd ..

# Frontend Setup
echo ""
echo "📦 Setting up Frontend..."
cd frontend

# Install dependencies
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with your PostgreSQL credentials"
echo "2. Run: cd backend && source venv/bin/activate && python main.py"
echo "3. In another terminal: cd frontend && npm run dev"
echo "4. Open http://localhost:3000"
