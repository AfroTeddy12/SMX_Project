// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    // Department endpoints
    DEPARTMENTS: '/departments/',
    DEPARTMENT_BY_ID: (id) => `/departments/${id}`,
    
    // User endpoints
    USERS: '/users/',
    USER_BY_ID: (id) => `/users/${id}`,
    USER_COMPLETE_TRAINING: (id) => `/users/${id}/complete-training`,
    USERS_COMPLETE_ALL_TRAINING: '/users/complete-all-training',
    
    // Email endpoints
    EMAIL_LOGS: '/email_logs/',
    EMAIL_LOG_BY_ID: (id) => `/email_logs/${id}`,
    EMAIL_LOG_CLICK: (id) => `/email_logs/${id}/click`,
    EMAIL_LOG_RESPOND: (id) => `/email_logs/${id}/respond`,
    
    // Analytics endpoints
    CLICKS_BY_DEPARTMENT: '/analytics/clicks_by_department',
    AI_ANALYSIS: '/analytics/ai-analysis',
    TRAINING_COMPLETION: '/analytics/training-completion',
    
    // Email generation endpoints
    GENERATE_EMAIL: '/generate-email',
    GENERATE_EMAIL_DEPARTMENT: '/generate-email/department',
    
    // Templates endpoints
    TEMPLATES: '/templates',
    TEMPLATE_CUSTOMIZE: (id) => `/templates/${id}/customize`,
    
    // A/B Testing endpoints
    AB_TESTS: '/ab-tests',
    AB_TEST_RESULTS: (id) => `/ab-tests/${id}/results`,
    
    // ML endpoints
    TRAIN_RISK_MODEL: '/ml/train-risk-model',
    PREDICT_USER_RISK: (id) => `/ml/predict-user-risk/${id}`,
    BULK_RISK_PREDICTION: '/ml/bulk-risk-prediction',
    
    // Department training
    DEPARTMENT_COMPLETE_TRAINING: (id) => `/departments/${id}/complete-training`,
    
    // Data management
    WIPE_ALL_DATA: '/wipe-all-data',
  }
};

export default API_CONFIG; 