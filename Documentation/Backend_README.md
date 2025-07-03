# Phishing Simulation Backend Demo

This project demonstrates a simple backend for simulating phishing email campaigns, tracking user interactions, and generating basic analytics. It is designed for demonstration and educational purposes.

## Features
- Manage departments and users
- Generate AI-powered phishing emails using Google's Gemma-3n-e4b-it model
- Track clicks and responses on emails
- View analytics by department
- AI-powered user behavior analysis and risk assessment

## AI Integration

This application uses **Google's Gemma-3n-e4b-it model** for generating sophisticated phishing simulation emails. The AI integration provides:

- **No prompt echo**: The AI generates only the email content (subject and body), never repeating the prompt or template instructions.
- **No placeholders**: Emails are fully realistic, with all details filled in—no [placeholder] text.
- **High-quality email generation** with personalized content
- **Multiple template types** for different phishing scenarios
- **Fallback mechanisms** for reliability

For detailed setup instructions, see [Gemma Integration Guide](Gemma_Integration_README.md).

## Setup Instructions

### 1. Install Dependencies
Make sure you have Python 3.8+ installed. Then, install the required packages:

```bash
pip install -r requirements.txt
```

### 2. Configure AI Integration
Create a `.env` file in the Backend directory with your Google AI API key:

```env
GOOGLE_API_KEY=your_google_ai_api_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/).

### 3. Start the FastAPI Server
Run the backend server using Uvicorn:

```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### 4. Test the AI Integration
Run the test script to verify the Gemma integration is working:

```bash
python test_gemma_integration.py
```

### 5. Run the Demo Script
In a new terminal, run the sample script to simulate a phishing campaign:

```bash
python sample_demo_script.py
```

This script will:
- Create two departments (IT and HR)
- Create two users (Alice in IT, Bob in HR)
- Generate AI-powered phishing emails for both users
- Simulate a click for Alice's email
- Print analytics showing clicks by department

## API Endpoints
- `POST /departments/` — Create a department
- `POST /users/` — Create a user
- `POST /generate-email?user_id=...` — Generate and log an AI-powered phishing email for a user
- `POST /generate-email/department?department_id=...` — Generate emails for all users in a department
- `POST /email_logs/{log_id}/click` — Simulate a user clicking a phishing email
- `GET /analytics/clicks_by_department` — View click analytics by department
- `GET /analytics/ai-analysis` — Get AI-powered user behavior analysis

## Notes
- This is a simulation only. No real emails are sent.
- The backend uses SQLite for storage (file: `phishing_sim.db`).
- AI email generation requires a valid Google AI API key.
- You can explore and test the API interactively at `http://127.0.0.1:8000/docs` when the server is running.

---

Feel free to modify or extend this project for your own demo or educational needs! 