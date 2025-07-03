# Phishing Simulation Platform - Frontend Documentation

## Frontend Technologies

### Core Framework and Libraries
- **React**: JavaScript library for building user interfaces
- **React Router**: Client-side routing for React applications
- **Material-UI (MUI)**: React UI framework for Material Design components
- **Axios**: Promise-based HTTP client for API requests

### Data Visualization
- **Chart.js**: JavaScript charting library
- **React-Chartjs-2**: React wrapper for Chart.js
- **React-Heatmap-Grid**: Component for creating heatmap visualizations

### Progressive Web App (PWA) Features
- **Service Workers**: For offline functionality and caching
- **Web Vitals**: Performance monitoring
- **PWA Template**: Base template for Progressive Web App features

## Project Structure

### Frontend Components
```
frontend/
├── public/                 # Static files
├── src/                    # Source code
│   ├── pages/             # Page components
│   ├── components/        # Reusable components
│   ├── App.js            # Main application component
│   ├── theme.js          # Material-UI theme configuration
│   ├── index.js          # Application entry point
│   └── service-worker.js # PWA service worker
├── package.json          # Dependencies and scripts
└── .gitignore           # Git ignore rules
```

## Dependencies

### Core Dependencies
```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-router-dom": "^6.30.1",
  "react-scripts": "5.0.1"
}
```

### UI Components
```json
{
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.0",
  "@mui/icons-material": "^7.1.1",
  "@mui/material": "^7.1.1"
}
```

### Data Visualization
```json
{
  "chart.js": "^4.4.9",
  "react-chartjs-2": "^5.3.0",
  "react-heatmap-grid": "^0.9.1"
}
```

### API and Utilities
```json
{
  "axios": "^1.9.0",
  "web-vitals": "^5.0.2"
}
```

## Features

### User Interface
- Material Design-based components
- Responsive layout
- Dark/Light theme support
- Custom theme configuration

### Data Visualization
- Interactive charts and graphs
- Department-wise analytics
- Click-through rate visualization
- Response time analysis
- Risk level indicators

### PWA Features
- Offline functionality
- Installable on devices
- Performance monitoring
- Service worker caching

### API Integration
- RESTful API communication
- Real-time data updates
- Error handling
- Loading states

## Available Scripts

### Development
```bash
npm start        # Start development server
npm test         # Run tests
npm run build    # Build for production
npm run eject    # Eject from create-react-app
```

## Browser Support
- Production: Modern browsers (Chrome, Firefox, Safari, Edge)
- Development: Latest versions of Chrome, Firefox, and Safari

## Performance Optimization
- Code splitting
- Lazy loading
- Service worker caching
- Web Vitals monitoring

## Security Features
- CORS configuration
- API key management
- Secure data transmission
- Input validation

## State Management
- React hooks for local state
- Context API for global state
- Axios for API state management

## Routing
- Client-side routing with React Router
- Protected routes
- Dynamic route parameters
- Route-based code splitting

## Theme Configuration
- Custom Material-UI theme
- Dark/Light mode support
- Responsive typography
- Custom color palette

## Component Structure

### Pages
- Dashboard
- User Management
- Department Management
- Email Campaigns
- Analytics
- Settings

### Reusable Components
- Navigation
- Data Tables
- Charts
- Forms
- Cards
- Alerts
- Modals

## API Integration

### Endpoints
- User management
- Department management
- Email campaign creation
- Analytics data
- Template management

### Data Flow
1. User interaction
2. API request via Axios
3. Loading state management
4. Response handling
5. UI update
6. Error handling

## Error Handling
- API error responses
- Network errors
- Validation errors
- User feedback
- Error boundaries

## Testing
- Unit tests
- Integration tests
- Component tests
- API mocking
- Test coverage reporting 