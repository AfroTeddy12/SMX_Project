# Phishing Simulation Platform - Command Reference

This document provides a comprehensive reference for all commands, API endpoints, and operations available in the phishing simulation platform.

## Table of Contents
- [Setup Commands](#setup-commands)
- [Backend Commands](#backend-commands)
- [Frontend Commands](#frontend-commands)
- [API Endpoints](#api-endpoints)
- [Database Operations](#database-operations)
- [Testing Commands](#testing-commands)
- [Utility Scripts](#utility-scripts)

## Setup Commands

### Initial Setup
```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd ai-emails

# Install backend dependencies
cd Backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Configuration
```bash
# Create environment file with Google AI API key
cd Backend
python create_env_file.py

# Or manually create .env file
echo "GOOGLE_API_KEY=your_google_ai_api_key_here" > .env
```

## Backend Commands

### Start Backend Server
```bash
# Development mode with auto-reload
cd Backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000

# With specific configuration
uvicorn main:app --reload --host 127.0.0.1 --port 8000 --log-level info
```

### Test Backend
```bash
# Test AI integration
cd Backend
python test_gemma_integration.py

# Run demo script
python sample_demo_script.py

# Run large organization simulation
python simulation_large_organization.py
```

## Frontend Commands

### Start Frontend Development Server
```bash
# Development mode
cd frontend
npm start

# Build for production
npm run build

# Test frontend
npm test
```

### Frontend Package Management
```bash
# Install new dependencies
npm install package-name

# Update dependencies
npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

## API Endpoints

### User Management
```bash
# Create user
curl -X POST "http://localhost:8000/users/" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@company.com", "department_id": 1}'

# Get all users
curl -X GET "http://localhost:8000/users/"

# Get specific user
curl -X GET "http://localhost:8000/users/1"

# Update user
curl -X PUT "http://localhost:8000/users/1" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Smith", "email": "john.smith@company.com", "department_id": 2}'

# Delete user
curl -X DELETE "http://localhost:8000/users/1"
```

### Department Management
```bash
# Create department
curl -X POST "http://localhost:8000/departments/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Information Technology"}'

# Get all departments
curl -X GET "http://localhost:8000/departments/"

# Get specific department
curl -X GET "http://localhost:8000/departments/1"

# Update department
curl -X PUT "http://localhost:8000/departments/1" \
  -H "Content-Type: application/json" \
  -d '{"name": "IT Department"}'

# Delete department
curl -X DELETE "http://localhost:8000/departments/1"
```

### Email Generation
```bash
# Generate email for single user
curl -X POST "http://localhost:8000/generate-email?user_id=1&template_type=urgent_action"

# Generate emails for entire department
curl -X POST "http://localhost:8000/generate-email/department?department_id=1&template_type=security_alert"

# Get email logs
curl -X GET "http://localhost:8000/email_logs/"

# Get specific email log
curl -X GET "http://localhost:8000/email_logs/1"
```

### Email Interaction Simulation
```bash
# Simulate email click
curl -X POST "http://localhost:8000/email_logs/1/click"

# Simulate email response
curl -X POST "http://localhost:8000/email_logs/1/respond"
```

### Analytics
```bash
# Get clicks by department
curl -X GET "http://localhost:8000/analytics/clicks_by_department"

# Get AI-powered analysis
curl -X GET "http://localhost:8000/analytics/ai-analysis"

# Get template suggestions
curl -X GET "http://localhost:8000/templates/suggestions?department_id=1"
```

### Database Management
```bash
# Wipe all data (DANGEROUS - irreversible)
curl -X DELETE "http://localhost:8000/wipe-all-data"
```

## Database Operations

### SQLite Database
```bash
# Access SQLite database directly
cd Backend
sqlite3 phishing_sim.db

# Common SQLite commands
.tables                    # List all tables
.schema users              # Show table schema
SELECT * FROM users;       # Query users
SELECT * FROM departments; # Query departments
SELECT * FROM email_logs;  # Query email logs
.quit                      # Exit SQLite
```

### Database Backup
```bash
# Create backup
cp Backend/phishing_sim.db Backend/phishing_sim_backup.db

# Restore from backup
cp Backend/phishing_sim_backup.db Backend/phishing_sim.db
```

## Testing Commands

### Backend Testing
```bash
# Test AI integration
cd Backend
python test_gemma_integration.py

# Run with verbose output
python -v test_gemma_integration.py

# Test specific functionality
python -c "
from Utils.ai_utils import AIEmailGenerator
generator = AIEmailGenerator()
print('AI Email Generator initialized successfully')
"
```

### Frontend Testing
```bash
# Run tests
cd frontend
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### API Testing
```bash
# Test API health
curl -X GET "http://localhost:8000/"

# Test with authentication (if implemented)
curl -X GET "http://localhost:8000/users/" \
  -H "Authorization: Bearer your-token-here"

# Test error handling
curl -X GET "http://localhost:8000/users/999"  # Non-existent user
```

## Utility Scripts

### Demo Scripts
```bash
# Run basic demo
cd Backend
python sample_demo_script.py

# Run large organization simulation
python simulation_large_organization.py

# Run with custom parameters
python simulation_large_organization.py --departments 10 --users 500
```

### Data Generation
```bash
# Generate test data
cd Backend
python -c "
import requests
# Create test departments
requests.post('http://localhost:8000/departments/', json={'name': 'Test Dept'})
# Create test users
requests.post('http://localhost:8000/users/', json={'name': 'Test User', 'email': 'test@company.com', 'department_id': 1})
"
```

## Environment Variables

### Backend (.env file)
```bash
# Required
GOOGLE_API_KEY=your_google_ai_api_key_here

# Optional
GEMMA_MODEL=gemma-3n-e4b-it
GEMMA_TEMPERATURE=0.7
GEMMA_MAX_TOKENS=300
```

### Frontend (.env file)
```bash
# API URL
REACT_APP_API_URL=http://localhost:8000

# Environment
REACT_APP_ENV=development
```

## Troubleshooting Commands

### Check Services
```bash
# Check if backend is running
curl -X GET "http://localhost:8000/"

# Check if frontend is running
curl -X GET "http://localhost:3000/"

# Check database file
ls -la Backend/phishing_sim.db

# Check logs
tail -f Backend/logs/app.log  # If logging is implemented
```

### Reset Environment
```bash
# Reset database
rm Backend/phishing_sim.db
cd Backend
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"

# Clear frontend cache
cd frontend
rm -rf node_modules
npm install

# Reset environment
cd Backend
rm .env
python create_env_file.py
```

### Performance Monitoring
```bash
# Monitor backend performance
cd Backend
python -c "
import time
import requests
start = time.time()
response = requests.get('http://localhost:8000/users/')
end = time.time()
print(f'Response time: {end - start:.2f} seconds')
"

# Monitor database size
ls -lh Backend/phishing_sim.db
```

## Security Commands

### API Key Management
```bash
# Check if API key is set
cd Backend
python -c "import os; print('API Key set:', bool(os.getenv('GOOGLE_API_KEY')))"

# Validate API key
python -c "
from Utils.ai_utils import AIEmailGenerator
try:
    generator = AIEmailGenerator()
    print('API key is valid')
except Exception as e:
    print('API key error:', e)
"
```

### Database Security
```bash
# Check database permissions
ls -la Backend/phishing_sim.db

# Set proper permissions
chmod 600 Backend/phishing_sim.db

# Backup sensitive data
cp Backend/phishing_sim.db Backend/backup_$(date +%Y%m%d_%H%M%S).db
```

## Development Commands

### Code Quality
```bash
# Backend linting (if using flake8)
cd Backend
flake8 .

# Frontend linting
cd frontend
npm run lint

# Format code (if using black)
cd Backend
black .
```

### Documentation
```bash
# Generate API documentation
cd Backend
uvicorn main:app --reload &
# Visit http://localhost:8000/docs for interactive API docs

# Generate requirements
cd Backend
pip freeze > requirements.txt
```

## Production Commands

### Deployment
```bash
# Build frontend for production
cd frontend
npm run build

# Start production backend
cd Backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Using gunicorn (if installed)
cd Backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Monitoring
```bash
# Check service status
ps aux | grep uvicorn
ps aux | grep node

# Monitor resource usage
top -p $(pgrep -f uvicorn)
top -p $(pgrep -f node)
```

---

## Quick Reference

### Most Common Commands
```bash
# Start development environment
cd Backend && uvicorn main:app --reload &
cd frontend && npm start

# Test AI integration
cd Backend && python test_gemma_integration.py

# Run demo
cd Backend && python sample_demo_script.py

# Wipe database (DANGEROUS)
curl -X DELETE "http://localhost:8000/wipe-all-data"
```

### Emergency Commands
```bash
# Stop all services
pkill -f uvicorn
pkill -f node

# Reset database
rm Backend/phishing_sim.db

# Restart from scratch
cd Backend && python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"
```

---

**Note**: Always ensure you have proper backups before running destructive commands like database wipes or resets. 