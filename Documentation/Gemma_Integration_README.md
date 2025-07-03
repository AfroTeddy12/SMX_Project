# Google Gemma-3n-e4b-it Integration Guide

This guide explains how to set up and use Google's Gemma-3n-e4b-it model for AI-powered email generation in the phishing simulation platform.

## Overview

The application uses Google's Gemma-3n-e4b-it model for generating sophisticated phishing simulation emails. The latest version ensures:

- **No prompt echo**: The AI generates only the email content (subject and body), never repeating the prompt or template instructions.
- **No placeholders**: Emails are fully realistic, with all details filled in—no [placeholder] text.
- **High quality**: Advanced language model with excellent text generation capabilities.
- **Privacy**: Google's privacy-focused approach to AI.
- **Reliability**: Stable and consistent performance.

## Setup Instructions

### 1. Get Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Navigate to the API section
4. Create a new API key
5. Copy the API key for use in the application

### 2. Configure Environment Variables

Create or update your `.env` file in the Backend directory:

```env
# Google AI Configuration
GOOGLE_API_KEY=your_google_ai_api_key_here

# Optional Gemma Configuration
GEMMA_MODEL=gemma-3n-e4b-it
GEMMA_TEMPERATURE=0.7
GEMMA_MAX_TOKENS=300
```

### 3. Install Dependencies

Install the required Python packages:

```bash
cd Backend
pip install -r requirements.txt
```

The key dependency is `google-generativeai` which provides the interface to Google's AI models.

## Usage

### Basic Email Generation

The email generation now produces only the email content (subject and body), never echoing the prompt or including placeholders. Example:

```python
from Utils.ai_utils import AIEmailGenerator

# Initialize the generator
email_generator = AIEmailGenerator()

# Generate an email
user_info = {
    "name": "John Doe",
    "email": "john.doe@company.com",
    "department": "IT"
}

email_data = email_generator.generate_phishing_email(user_info, "urgent_action")
print(f"Subject: {email_data['subject']}")
print(f"Body: {email_data['body']}")
```

**Example output:**
```
Subject: URGENT: Immediate Action Required - SMX Account Security Alert
Body: Dear John Doe,

We have detected suspicious activity on your SMX account from an unknown IP address at 2:34 AM. Please change your password immediately and review your recent account activity. Failure to act within 2 hours will result in temporary suspension.

Best regards,
SMX IT Security Team
```

### API Endpoints

The existing API endpoints remain unchanged:

- `POST /generate-email` - Generate email for single user
- `POST /generate-email/department` - Generate emails for entire department

### Template Types

The same template types are supported:

- `urgent_action` - Your account requires immediate attention
- `security_alert` - Security verification needed
- `password_expiry` - Password expiration notice
- `system_update` - System maintenance required

## How It Works

- **Prompt engineering**: The backend sends a direct, template-specific prompt to the AI, instructing it to write a complete, realistic email with all details filled in and no placeholders.
- **Parsing logic**: The backend extracts only the subject and body from the AI response, discarding any extra text.
- **Fallback**: If AI generation fails, a basic template is used.

## Testing the Integration

Run the test script to verify everything is working:

```bash
cd Backend
python test_gemma_integration.py
```

This will:
1. Check if your API key is configured
2. Test email generation with the Gemma model
3. Test fallback email generation
4. Provide detailed output of the results

## Configuration Options

### Model Parameters

You can customize the AI generation parameters:

```python
# In ai_utils.py, you can modify these values:
generation_config=genai.types.GenerationConfig(
    temperature=0.7,        # Controls randomness (0.0-1.0)
    max_output_tokens=300,  # Maximum response length
    top_p=0.8,             # Nucleus sampling parameter
    top_k=40               # Top-k sampling parameter
)
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Your Google AI API key | Required |
| `GEMMA_MODEL` | Model to use | `gemma-3n-e4b-it` |
| `GEMMA_TEMPERATURE` | Randomness control | `0.7` |
| `GEMMA_MAX_TOKENS` | Max response length | `300` |

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Ensure `GOOGLE_API_KEY` is set in your `.env` file
   - Check that the `.env` file is in the Backend directory

2. **Import Errors**
   - Make sure you've installed the requirements: `pip install -r requirements.txt`
   - Verify `google-generativeai` is installed

3. **Rate Limiting**
   - Gemma has usage limits, but they're generous for most use cases
   - If you hit limits, the system will fall back to template-based emails

4. **Network Issues**
   - Ensure you have internet connectivity
   - Check if Google AI services are accessible from your location

### Error Handling

The system includes robust error handling:

- If Gemma API calls fail, it falls back to template-based emails
- All errors are logged for debugging
- The application continues to function even if AI generation fails

## Migration from OpenAI

If you were previously using OpenAI:

1. **Remove OpenAI dependencies**: The `openai` package is no longer needed
2. **Update API keys**: Replace `OPENAI_API_KEY` with `GOOGLE_API_KEY`
3. **Test functionality**: Run the test script to verify everything works
4. **Update documentation**: Update any references to OpenAI in your documentation

## Performance Considerations

- **Response Time**: Gemma typically responds within 1-3 seconds
- **Quality**: High-quality, contextually appropriate email generation
- **Cost**: Free tier with generous limits
- **Reliability**: Stable performance with good uptime

## Security Notes

- Keep your API key secure and never commit it to version control
- The `.env` file should be in your `.gitignore`
- Monitor API usage to stay within free tier limits
- All generated emails are for educational/simulation purposes only

## Support

For issues with:
- **Google AI API**: Check [Google AI Studio documentation](https://ai.google.dev/)
- **Application Integration**: Check the test script and error logs
- **General Setup**: Review this README and the main application documentation 