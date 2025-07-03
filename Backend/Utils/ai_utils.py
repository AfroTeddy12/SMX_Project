"""
AI Utilities for Phishing Simulation Platform
This module provides AI-powered functionality for generating phishing emails and analyzing user behavior.
It uses Google's Gemma-3n-e4b-it model for email generation and scikit-learn for behavior analysis.
"""

import os
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from datetime import datetime
import joblib

# Load environment variables for API keys and configuration
load_dotenv()

# Initialize Google Generative AI with API key from environment variables
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class AIEmailGenerator:
    """
    AI-powered email generator for creating sophisticated phishing emails.
    Uses Google's Gemma-3n-e4b-it model to generate personalized and context-aware emails.
    """
    
    def __init__(self):
        """
        Initialize the email generator with predefined template types.
        Each template type represents a different phishing scenario.
        """
        self.templates = {
            "urgent_action": "Your account requires immediate attention",
            "security_alert": "Security verification needed",
            "password_expiry": "Password expiration notice",
            "system_update": "System maintenance required"
        }
        # Initialize the Gemma model
        self.model = genai.GenerativeModel('gemma-3n-e4b-it')

    def generate_phishing_email(self, user_info: Dict[str, Any], template_type: str = None) -> Dict[str, str]:
        """
        Generate a sophisticated phishing email using Google's Gemma AI.
        
        Args:
            user_info: Dictionary containing user details (name, email, department)
            template_type: Optional specific template type to use
            
        Returns:
            Dictionary containing generated email data (subject, body, template_type, generated_at)
            
        Note:
            If AI generation fails, falls back to a basic template
        """
        if not template_type:
            template_type = np.random.choice(list(self.templates.keys()))

        # Construct a more direct prompt for the Gemma model
        if template_type == "urgent_action":
            prompt = f"""Write a complete urgent action email for {user_info['name']} from {user_info['department']} department at SMX.

Create a realistic email about an urgent account security issue that requires immediate action. Include specific details like IP addresses, times, and consequences. Make it sound like a legitimate IT security alert from SMX.

Format as:
Subject: [specific urgent subject]
[complete email body with all details filled in - no placeholders, signed by SMX IT Security Team]"""
        
        elif template_type == "security_alert":
            prompt = f"""Write a complete security verification email for {user_info['name']} from {user_info['department']} department at SMX.

Create a realistic email about suspicious account activity that needs verification. Include specific details about the suspicious activity and verification steps. Make it sound like a legitimate security alert from SMX.

Format as:
Subject: [specific security subject]
[complete email body with all details filled in - no placeholders, signed by SMX Security Team]"""
        
        elif template_type == "password_expiry":
            prompt = f"""Write a complete password expiration notice for {user_info['name']} from {user_info['department']} department at SMX.

Create a realistic email about password expiration with specific dates and instructions. Include the expiration date, consequences, and step-by-step instructions. Make it sound like a legitimate IT notification from SMX.

Format as:
Subject: [specific password expiry subject]
[complete email body with all details filled in - no placeholders, signed by SMX IT Team]"""
        
        elif template_type == "system_update":
            prompt = f"""Write a complete system maintenance email for {user_info['name']} from {user_info['department']} department at SMX.

Create a realistic email about scheduled system maintenance with specific dates, times, and affected services. Include what will be updated, downtime details, and required actions. Make it sound like a legitimate IT maintenance notice from SMX.

Format as:
Subject: [specific maintenance subject]
[complete email body with all details filled in - no placeholders, signed by SMX IT Operations Team]"""
        
        else:
            prompt = f"""Write a complete email for {user_info['name']} from {user_info['department']} department at SMX.

Create a realistic email about an important notice that requires action. Include specific details and clear instructions. Make it sound professional and legitimate from SMX.

Format as:
Subject: [specific subject]
[complete email body with all details filled in - no placeholders, signed by SMX Team]"""

        try:
            # Call Google's Gemma API to generate email content
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=300,
                    top_p=0.8,
                    top_k=40
                )
            )
            
            # Parse the generated content
            email_content = response.text
            subject, body = self._parse_email_content(email_content)
            
            return {
                "subject": subject,
                "body": body,
                "template_type": template_type,
                "generated_at": datetime.utcnow()
            }
        except Exception as e:
            print(f"Error generating email with Gemma: {str(e)}")
            return self._fallback_email(user_info, template_type)

    def _parse_email_content(self, content: str) -> tuple:
        """
        Parse the AI-generated content into subject and body.
        
        Args:
            content: Raw email content from AI
            
        Returns:
            Tuple of (subject, body)
        """
        # Clean the content and remove any prompt-like text
        content = content.strip()
        
        # Look for "Subject:" line
        lines = content.split('\n')
        subject = ""
        body_lines = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            if line.lower().startswith('subject:'):
                # Extract subject
                subject = line.replace('Subject:', '').replace('subject:', '').strip()
                # Take all remaining lines as body
                body_lines = [l.strip() for l in lines[i+1:] if l.strip()]
                break
            elif i == 0 and not line.lower().startswith('subject:'):
                # If first line doesn't start with Subject:, treat it as subject
                subject = line
                body_lines = [l.strip() for l in lines[1:] if l.strip()]
                break
        
        # If no subject found, use a default
        if not subject:
            subject = "Important Notice"
        
        # Join body lines
        body = '\n'.join(body_lines) if body_lines else "Please review the attached information."
        
        return subject, body

    def _fallback_email(self, user_info: Dict[str, Any], template_type: str) -> Dict[str, str]:
        """
        Generate a fallback email if AI generation fails.
        
        Args:
            user_info: Dictionary containing user details
            template_type: Template type to use
            
        Returns:
            Dictionary containing fallback email data
        """
        subject = f"Action Required: {self.templates.get(template_type, 'Important Notice')}"
        body = f"Dear {user_info['name']},\n\nThis is an automated message from SMX regarding your account security. Please verify your credentials immediately.\n\nBest regards,\nSMX IT Security Team"
        return {
            "subject": subject,
            "body": body,
            "template_type": template_type,
            "generated_at": datetime.utcnow()
        }

