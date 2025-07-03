# Phishing Simulation Platform - Tools and Applications

## Backend Technologies

### Core Framework and Server
- **FastAPI**: Modern, fast web framework for building APIs with Python
- **Uvicorn**: ASGI server implementation for running FastAPI applications
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping (ORM) library
- **Databases**: Async database support for SQLAlchemy

### AI and Machine Learning
- **Google Gemma-3n-e4b-it**: AI model for generating sophisticated phishing emails
- **scikit-learn**: Machine learning library for anomaly detection and analysis
- **pandas**: Data manipulation and analysis library
- **numpy**: Numerical computing library

### Database
- **SQLite**: Lightweight disk-based database (phishing_sim.db)

## Project Structure

### Backend Components
```
Backend/
├── main.py              # Main FastAPI application and endpoints
├── database.py          # Database connection and initialization
├── models.py            # SQLAlchemy database models
├── schemas.py           # Pydantic data validation schemas
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (API keys, etc.)
├── Utils/
│   └── ai_utils.py      # AI-powered email generation and analysis
├── Models/              # Additional model definitions
└── Routes/              # API route handlers
```

## API Endpoints

### User Management
- `POST /users/` - Create new user
- `GET /users/` - List all users
- `GET /users/{user_id}` - Get specific user
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user

### Department Management
- `POST /departments/` - Create new department
- `GET /departments/` - List all departments
- `GET /departments/{department_id}` - Get specific department
- `PUT /departments/{department_id}` - Update department
- `DELETE /departments/{department_id}` - Delete department

### Email Operations
- `POST /generate-email` - Generate AI-powered phishing email for single user
- `POST /generate-email/department` - Generate AI-powered phishing emails for entire department
- `POST /email_logs/` - Create email log
- `GET /email_logs/` - List email logs
- `GET /email_logs/{log_id}` - Get specific email log
- `PUT /email_logs/{log_id}` - Update email log
- `DELETE /email_logs/{log_id}` - Delete email log

### Analytics and AI Features
- `GET /analytics/clicks_by_department` - Get click statistics by department
- `GET /analytics/ai-analysis` - Get AI-powered analysis of user behavior
- `GET /templates/suggestions` - Get template effectiveness suggestions

### Email Interaction
- `POST /email_logs/{log_id}/click` - Simulate email click
- `POST /email_logs/{log_id}/respond` - Simulate email response

### Database Management
- `DELETE /wipe-all-data` - Wipe all data from database (users, departments, email logs)

## AI Features

### Email Generation
- Uses Google's Gemma-3n-e4b-it model
- Emails are now fully realistic: the AI generates only the subject and body, never echoing the prompt or including placeholders.
- Backend ensures only the subject and body are returned from the AI, discarding any extra text.
- Supports multiple template types:
  - Urgent action required
  - Security verification
  - Password expiration
  - System maintenance
- Personalizes emails based on user and department information

### Analysis Features
- User behavior analysis
- Risk level assessment
- Anomaly detection
- Template effectiveness tracking
- Click and response rate analysis
- Response time tracking

## Security Features
- Environment variable management for API keys
- CORS middleware for API security
- Input validation using Pydantic schemas
- Database transaction management
- Error handling and logging

## Dependencies
```
fastapi
uvicorn
sqlalchemy
databases
google-generativeai
python-dotenv
scikit-learn
pandas
numpy
requests
```

## Configuration
The application uses environment variables for configuration:
- `GOOGLE_API_KEY`: Your Google AI API key
- `GEMMA_MODEL`: AI model to use (default: gemma-3n-e4b-it)
- `GEMMA_TEMPERATURE`: Controls randomness in AI responses (default: 0.7)
- `GEMMA_MAX_TOKENS`: Maximum length of AI-generated content (default: 300)

## Database Schema

### Departments
- id (Primary Key)
- name (Unique)

### Users
- id (Primary Key)
- name
- email (Unique)
- department_id (Foreign Key)

### Email Logs
- id (Primary Key)
- user_id (Foreign Key)
- subject
- body
- sent_at
- clicked
- responded
- responded_at
- template_type 