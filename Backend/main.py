"""
Phishing Simulation Platform - Main Application
This module contains the FastAPI application and all API endpoints for the phishing simulation platform.
It handles user management, department management, email operations, and AI-powered features.
"""

from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import init_db, SessionLocal
import models, schemas
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from Utils.ai_utils import AIEmailGenerator, AIAnalyzer, MLRiskPredictor
from typing import List, Optional

# Initialize FastAPI application
app = FastAPI(
    title="Phishing Simulation Platform",
    description="API for managing phishing simulation campaigns and analyzing user behavior",
    version="1.0.0"
)

# Initialize AI components for email generation and analysis
email_generator = AIEmailGenerator()
ai_analyzer = AIAnalyzer()

# Configure CORS middleware for cross-origin requests
# Note: In production, replace "*" with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only. Use specific origins in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database initialization on application startup
@app.on_event("startup")
def on_startup():
    """Initialize the database on application startup."""
    init_db()

# Database session dependency
def get_db():
    """
    Dependency for getting database session.
    Yields a session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Root endpoint
@app.get("/")
def read_root():
    """Health check endpoint."""
    return {"message": "Phishing Simulation Backend Running"}

# Department Management Endpoints
@app.post("/departments/", response_model=schemas.Department)
def create_department(dept: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    """
    Create a new department.
    
    Args:
        dept: Department data
        db: Database session
    
    Returns:
        Created department object
    
    Raises:
        HTTPException: If department name is not unique
    """
    db_dept = models.Department(name=dept.name)
    db.add(db_dept)
    try:
        db.commit()
        db.refresh(db_dept)
        return db_dept
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Department name must be unique.")

@app.get("/departments/", response_model=list[schemas.Department])
def read_departments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get list of departments with pagination.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
    
    Returns:
        List of department objects
    """
    return db.query(models.Department).offset(skip).limit(limit).all()

@app.get("/departments/{department_id}", response_model=schemas.Department)
def get_department(department_id: int, db: Session = Depends(get_db)):
    """
    Get a specific department by ID.
    
    Args:
        department_id: ID of the department
        db: Database session
    
    Returns:
        Department object
    
    Raises:
        HTTPException: If department not found
    """
    dept = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept

