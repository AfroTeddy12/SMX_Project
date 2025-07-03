# Data Directory Documentation

This directory contains JSON data files used by the phishing simulation platform.

## email_templates.json

This file contains predefined email templates for phishing simulations. Each template has the following structure:

```json
{
    "templates": [
        {
            "subject": "Email subject line",
            "body": "Email body content with {placeholders}",
            "type": "Category of phishing attempt",
            "difficulty": "Sophistication level (1-5)",
            "description": "Brief explanation of template's purpose"
        }
    ]
}
```

### Template Fields:
- `subject`: The email subject line that will be used
- `body`: The email body content, can include placeholders like {name}, {link}, etc.
- `type`: Category of the phishing attempt (e.g., account_security, document_request)
- `difficulty`: How sophisticated the phishing attempt is, rated from 1 (basic) to 5 (advanced)
- `description`: Brief explanation of what the template is trying to achieve

### Placeholder Variables:
- `{name}`: Recipient's name
- `{link}`: Phishing link
- `{manager_name}`: Name of a manager/authority figure
- `{random_number}`: Random package/order number
- `{tracking_link}`: Fake tracking link

## config.json

This file contains configuration settings for the application. The structure is:

```json
{
    "email_settings": {
        "smtp_server": "SMTP server address",
        "smtp_port": "SMTP port number",
        "sender_email": "Default sender email address",
        "sender_name": "Default sender name"
    },
    "security_settings": {
        "max_attempts": "Maximum login attempts",
        "session_timeout": "Session timeout in minutes",
        "password_policy": {
            "min_length": "Minimum password length",
            "require_special": "Whether special characters are required",
            "require_numbers": "Whether numbers are required"
        }
    }
}
```

### Configuration Sections:
1. `email_settings`: SMTP and email configuration
2. `security_settings`: Security-related configuration
   - `max_attempts`: Maximum failed login attempts before lockout
   - `session_timeout`: How long a session can be inactive
   - `password_policy`: Password requirements

## ai_prompts.json

This file contains prompts used by the AI system for various tasks. The structure is:

```json
{
    "email_generation": {
        "base_prompt": "Base prompt for email generation",
        "variations": [
            "Different variations of the base prompt"
        ]
    },
    "analysis": {
        "risk_assessment": "Prompt for risk assessment",
        "recommendations": "Prompt for generating recommendations"
    }
}
```

### Prompt Categories:
1. `email_generation`: Prompts for generating phishing emails
2. `analysis`: Prompts for analyzing user behavior and generating recommendations 