class AIAnalyzer:
    """
    AI-powered analyzer for user behavior and risk assessment.
    Uses machine learning to detect anomalies and assess risk levels.
    """
    
    def __init__(self):
        """
        Initialize the analyzer with an Isolation Forest model for anomaly detection.
        """
        self.model = IsolationForest(contamination=0.1, random_state=42)

    def analyze_user_behavior(self, email_logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze user behavior patterns and identify potential risks.
        
        Args:
            email_logs: List of email log entries to analyze
            
        Returns:
            Dictionary containing analysis results:
            - risk_level: Overall risk assessment
            - metrics: Various behavioral metrics
            - recommendations: List of security recommendations
        """
        if not email_logs:
            return {"risk_level": "unknown", "recommendations": ["Insufficient data for analysis"]}

        # Convert logs to DataFrame for analysis
        df = pd.DataFrame(email_logs)
        
        # Calculate key metrics
        click_rate = df['clicked'].mean()
        response_rate = df['responded'].mean()
        avg_response_time = self._calculate_avg_response_time(df)
        
        # Prepare features for anomaly detection
        features = np.array([
            click_rate,
            response_rate,
            avg_response_time
        ]).reshape(1, -1)
        
        # Detect anomalies
        anomaly_score = self.model.fit_predict(features)[0]
        
        # Generate risk assessment
        risk_level = self._calculate_risk_level(click_rate, response_rate, anomaly_score)
        recommendations = self._generate_recommendations(risk_level, click_rate, response_rate)
        
        return {
            "risk_level": risk_level,
            "metrics": {
                "click_rate": click_rate,
                "response_rate": response_rate,
                "avg_response_time": avg_response_time
            },
            "recommendations": recommendations
        }

    def _calculate_avg_response_time(self, df: pd.DataFrame) -> float:
        """
        Calculate average response time in hours.
        
        Args:
            df: DataFrame containing email logs
            
        Returns:
            Average response time in hours
        """
        if 'responded_at' not in df.columns or 'sent_at' not in df.columns:
            return 0.0
        
        response_times = []
        for _, row in df.iterrows():
            if pd.notna(row['responded_at']) and pd.notna(row['sent_at']):
                delta = row['responded_at'] - row['sent_at']
                response_times.append(delta.total_seconds() / 3600)  # Convert to hours
        
        return np.mean(response_times) if response_times else 0.0

    def _calculate_risk_level(self, click_rate: float, response_rate: float, anomaly_score: int) -> str:
        """
        Calculate risk level based on metrics and anomaly detection.
        
        Args:
            click_rate: Rate of email clicks
            response_rate: Rate of email responses
            anomaly_score: Score from anomaly detection
            
        Returns:
            Risk level as string: 'high', 'medium', or 'low'
        """
        if anomaly_score == -1:  # Anomaly detected
            return "high"
        
        risk_score = (click_rate + response_rate) / 2
        if risk_score > 0.7:
            return "high"
        elif risk_score > 0.3:
            return "medium"
        return "low"

    def _generate_recommendations(self, risk_level: str, click_rate: float, response_rate: float) -> List[str]:
        """
        Generate security recommendations based on risk level and metrics.
        
        Args:
            risk_level: Overall risk level
            click_rate: Rate of email clicks
            response_rate: Rate of email responses
            
        Returns:
            List of security recommendations
        """
        recommendations = []
        
        if risk_level == "high":
            recommendations.extend([
                "Implement mandatory security awareness training",
                "Enable multi-factor authentication",
                "Conduct regular phishing simulations",
                "Review and update security policies"
            ])
        elif risk_level == "medium":
            recommendations.extend([
                "Schedule security awareness training",
                "Review current security measures",
                "Consider implementing additional security controls"
            ])
        else:
            recommendations.extend([
                "Maintain current security awareness program",
                "Continue regular phishing simulations",
                "Monitor for changes in user behavior"
            ])
        
        return recommendations

class MLRiskPredictor:
    """
    Machine Learning-based risk prediction for users.
    Uses Random Forest to predict likelihood of clicking phishing emails.
    """
    
    def __init__(self):
        """
        Initialize the ML risk predictor with a Random Forest model.
        """
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_path = "Models/risk_predictor.joblib"
        self.scaler_path = "Models/risk_scaler.joblib"
        
        # Try to load existing model
        self._load_model()
    
    def _load_model(self):
        """
        Load pre-trained model if available.
        """
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                self.is_trained = True
                print("✅ Loaded pre-trained risk prediction model")
        except Exception as e:
            print(f"⚠️ Could not load pre-trained model: {e}")
    
    def _save_model(self):
        """
        Save the trained model for future use.
        """
        try:
            os.makedirs("Models", exist_ok=True)
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            print("✅ Saved risk prediction model")
        except Exception as e:
            print(f"❌ Could not save model: {e}")
    
    def extract_features(self, user_data: Dict[str, Any], email_logs: List[Dict[str, Any]]) -> List[float]:
        """
        Extract features from user data and email history.
        
        Args:
            user_data: User information
            email_logs: User's email interaction history
            
        Returns:
            List of numerical features for ML model
        """
        user_emails = [log for log in email_logs if log.get('user_id') == user_data.get('id')]
        
        features = [
            # Basic user features
            user_data.get('age', 35),  # Default age if not available
            len(user_emails),  # Total emails received
            
            # Click behavior features
            sum(1 for email in user_emails if email.get('clicked', False)),  # Total clicks
            sum(1 for email in user_emails if email.get('clicked', False)) / max(len(user_emails), 1),  # Click rate
            
            # Response time features
            self._calculate_avg_response_time(user_emails),
            self._calculate_response_time_variance(user_emails),
            
            # Time-based features
            self._calculate_work_hours_clicks(user_emails),
            self._calculate_weekend_clicks(user_emails),
            
            # Template vulnerability features
            self._calculate_template_vulnerability(user_emails),
            
            # Department risk factor (encoded)
            self._encode_department_risk(user_data.get('department', 'Unknown')),
            
            # Recent behavior (last 7 days)
            self._calculate_recent_activity(user_emails, days=7)
        ]
        
        return features
    
    def _calculate_avg_response_time(self, emails: List[Dict[str, Any]]) -> float:
        """Calculate average response time in minutes."""
        response_times = []
        for email in emails:
            if email.get('clicked') and email.get('sent_at') and email.get('clicked_at'):
                try:
                    sent_time = pd.to_datetime(email['sent_at'])
                    clicked_time = pd.to_datetime(email['clicked_at'])
                    response_time = (clicked_time - sent_time).total_seconds() / 60
                    response_times.append(response_time)
                except:
                    continue
        
        return np.mean(response_times) if response_times else 0.0
    
    def _calculate_response_time_variance(self, emails: List[Dict[str, Any]]) -> float:
        """Calculate variance in response times."""
        response_times = []
        for email in emails:
            if email.get('clicked') and email.get('sent_at') and email.get('clicked_at'):
                try:
                    sent_time = pd.to_datetime(email['sent_at'])
                    clicked_time = pd.to_datetime(email['clicked_at'])
                    response_time = (clicked_time - sent_time).total_seconds() / 60
                    response_times.append(response_time)
                except:
                    continue
        
        return np.var(response_times) if len(response_times) > 1 else 0.0
    
    def _calculate_work_hours_clicks(self, emails: List[Dict[str, Any]]) -> float:
        """Calculate percentage of clicks during work hours (9 AM - 5 PM)."""
        work_hour_clicks = 0
        total_clicks = 0
        
        for email in emails:
            if email.get('clicked') and email.get('clicked_at'):
                try:
                    clicked_time = pd.to_datetime(email['clicked_at'])
                    hour = clicked_time.hour
                    if 9 <= hour <= 17:  # Work hours
                        work_hour_clicks += 1
                    total_clicks += 1
                except:
                    continue
        
        return work_hour_clicks / max(total_clicks, 1)
    
    def _calculate_weekend_clicks(self, emails: List[Dict[str, Any]]) -> float:
        """Calculate percentage of clicks on weekends."""
        weekend_clicks = 0
        total_clicks = 0
        
        for email in emails:
            if email.get('clicked') and email.get('clicked_at'):
                try:
                    clicked_time = pd.to_datetime(email['clicked_at'])
                    if clicked_time.weekday() >= 5:  # Saturday = 5, Sunday = 6
                        weekend_clicks += 1
                    total_clicks += 1
                except:
                    continue
        
        return weekend_clicks / max(total_clicks, 1)
    
    def _calculate_template_vulnerability(self, emails: List[Dict[str, Any]]) -> float:
        """Calculate vulnerability score based on template types clicked."""
        template_click_rates = {
            'urgent_action': 0.45,
            'security_alert': 0.32,
            'password_expiry': 0.20,
            'system_update': 0.15
        }
        
        vulnerability_score = 0
        total_clicks = 0
        
        for email in emails:
            if email.get('clicked'):
                template_type = email.get('template_type', 'unknown')
                vulnerability_score += template_click_rates.get(template_type, 0.25)
                total_clicks += 1
        
        return vulnerability_score / max(total_clicks, 1)
    
    def _encode_department_risk(self, department: str) -> float:
        """Encode department risk level as numerical value."""
        department_risk = {
            'IT': 0.3,  # Lower risk - tech savvy
            'HR': 0.6,  # Medium risk
            'Finance': 0.7,  # Higher risk - sensitive data
            'Sales': 0.5,  # Medium risk
            'Marketing': 0.4,  # Medium-low risk
            'Operations': 0.5,  # Medium risk
            'Legal': 0.8,  # High risk - compliance focused
            'Executive': 0.9,  # Highest risk - busy executives
        }
        
        return department_risk.get(department, 0.5)
    
    def _calculate_recent_activity(self, emails: List[Dict[str, Any]], days: int = 7) -> float:
        """Calculate recent activity level."""
        recent_date = datetime.now() - pd.Timedelta(days=days)
        recent_emails = [
            email for email in emails 
            if email.get('sent_at') and pd.to_datetime(email['sent_at']) >= recent_date
        ]
        
        return len(recent_emails)
    
    def train_model(self, training_data: List[Dict[str, Any]]):
        """
        Train the risk prediction model.
        
        Args:
            training_data: List of user data with known outcomes
        """
        print("🤖 Training risk prediction model...")
        
        X = []  # Features
        y = []  # Labels (1 = high risk, 0 = low risk)
        
        for user_record in training_data:
            features = self.extract_features(user_record['user'], user_record['emails'])
            # Define high risk as click rate > 30%
            click_rate = sum(1 for email in user_record['emails'] if email.get('clicked', False)) / max(len(user_record['emails']), 1)
            label = 1 if click_rate > 0.3 else 0
            
            X.append(features)
            y.append(label)
        
        if len(X) < 10:
            print("⚠️ Insufficient training data. Need at least 10 user records.")
            return
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        self.is_trained = True
        
        # Save model
        self._save_model()
        
        print(f"✅ Model trained on {len(X)} user records")
    
    def predict_user_risk(self, user_data: Dict[str, Any], email_logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Predict risk level for a user.
        
        Args:
            user_data: User information
            email_logs: User's email interaction history
            
        Returns:
            Risk prediction with confidence score
        """
        if not self.is_trained:
            return {
                "risk_level": "unknown",
                "confidence": 0.0,
                "risk_score": 0.5,
                "message": "Model not trained yet"
            }
        
        # Extract features
        features = self.extract_features(user_data, email_logs)
        features_scaled = self.scaler.transform([features])
        
        # Make prediction
        risk_probability = self.model.predict_proba(features_scaled)[0]
        risk_score = risk_probability[1]  # Probability of being high risk
        
        # Determine risk level
        if risk_score > 0.7:
            risk_level = "high"
        elif risk_score > 0.4:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        # Calculate confidence based on feature quality
        confidence = min(risk_score * 1.2, 1.0) if risk_score > 0.5 else max(risk_score * 0.8, 0.1)
        
        return {
            "risk_level": risk_level,
            "confidence": round(confidence, 3),
            "risk_score": round(risk_score, 3),
            "features_used": len(features),
            "recommendations": self._get_risk_recommendations(risk_level, risk_score)
        }
    
    def _get_risk_recommendations(self, risk_level: str, risk_score: float) -> List[str]:
        """Get personalized recommendations based on risk level."""
        recommendations = []
        
        if risk_level == "high":
            recommendations.extend([
                "Immediate security awareness training required",
                "Enable mandatory multi-factor authentication",
                "Implement stricter email filtering",
                "Schedule one-on-one security consultation"
            ])
        elif risk_level == "medium":
            recommendations.extend([
                "Schedule security awareness training within 30 days",
                "Review current security practices",
                "Consider additional security controls"
            ])
        else:
            recommendations.extend([
                "Continue current security awareness program",
                "Monitor for changes in behavior patterns"
            ])
        
        return recommendations 