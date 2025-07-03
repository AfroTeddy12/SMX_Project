"""
Pydantic Schemas for Phishing Simulation Platform
This module defines the Pydantic models for request/response validation and serialization.
It includes schemas for departments, users, email logs, and AI analysis.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DepartmentBase(BaseModel):
    """
    Base schema for department data.
    
    Attributes:
        name: Department name
    """
    name: str

class DepartmentCreate(DepartmentBase):
    """
    Schema for creating a new department.
    Inherits from DepartmentBase.
    """
    pass

class Department(DepartmentBase):
    """
    Schema for department response.
    Includes ID and inherits from DepartmentBase.
    
    Attributes:
        id: Department ID
    """
    id: int
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    """
    Base schema for user data.
    
    Attributes:
        name: User's full name
        email: User's email address
        department_id: ID of user's department
    """
    name: str
    email: str
    department_id: int

class UserCreate(UserBase):
    """
    Schema for creating a new user.
    Inherits from UserBase.
    """
    pass

class User(UserBase):
    """
    Schema for user response.
    Includes ID and department relationship.
    
    Attributes:
        id: User ID
        training_completed: Whether user has completed training
        training_completed_at: Timestamp when training was completed
        department: Associated department object
    """
    id: int
    training_completed: bool = False
    training_completed_at: Optional[datetime] = None
    department: Department
    class Config:
        orm_mode = True

class EmailLogBase(BaseModel):
    """
    Base schema for email log data.
    
    Attributes:
        user_id: ID of target user
        subject: Email subject line
        body: Email body content
        template_type: Optional type of phishing template
    """
    user_id: int
    subject: str
    body: str
    template_type: Optional[str] = None

class EmailLogCreate(EmailLogBase):
    """
    Schema for creating a new email log.
    Inherits from EmailLogBase.
    """
    pass

class EmailLog(EmailLogBase):
    """
    Schema for email log response.
    Includes additional tracking fields.
    
    Attributes:
        id: Log ID
        sent_at: Timestamp when email was sent
        clicked: Whether user clicked the email
        clicked_at: Optional timestamp when user clicked the email
        responded: Whether user responded to the email
        responded_at: Optional timestamp when user responded
        user: Associated user object
    """
    id: int
    sent_at: datetime
    clicked: bool
    clicked_at: Optional[datetime] = None
    responded: bool
    responded_at: Optional[datetime] = None
    user: User
    class Config:
        orm_mode = True

# AI Analysis Models
class Metrics(BaseModel):
    """
    Schema for user behavior metrics.
    
    Attributes:
        click_rate: Rate of email clicks
        response_rate: Rate of email responses
        avg_response_time: Average response time in hours
    """
    click_rate: float
    response_rate: float
    avg_response_time: float

class AIAnalysis(BaseModel):
    """
    Schema for AI-powered analysis results.
    
    Attributes:
        risk_level: Overall risk assessment
        metrics: User behavior metrics
        recommendations: List of security recommendations
    """
    risk_level: str
    metrics: Metrics
    recommendations: List[str]

class TemplateSuggestion(BaseModel):
    """
    Schema for email template effectiveness analysis.
    
    Attributes:
        template: Template type
        effectiveness: Overall effectiveness score
        click_rate: Rate of clicks for this template
        response_rate: Rate of responses for this template
        total_sent: Total number of emails sent with this template
    """
    template: str
    effectiveness: float
    click_rate: float
    response_rate: float
    total_sent: int

class TemplateSuggestions(BaseModel):
    """
    Schema for template suggestions response.
    
    Attributes:
        suggestions: List of template suggestions
        total_templates: Total number of templates analyzed
    """
    suggestions: List[TemplateSuggestion]
    total_templates: int 