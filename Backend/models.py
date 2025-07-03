"""
Database Models for Phishing Simulation Platform
This module defines the SQLAlchemy models for the database schema.
It includes models for departments, users, and email logs.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Department(Base):
    """
    Department model representing organizational departments.
    
    Attributes:
        id: Primary key
        name: Department name (unique)
        users: Relationship to users in this department
    """
    __tablename__ = 'departments'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    users = relationship("User", back_populates="department")

class User(Base):
    """
    User model representing system users.
    
    Attributes:
        id: Primary key
        name: User's full name
        email: User's email address (unique)
        department_id: Foreign key to department
        training_completed: Whether user has completed training
        training_completed_at: Timestamp when training was completed
        department: Relationship to user's department
        email_logs: Relationship to user's email logs
    """
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    department_id = Column(Integer, ForeignKey('departments.id'))
    training_completed = Column(Boolean, default=False)
    training_completed_at = Column(DateTime, nullable=True)
    department = relationship("Department", back_populates="users")
    email_logs = relationship("EmailLog", back_populates="user")

class EmailLog(Base):
    """
    Email Log model for tracking phishing simulation emails.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to user
        subject: Email subject line
        body: Email body content
        sent_at: Timestamp when email was sent
        clicked: Whether user clicked the email
        clicked_at: Timestamp when user clicked the email
        responded: Whether user responded to the email
        responded_at: Timestamp when user responded
        template_type: Type of phishing template used
        user: Relationship to the target user
    """
    __tablename__ = 'email_logs'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    subject = Column(String)
    body = Column(String)
    sent_at = Column(DateTime)
    clicked = Column(Boolean, default=False)
    clicked_at = Column(DateTime, nullable=True)
    responded = Column(Boolean, default=False)
    responded_at = Column(DateTime, nullable=True)
    template_type = Column(String, nullable=True)
    user = relationship("User", back_populates="email_logs") 