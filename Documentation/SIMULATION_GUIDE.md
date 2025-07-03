# Large Organization Simulation Guide

## Overview
The `simulation_large_organization.py` script has been optimized to support different user capacities based on your needs and system performance requirements.

## Configuration Options

### Simulation Modes

#### 1. DEMO Mode (500 users)
- **Best for**: Quick demonstrations, testing, development
- **Performance**: Very fast, minimal resource usage
- **Use case**: When you need to quickly show the system functionality

#### 2. OPTIMAL Mode (2,000 users) - **DEFAULT**
- **Best for**: Production demonstrations, realistic organization size
- **Performance**: Optimal balance of scale and performance
- **Use case**: Most common use case for showing the system at scale

#### 3. LARGE Mode (5,000+ users)
- **Best for**: Large-scale demonstrations, stress testing
- **Performance**: May impact frontend performance with very large datasets
- **Use case**: When you need to demonstrate handling of very large organizations

## How to Change Simulation Mode

Edit the configuration section in `simulation_large_organization.py`:

```python
# Simulation mode (uncomment one):
SIMULATION_MODE = "OPTIMAL"  # 2,000 users - Best performance
# SIMULATION_MODE = "LARGE"   # 5,000+ users - May impact performance
# SIMULATION_MODE = "DEMO"    # 500 users - Quick demo
```

## Performance Settings

You can also adjust these settings for fine-tuning:

```python
DELAY_BETWEEN_DEPARTMENTS = 0.5  # seconds
DELAY_BETWEEN_EMAIL_GENERATION = 1.0  # seconds
MAX_USERS_PER_DEPARTMENT = 300  # Maximum users per department
```

## Running the Simulation

1. **Start the backend server**:
   ```bash
   cd Backend
   uvicorn main:app --reload
   ```

2. **Run the simulation** (in a new terminal):
   ```bash
   cd Backend
   python simulation_large_organization.py
   ```

## Expected Output

The script will show:
- Simulation mode and configuration
- Progress for each department creation
- User creation progress with percentages
- Email generation progress
- Final statistics

## Performance Considerations

### Frontend Performance
- **< 1,000 users**: Excellent performance
- **1,000 - 2,000 users**: Good performance
- **2,000 - 5,000 users**: Acceptable performance
- **> 5,000 users**: May experience slowdowns

### Database Performance
- SQLite can handle millions of records efficiently
- No hard limits on database size
- Consider adding indexes for very large datasets

### API Performance
- Default pagination: 100 records per call
- Frontend pagination: Up to 200 records per page
- Email generation: May take longer with more users

## Troubleshooting

### Common Issues

1. **Only one department created**:
   - Ensure backend server is running
   - Check for network connectivity issues
   - Verify API endpoints are accessible

2. **Slow performance**:
   - Reduce user counts in LARGE mode
   - Increase delays between operations
   - Consider using DEMO mode for testing

3. **Memory issues**:
   - Use DEMO mode for development
   - Close other applications
   - Consider using a more powerful machine for LARGE mode

### Error Messages

- `Backend is not running`: Start the uvicorn server
- `Department name must be unique`: Department already exists (normal)
- `Email already exists`: User email conflict (handled automatically)

## Customization

### Adding New Departments
Edit the `get_department_config()` function to add or modify departments:

```python
{"name": "New Department", "user_count": 150}
```

### Changing User Distribution
Modify the `user_count` values in each department configuration to match your needs.

### Performance Tuning
Adjust the delay settings based on your system's capabilities and network conditions. 