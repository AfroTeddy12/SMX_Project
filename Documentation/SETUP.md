# Quick Setup Guide

## 🚀 Getting Started

This is the AI Phishing Simulation Platform - a comprehensive tool for creating and managing phishing awareness campaigns.

## 📁 Project Structure

```
ai-emails/
├── Backend/           # FastAPI backend server
├── frontend/          # React frontend application
├── Documentation/     # All documentation files
└── Landing page/      # Landing page assets
```

## ⚡ Quick Start

### 1. Start the Backend
```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm start
```

### 3. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 📚 Documentation

All documentation is organized in the `Documentation/` folder:
- **README.md** - Complete project documentation
- **COMMANDS.md** - All available commands
- **SIMULATION_GUIDE.md** - How to run large simulations

## 🔧 Essential Files

### Backend (Required)
- `main.py` - FastAPI application
- `database.py` - Database configuration
- `models.py` - Database models
- `schemas.py` - API schemas
- `requirements.txt` - Python dependencies
- `Utils/` - AI utilities

### Frontend (Required)
- `src/` - React application code
- `public/` - Static assets
- `package.json` - Node.js dependencies

## 🗂️ Cleaned Up

The following files have been removed to reduce folder size:
- Test scripts and utilities
- Python cache files
- Git repositories
- Node modules (can be reinstalled with `npm install`)

## 📖 For More Information

See the `Documentation/` folder for complete documentation, including:
- Detailed setup instructions
- API documentation
- Presentation materials
- Development guides 