@app.put("/departments/{department_id}", response_model=schemas.Department)
def update_department(department_id: int, dept: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    """
    Update a department's information.
    
    Args:
        department_id: ID of the department to update
        dept: Updated department data
        db: Database session
    
    Returns:
        Updated department object
    
    Raises:
        HTTPException: If department not found
    """
    db_dept = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db_dept.name = dept.name
    db.commit()
    db.refresh(db_dept)
    return db_dept

@app.delete("/departments/{department_id}")
def delete_department(department_id: int, db: Session = Depends(get_db)):
    """
    Delete a department.
    
    Args:
        department_id: ID of the department to delete
        db: Database session
    
    Returns:
        Success message
    
    Raises:
        HTTPException: If department not found
    """
    db_dept = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(db_dept)
    db.commit()
    return {"ok": True}

# User Management Endpoints
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user.
    
    Args:
        user: User data
        db: Database session
    
    Returns:
        Created user object
    """
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, department_id: int = Query(None), db: Session = Depends(get_db)):
    """
    Get list of users with optional department filter and pagination.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        department_id: Optional department ID to filter users
        db: Database session
    
    Returns:
        List of user objects
    """
    query = db.query(models.User)
    if department_id:
        query = query.filter(models.User.department_id == department_id)
    return query.offset(skip).limit(limit).all()

@app.get("/users/{user_id}", response_model=schemas.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get a specific user by ID.
    
    Args:
        user_id: ID of the user
        db: Database session
    
    Returns:
        User object
    
    Raises:
        HTTPException: If user not found
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Update a user's information.
    
    Args:
        user_id: ID of the user to update
        user: Updated user data
        db: Database session
    
    Returns:
        Updated user object
    
    Raises:
        HTTPException: If user not found
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in user.dict().items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Delete a user.
    
    Args:
        user_id: ID of the user to delete
        db: Database session
    
    Returns:
        Success message
    
    Raises:
        HTTPException: If user not found
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"ok": True}

# Email Log Management Endpoints
@app.post("/email_logs/", response_model=schemas.EmailLog)
def create_email_log(log: schemas.EmailLogCreate, db: Session = Depends(get_db)):
    """
    Create a new email log entry.
    
    Args:
        log: Email log data
        db: Database session
    
    Returns:
        Created email log object
    """
    db_log = models.EmailLog(**log.dict(), sent_at=datetime.utcnow())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.get("/email_logs/", response_model=list[schemas.EmailLog])
def read_email_logs(skip: int = 0, limit: int = 100, user_id: int = Query(None), department_id: int = Query(None), db: Session = Depends(get_db)):
    """
    Get list of email logs with optional filtering and pagination.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        user_id: Optional user ID to filter logs
        department_id: Optional department ID to filter logs
        db: Database session
    
    Returns:
        List of email log objects
    """
    query = db.query(models.EmailLog)
    if user_id:
        query = query.filter(models.EmailLog.user_id == user_id)
    if department_id:
        query = query.join(models.User).filter(models.User.department_id == department_id)
    return query.offset(skip).limit(limit).all()

@app.get("/email_logs/{log_id}", response_model=schemas.EmailLog)
def get_email_log(log_id: int, db: Session = Depends(get_db)):
    """
    Get a specific email log by ID.
    
    Args:
        log_id: ID of the email log
        db: Database session
    
    Returns:
        Email log object
    
    Raises:
        HTTPException: If email log not found
    """
    log = db.query(models.EmailLog).filter(models.EmailLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Email log not found")
    return log

@app.put("/email_logs/{log_id}", response_model=schemas.EmailLog)
def update_email_log(log_id: int, log: schemas.EmailLogCreate, db: Session = Depends(get_db)):
    """
    Update an email log entry.
    
    Args:
        log_id: ID of the email log to update
        log: Updated email log data
        db: Database session
    
    Returns:
        Updated email log object
    
    Raises:
        HTTPException: If email log not found
    """
    db_log = db.query(models.EmailLog).filter(models.EmailLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Email log not found")
    
    for key, value in log.dict().items():
        setattr(db_log, key, value)
    
    db.commit()
    db.refresh(db_log)
    return db_log

@app.delete("/email_logs/{log_id}")
def delete_email_log(log_id: int, db: Session = Depends(get_db)):
    """
    Delete an email log entry.
    
    Args:
        log_id: ID of the email log to delete
        db: Database session
    
    Returns:
        Success message
    
    Raises:
        HTTPException: If email log not found
    """
    db_log = db.query(models.EmailLog).filter(models.EmailLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Email log not found")
    db.delete(db_log)
    db.commit()
    return {"ok": True}

# Email Interaction Simulation Endpoints
@app.post("/email_logs/{log_id}/click")
def simulate_click(log_id: int, db: Session = Depends(get_db)):
    """
    Simulate a user clicking on a phishing email.
    
    Args:
        log_id: ID of the email log
        db: Database session
    
    Returns:
        Success message
    
    Raises:
        HTTPException: If email log not found
    """
    db_log = db.query(models.EmailLog).filter(models.EmailLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Email log not found")
    
    db_log.clicked = True
    db_log.clicked_at = datetime.utcnow()
    db.commit()
    return {"message": "Click simulated successfully"}

@app.post("/email_logs/{log_id}/respond")
def simulate_response(log_id: int, db: Session = Depends(get_db)):
    """
    Simulate a user responding to a phishing email.
    
    Args:
        log_id: ID of the email log
        db: Database session
    
    Returns:
        Success message
    
    Raises:
        HTTPException: If email log not found
    """
    db_log = db.query(models.EmailLog).filter(models.EmailLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Email log not found")
    
    db_log.responded = True
    db_log.responded_at = datetime.utcnow()
    db.commit()
    return {"message": "Response simulated successfully"}

# Analytics Endpoints
@app.get("/analytics/clicks_by_department")
def clicks_by_department(db: Session = Depends(get_db)):
    """
    Get click analytics grouped by department.
    
    Args:
        db: Database session
    
    Returns:
        Department click analytics
    """
    departments = db.query(models.Department).all()
    analytics = []
    
    for dept in departments:
        users = db.query(models.User).filter(models.User.department_id == dept.id).all()
        total_emails = 0
        total_clicks = 0
        
        for user in users:
            user_emails = db.query(models.EmailLog).filter(models.EmailLog.user_id == user.id).all()
            total_emails += len(user_emails)
            total_clicks += sum(1 for email in user_emails if email.clicked)
        
        click_rate = (total_clicks / total_emails * 100) if total_emails > 0 else 0
        
        analytics.append({
            "department": dept.name,
            "total_emails": total_emails,
            "total_clicks": total_clicks,
            "click_rate": round(click_rate, 2)
        })
    
    return analytics

# AI-Powered Email Generation Endpoints
@app.post("/generate-email")
def generate_email(
    user_id: int,
    template_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Generate and send a phishing email to a specific user using AI.
    
    Args:
        user_id: ID of the target user
        template_type: Optional template type to use
        db: Database session
    
    Returns:
        Generated email details
    
    Raises:
        HTTPException: If user not found or generation fails
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Generate email content using AI
        email_content = email_generator.generate_phishing_email(
            user_info={
                "name": user.name,
                "email": user.email,
                "department": user.department.name if user.department else "Unknown"
            },
            template_type=template_type
        )
        
        # Create email log entry
        db_log = models.EmailLog(
            user_id=user_id,
            subject=email_content["subject"],
            body=email_content["body"],
            sent_at=datetime.utcnow(),
            template_type=template_type
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        
        return {
            "message": "AI-powered phishing email generated and sent successfully",
            "email_id": db_log.id,
            "subject": email_content["subject"],
            "user": user.name,
            "department": user.department.name
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating email: {str(e)}")

@app.post("/generate-email/department")
def generate_email_department(
    department_id: int,
    template_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Generate and send phishing emails to all users in a department using AI.
    
    Args:
        department_id: ID of the target department
        template_type: Optional template type to use
        db: Database session
    
    Returns:
        Generation results
    
    Raises:
        HTTPException: If department not found or generation fails
    """
    department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    users = db.query(models.User).filter(models.User.department_id == department_id).all()
    if not users:
        raise HTTPException(status_code=404, detail="No users found in department")
    
    sent_count = 0
    failed_count = 0
    
    for user in users:
        try:
            # Generate email content using AI
            email_content = email_generator.generate_phishing_email(
                user_info={
                    "name": user.name,
                    "email": user.email,
                    "department": user.department.name if user.department else "Unknown"
                },
                template_type=template_type
            )
            
            # Create email log entry
            db_log = models.EmailLog(
                user_id=user.id,
                subject=email_content["subject"],
                body=email_content["body"],
                sent_at=datetime.utcnow(),
                template_type=template_type
            )
            db.add(db_log)
            sent_count += 1
            
        except Exception as e:
            failed_count += 1
            print(f"Failed to generate email for user {user.name}: {str(e)}")
    
    db.commit()
    
    return {
        "message": f"Generated emails for department: {department.name}",
        "sent": sent_count,
        "failed": failed_count,
        "total_users": len(users)
    }

# AI Analysis Endpoints
@app.get("/analytics/ai-analysis")
def get_ai_analysis(
    department_id: Optional[int] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get AI-powered analysis of user behavior and security risks.
    
    Args:
        department_id: Optional department ID to filter analysis
        user_id: Optional user ID to filter analysis
        db: Database session
    
    Returns:
        AI analysis results
    """
    try:
        # Get relevant data based on filters
        if user_id:
            users = db.query(models.User).filter(models.User.id == user_id).all()
        elif department_id:
            users = db.query(models.User).filter(models.User.department_id == department_id).all()
        else:
            users = db.query(models.User).all()
        
        email_logs = db.query(models.EmailLog).all()
        
        # Perform AI analysis
        analysis_results = ai_analyzer.analyze_user_behavior(users, email_logs)
        
        return analysis_results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing AI analysis: {str(e)}")

# Template Management Endpoints
@app.get("/templates")
def get_templates():
    """
    Get available email templates.
    
    Returns:
        List of available templates
    """
    templates = [
        {
            "id": "urgent_action",
            "name": "Urgent Action Required",
            "description": "Emails requiring immediate action",
            "difficulty": "beginner"
        },
        {
            "id": "password_reset",
            "name": "Password Reset",
            "description": "Fake password reset emails",
            "difficulty": "intermediate"
        },
        {
            "id": "invoice_payment",
            "name": "Invoice Payment",
            "description": "Fake invoice payment requests",
            "difficulty": "advanced"
        },
        {
            "id": "ceo_request",
            "name": "CEO Request",
            "description": "Emails pretending to be from CEO",
            "difficulty": "advanced"
        },
        {
            "id": "social_media",
            "name": "Social Media Alert",
            "description": "Fake social media notifications",
            "difficulty": "beginner"
        }
    ]
    
    return {"templates": templates}

@app.post("/templates/{template_id}/customize")
def customize_template(template_id: str, customization: dict):
    """
    Customize an email template.
    
    Args:
        template_id: ID of the template to customize
        customization: Customization parameters
    
    Returns:
        Customized template
    """
    # Mock implementation - in real app, you'd save customizations
    return {
        "template_id": template_id,
        "customization": customization,
        "message": "Template customized successfully"
    }

# A/B Testing Endpoints
@app.post("/ab-test")
def create_ab_test(ab_test_config: dict):
    """
    Create an A/B test for email campaigns.
    
    Args:
        ab_test_config: A/B test configuration
    
    Returns:
        A/B test details
    """
    # Mock implementation
    return {
        "test_id": f"ab_test_{Date.now()}",
        "config": ab_test_config,
        "status": "created"
    }

@app.get("/ab-tests")
def get_ab_tests():
    """
    Get all A/B tests.
    
    Returns:
        List of A/B tests
    """
    # Mock data
    ab_tests = [
        {
            "test_id": "ab_test_1",
            "name": "Subject Line Test",
            "status": "running",
            "created_at": "2024-01-15T10:00:00Z"
        },
        {
            "test_id": "ab_test_2",
            "name": "Call-to-Action Test",
            "status": "completed",
            "created_at": "2024-01-10T14:30:00Z"
        }
    ]
    
    return {"ab_tests": ab_tests}

@app.get("/ab-tests/{test_id}/results")
def get_ab_test_results(test_id: str):
    """
    Get results for a specific A/B test.
    
    Args:
        test_id: ID of the A/B test
    
    Returns:
        A/B test results with statistical significance
    """
    # Mock data - in real implementation, you'd calculate from actual data
    results = {
        "test_id": test_id,
        "variant_a": {
            "emails_sent": 50,
            "clicks": 16,
            "click_rate": 32.0,
            "confidence_interval": [18.5, 45.5]
        },
        "variant_b": {
            "emails_sent": 50,
            "clicks": 22,
            "click_rate": 44.0,
            "confidence_interval": [30.5, 57.5]
        },
        "statistical_significance": True,
        "p_value": 0.023,
        "winner": "variant_b",
        "improvement": 37.5  # percentage improvement
    }
    
    return results

# Machine Learning Endpoints
@app.post("/ml/train-risk-model")
def train_risk_model(db: Session = Depends(get_db)):
    """
    Train the machine learning risk prediction model.
    
    Args:
        db: Database session
    
    Returns:
        Training results
    """
    try:
        # Get all users and their email history
        users = db.query(models.User).all()
        email_logs = db.query(models.EmailLog).all()
        
        # Prepare training data
        training_data = []
        for user in users:
            user_emails = [log for log in email_logs if log.user_id == user.id]
            if user_emails:  # Only include users with email history
                training_data.append({
                    "user": {
                        "id": user.id,
                        "name": user.name,
                        "department": user.department,
                        "age": getattr(user, 'age', 35)
                    },
                    "emails": [
                        {
                            "user_id": email.user_id,
                            "clicked": email.clicked,
                            "sent_at": email.sent_at.isoformat() if email.sent_at else None,
                            "clicked_at": email.clicked_at.isoformat() if email.clicked_at else None,
                            "template_type": email.template_type
                        }
                        for email in user_emails
                    ]
                })
        
        # Initialize and train the model
        risk_predictor = MLRiskPredictor()
        risk_predictor.train_model(training_data)
        
        return {
            "message": "Risk prediction model trained successfully",
            "users_trained": len(training_data),
            "model_status": "trained" if risk_predictor.is_trained else "failed"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training model: {str(e)}")

@app.get("/ml/predict-user-risk/{user_id}")
def predict_user_risk(user_id: int, db: Session = Depends(get_db)):
    """
    Predict risk level for a specific user.
    
    Args:
        user_id: ID of the user
        db: Database session
    
    Returns:
        Risk prediction results
    """
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        email_logs = db.query(models.EmailLog).filter(models.EmailLog.user_id == user_id).all()
        
        # Initialize risk predictor
        risk_predictor = MLRiskPredictor()
        
        # Prepare user data
        user_data = {
            "id": user.id,
            "name": user.name,
            "department": user.department,
            "age": getattr(user, 'age', 35)
        }
        
        # Prepare email logs
        email_data = [
            {
                "user_id": email.user_id,
                "clicked": email.clicked,
                "sent_at": email.sent_at.isoformat() if email.sent_at else None,
                "clicked_at": email.clicked_at.isoformat() if email.clicked_at else None,
                "template_type": email.template_type
            }
            for email in email_logs
        ]
        
        # Make prediction
        prediction = risk_predictor.predict_user_risk(user_data, email_data)
        
        return {
            "user_id": user_id,
            "user_name": user.name,
            "prediction": prediction
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting risk: {str(e)}")

@app.get("/ml/bulk-risk-prediction")
def bulk_risk_prediction(db: Session = Depends(get_db)):
    """
    Get risk predictions for all users.
    
    Args:
        db: Database session
    
    Returns:
        Risk predictions for all users
    """
    try:
        users = db.query(models.User).all()
        email_logs = db.query(models.EmailLog).all()
        
        risk_predictor = MLRiskPredictor()
        predictions = []
        
        for user in users:
            user_emails = [log for log in email_logs if log.user_id == user.id]
            
            user_data = {
                "id": user.id,
                "name": user.name,
                "department": user.department,
                "age": getattr(user, 'age', 35)
            }
            
            email_data = [
                {
                    "user_id": email.user_id,
                    "clicked": email.clicked,
                    "sent_at": email.sent_at.isoformat() if email.sent_at else None,
                    "clicked_at": email.clicked_at.isoformat() if email.clicked_at else None,
                    "template_type": email.template_type
                }
                for email in user_emails
            ]
            
            prediction = risk_predictor.predict_user_risk(user_data, email_data)
            
            predictions.append({
                "user_id": user.id,
                "user_name": user.name,
                "department": user.department,
                "prediction": prediction
            })
        
        return {
            "predictions": predictions,
            "total_users": len(predictions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in bulk prediction: {str(e)}")

# Training Simulation Endpoints
@app.post("/users/{user_id}/complete-training")
def complete_user_training(user_id: int, db: Session = Depends(get_db)):
    """
    Simulate that a user has completed training.
    
    Args:
        user_id: ID of the user
        db: Database session
    
    Returns:
        Success message with completion details
    
    Raises:
        HTTPException: If user not found
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.training_completed = True
    user.training_completed_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"Training completed for {user.name}",
        "user_id": user_id,
        "user_name": user.name,
        "completed_at": user.training_completed_at
    }

@app.post("/departments/{department_id}/complete-training")
def complete_department_training(department_id: int, db: Session = Depends(get_db)):
    """
    Simulate that all users in a department have completed training.
    
    Args:
        department_id: ID of the department
        db: Database session
    
    Returns:
        Success message with completion details
    
    Raises:
        HTTPException: If department not found
    """
    department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    users = db.query(models.User).filter(models.User.department_id == department_id).all()
    if not users:
        raise HTTPException(status_code=404, detail="No users found in department")
    
    completed_count = 0
    for user in users:
        if not user.training_completed:
            user.training_completed = True
            user.training_completed_at = datetime.utcnow()
            completed_count += 1
    
    db.commit()
    
    return {
        "message": f"Training completed for {completed_count} users in {department.name}",
        "department_id": department_id,
        "department_name": department.name,
        "total_users": len(users),
        "newly_completed": completed_count,
        "already_completed": len(users) - completed_count
    }

@app.post("/users/complete-all-training")
def complete_all_users_training(db: Session = Depends(get_db)):
    """
    Simulate that all users have completed training.
    
    Args:
        db: Database session
    
    Returns:
        Success message with completion details
    """
    users = db.query(models.User).all()
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    
    completed_count = 0
    for user in users:
        if not user.training_completed:
            user.training_completed = True
            user.training_completed_at = datetime.utcnow()
            completed_count += 1
    
    db.commit()
    
    return {
        "message": f"Training completed for {completed_count} users",
        "total_users": len(users),
        "newly_completed": completed_count,
        "already_completed": len(users) - completed_count
    }

@app.get("/analytics/training-completion")
def get_training_completion_analytics(db: Session = Depends(get_db)):
    """
    Get training completion analytics across the organization.
    
    Args:
        db: Database session
    
    Returns:
        Training completion statistics
    """
    total_users = db.query(models.User).count()
    completed_users = db.query(models.User).filter(models.User.training_completed == True).count()
    completion_rate = (completed_users / total_users * 100) if total_users > 0 else 0
    
    # Get completion by department
    departments = db.query(models.Department).all()
    department_stats = []
    
    for dept in departments:
        dept_users = db.query(models.User).filter(models.User.department_id == dept.id).all()
        dept_total = len(dept_users)
        dept_completed = sum(1 for user in dept_users if user.training_completed)
        dept_rate = (dept_completed / dept_total * 100) if dept_total > 0 else 0
        
        department_stats.append({
            "department_id": dept.id,
            "department_name": dept.name,
            "total_users": dept_total,
            "completed_users": dept_completed,
            "completion_rate": round(dept_rate, 1)
        })
    
    # Get recent completions
    recent_completions = db.query(models.User).filter(
        models.User.training_completed == True,
        models.User.training_completed_at.isnot(None)
    ).order_by(models.User.training_completed_at.desc()).limit(10).all()
    
    recent_data = [
        {
            "user_id": user.id,
            "user_name": user.name,
            "department": user.department.name,
            "completed_at": user.training_completed_at
        }
        for user in recent_completions
    ]
    
    return {
        "overall_stats": {
            "total_users": total_users,
            "completed_users": completed_users,
            "completion_rate": round(completion_rate, 1)
        },
        "department_stats": department_stats,
        "recent_completions": recent_data
    }

@app.delete("/wipe-all-data")
def wipe_all_data(db: Session = Depends(get_db)):
    """
    Wipe all data from the database (for testing/reset purposes).
    
    Args:
        db: Database session
    
    Returns:
        Success message with deletion details
    """
    try:
        # Delete all email logs
        email_logs_deleted = db.query(models.EmailLog).delete()
        
        # Delete all users
        users_deleted = db.query(models.User).delete()
        
        # Delete all departments
        departments_deleted = db.query(models.Department).delete()
        
        db.commit()
        
        return {
            "message": "All data wiped successfully",
            "deleted_counts": {
                "email_logs": email_logs_deleted,
                "users": users_deleted,
                "departments": departments_deleted
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error wiping data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 