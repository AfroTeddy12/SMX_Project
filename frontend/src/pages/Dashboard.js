// Dashboard.js - Main analytics dashboard for the phishing simulation platform
// Provides visualizations and management for users, departments, emails, and risk analytics

import React, { useEffect, useState, useCallback } from 'react';
// Material UI components for layout, UI, and feedback
import {
  Typography,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Fade,
  Slide,
  Snackbar,
  Tooltip as MuiTooltip
} from '@mui/material';
// Material UI icons for visual cues
import {
  Warning as WarningIcon,
  DeleteForever as DeleteForeverIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
// Axios for HTTP requests to backend API
import axios from 'axios';
// Chart.js React wrappers for data visualization
import { Bar, Line, Doughnut } from 'react-chartjs-2';
// Chart.js core and elements registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  ArcElement,
} from 'chart.js';
// API configuration
import API_CONFIG from '../config/api';

// Register Chart.js components for use in charts
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend,
  BarElement,
  LineElement,
  ArcElement
);

const Dashboard = () => {
  // State for overall statistics (users, departments, emails, clicks)
  const [stats, setStats] = useState({ users: 0, departments: 0, emails: 0, clicks: 0 });
  // State for department-level click analytics
  const [clicksByDept, setClicksByDept] = useState([]);
  // State for user-level click analytics
  const [userClicks, setUserClicks] = useState([]);
  // State for currently active analytics tab
  const [activeTab, setActiveTab] = useState(0);
  // State for confirmation dialog (wipe data)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  // State for wipe operation status
  const [wipeStatus, setWipeStatus] = useState(null);
  // State for wipe operation loading
  const [isWiping, setIsWiping] = useState(false);
  // State for all email logs
  const [emailLogs, setEmailLogs] = useState([]);
  // State for drill-down analytics (per department)
  const [drillDownData, setDrillDownData] = useState(null);
  // State for showing drill-down view
  const [showDrillDown, setShowDrillDown] = useState(false);
  // State for last data update timestamp
  const [lastUpdate, setLastUpdate] = useState(new Date());
  // State for live mode (auto-refresh)
  const [isLiveMode, setIsLiveMode] = useState(false);
  // State for live mode interval reference
  const [updateInterval, setUpdateInterval] = useState(null);
  // State for loading overlay
  const [loading, setLoading] = useState(true);
  // State for snackbar notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // State for training analytics
  const [trainingAnalytics, setTrainingAnalytics] = useState(null);
  
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const users = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`);
      const departments = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEPARTMENTS}`);
      const emails = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMAIL_LOGS}`);
      const clicks = emails.data.filter((e) => e.clicked).length;
      setStats({
        users: users.data.length,
        departments: departments.data.length,
        emails: emails.data.length,
        clicks,
      });
    } catch (error) {
      showSnackbar('Error fetching statistics', 'error');
    }
  }, [showSnackbar]);

  const fetchClicksByDept = useCallback(async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLICKS_BY_DEPARTMENT}`);
      setClicksByDept(res.data);
    } catch (error) {
      showSnackbar('Error fetching department analytics', 'error');
    }
  }, [showSnackbar]);

  const fetchUserClicks = useCallback(async () => {
    try {
      const users = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`);
      const emails = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMAIL_LOGS}`);
      const userClickData = users.data.map(user => {
        const userEmails = emails.data.filter(e => e.user_id === user.id);
        const clicks = userEmails.filter(e => e.clicked).length;
        return {
          user: user.name,
          department: user.department?.name || 'No Department',
          clicks,
          totalEmails: userEmails.length
        };
      });
      setUserClicks(userClickData);
    } catch (error) {
      showSnackbar('Error fetching user analytics', 'error');
    }
  }, [showSnackbar]);

  const fetchEmailLogs = useCallback(async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMAIL_LOGS}`);
      setEmailLogs(res.data);
    } catch (error) {
      showSnackbar('Error fetching email logs', 'error');
    }
  }, [showSnackbar]);

  const fetchTrainingAnalytics = useCallback(async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRAINING_COMPLETION}`);
      setTrainingAnalytics(res.data);
    } catch (error) {
      console.error('Error fetching training analytics:', error);
    }
  }, []);

  const handleCompleteAllTraining = async () => {
    if (window.confirm('Are you sure you want to mark all users as having completed training?')) {
      try {
        await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS_COMPLETE_ALL_TRAINING}`);
        fetchTrainingAnalytics();
        showSnackbar('Training completed for all users');
      } catch (error) {
        showSnackbar('Error completing all training', 'error');
      }
    }
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchClicksByDept(),
        fetchUserClicks(),
        fetchEmailLogs(),
        fetchTrainingAnalytics()
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      showSnackbar('Error refreshing data', 'error');
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchClicksByDept, fetchUserClicks, fetchEmailLogs, fetchTrainingAnalytics, showSnackbar]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Department Risk Heatmap Data
  const riskHeatmapData = clicksByDept.map(dept => {
    const deptUsers = userClicks.filter(user => user.department === dept.department);
    const totalEmails = deptUsers.reduce((sum, user) => sum + user.totalEmails, 0);
    const clickRate = dept.click_rate || 0;
    
    let riskLevel = 'Low';
    let riskColor = 'success';
    if (clickRate > 30) {
      riskLevel = 'High';
      riskColor = 'error';
    } else if (clickRate >= 15) {
      riskLevel = 'Medium';
      riskColor = 'warning';
    }
    
    return {
      department: dept.department,
      clickRate: parseFloat(clickRate),
      riskLevel,
      riskColor,
      totalEmails: dept.total_emails || totalEmails,
      clicks: dept.total_clicks || 0
    };
  });

  // Template Effectiveness Bar Chart Data
  const templateData = {
    labels: ['Urgent Action', 'Security Alert', 'Password Expiry', 'System Update'],
    datasets: [{
      label: 'Click Rate (%)',
      data: (() => {
        const templateTypes = ['urgent_action', 'security_alert', 'password_expiry', 'system_update'];
        return templateTypes.map(templateType => {
          const templateEmails = emailLogs.filter(log => log.template_type === templateType);
          const totalEmails = templateEmails.length;
          const clickedEmails = templateEmails.filter(log => log.clicked).length;
          return totalEmails > 0 ? Math.round((clickedEmails / totalEmails) * 100) : 0;
        });
      })(),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Time Series Line Chart Data (based on real email data)
  const timeSeriesData = {
    labels: (() => {
      // Get the last 6 weeks of data
      const now = new Date();
      const weeks = [];
      for (let i = 5; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7));
        weeks.push(`Week ${6-i}`);
      }
      return weeks;
    })(),
    datasets: [
      {
        label: 'Overall Click Rate',
        data: (() => {
          // Calculate click rate for each week
          const now = new Date();
          const weeklyData = [];
          
          for (let i = 5; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (i * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            
            const weekEmails = emailLogs.filter(log => {
              const emailDate = new Date(log.sent_at);
              return emailDate >= weekStart && emailDate < weekEnd;
            });
            
            const totalEmails = weekEmails.length;
            const clickedEmails = weekEmails.filter(log => log.clicked).length;
            const clickRate = totalEmails > 0 ? Math.round((clickedEmails / totalEmails) * 100) : 0;
            weeklyData.push(clickRate);
          }
          
          return weeklyData;
        })(),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      },
      {
        label: 'IT Department',
        data: (() => {
          // Calculate click rate for IT department for each week
          const now = new Date();
          const weeklyData = [];
          
          for (let i = 5; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (i * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            
            const weekEmails = emailLogs.filter(log => {
              const emailDate = new Date(log.sent_at);
              return emailDate >= weekStart && emailDate < weekEnd;
            });
            
            // Filter for IT department emails (you might need to join with users/departments)
            const itEmails = weekEmails; // For now, using all emails
            const totalEmails = itEmails.length;
            const clickedEmails = itEmails.filter(log => log.clicked).length;
            const clickRate = totalEmails > 0 ? Math.round((clickedEmails / totalEmails) * 100) : 0;
            weeklyData.push(clickRate);
          }
          
          return weeklyData;
        })(),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1
      }
    ]
  };

  // User Risk Distribution Data
  const userRiskData = {
    labels: ['0 Clicks', '1 Click', '2 Clicks', '3+ Clicks'],
    datasets: [{
      data: [
        userClicks.filter(u => u.clicks === 0).length,
        userClicks.filter(u => u.clicks === 1).length,
        userClicks.filter(u => u.clicks === 2).length,
        userClicks.filter(u => u.clicks >= 3).length
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(255, 99, 132, 0.8)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setShowDrillDown(false);
    setDrillDownData(null);
  };

  const handleDrillDown = (department) => {
    const deptUsers = userClicks.filter(user => user.department === department);
    const deptEmails = emailLogs.filter(log => {
      const user = userClicks.find(u => u.user === log.user_name);
      return user && user.department === department;
    });
    
    setDrillDownData({
      department,
      users: deptUsers,
      emails: deptEmails,
      stats: {
        totalUsers: deptUsers.length,
        totalEmails: deptEmails.length,
        totalClicks: deptEmails.filter(e => e.clicked).length,
        clickRate: deptEmails.length > 0 ? 
          Math.round((deptEmails.filter(e => e.clicked).length / deptEmails.length) * 100) : 0
      }
    });
    setShowDrillDown(true);
  };

  const handleBackToOverview = () => {
    setShowDrillDown(false);
    setDrillDownData(null);
  };

  const handleLiveModeToggle = () => {
    if (isLiveMode) {
      // Stop live updates
      if (updateInterval) {
        clearInterval(updateInterval);
        setUpdateInterval(null);
      }
      setIsLiveMode(false);
    } else {
      // Start live updates
      const interval = setInterval(() => {
        fetchAllData();
        setLastUpdate(new Date());
      }, 10000); // Update every 10 seconds
      setUpdateInterval(interval);
      setIsLiveMode(true);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, [updateInterval]);

  const handleConfirmWipe = async () => {
    setIsWiping(true);
    setShowConfirmationDialog(false);
    
    try {
      const response = await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WIPE_ALL_DATA}`);
      
      setWipeStatus({
        type: 'success',
        message: response.data.message,
        details: response.data.deleted_records
      });
      
      // Refresh the dashboard data
      fetchAllData();
      
    } catch (error) {
      setWipeStatus({
        type: 'error',
        message: 'Failed to wipe database',
        details: error.response?.data?.detail || error.message
      });
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Loading Overlay */}
      {loading && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Dashboard...
          </Typography>
        </Box>
      )}

      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header with Controls */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h4" component="h1" sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                fontWeight: 'bold'
              }}>
                Phishing Simulation Dashboard
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <MuiTooltip title="Refresh data">
                  <IconButton 
                    onClick={fetchAllData} 
                    color="primary"
                    disabled={loading}
                  >
                    <RefreshIcon />
                  </IconButton>
                </MuiTooltip>
                
                <MuiTooltip title={isLiveMode ? 'Stop live updates' : 'Start live updates'}>
                  <IconButton 
                    onClick={handleLiveModeToggle} 
                    color={isLiveMode ? 'error' : 'success'}
                  >
                    {isLiveMode ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                </MuiTooltip>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteForeverIcon />}
                  onClick={() => setShowConfirmationDialog(true)}
                  size="small"
                >
                  Wipe Data
                </Button>
              </Box>
            </Box>
            
            {isLiveMode && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Live mode active - Data updates every 10 seconds
              </Alert>
            )}
            
            <Typography variant="body2" color="text.secondary">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
          </Box>
        </Fade>

        {/* Header Stats - Responsive Grid */}
        <Slide direction="up" in timeout={1000}>
          <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: 140,
                minWidth: 160,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent sx={{ p: { xs: 1, sm: 2 }, textAlign: 'center' }}>
                  <GroupIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats.users}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Total Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: 140,
                minWidth: 160,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent sx={{ p: { xs: 1, sm: 2 }, textAlign: 'center' }}>
                  <EmailIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats.emails}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Emails Sent
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: 140,
                minWidth: 160,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent sx={{ p: { xs: 1, sm: 2 }, textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats.emails > 0 ? ((stats.clicks / stats.emails) * 100).toFixed(1) : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Click Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: 140,
                minWidth: 160,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent sx={{ p: { xs: 1, sm: 2 }, textAlign: 'center' }}>
                  <SecurityIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats.departments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Departments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Slide>

        {/* Training Completion Section */}
        <Slide direction="up" in timeout={1300}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, boxShadow: 3 }} elevation={3}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon color="primary" />
              Training Completion Status
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  <Box>
                    <Typography variant="h4" color="success.main">
                      {trainingAnalytics?.overall_stats?.completion_rate || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Training Completion Rate
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {trainingAnalytics?.overall_stats?.completed_users || 0} of {trainingAnalytics?.overall_stats?.total_users || 0} users have completed training
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="success"
                  onClick={handleCompleteAllTraining}
                  startIcon={<CheckCircleIcon />}
                  size="large"
                >
                  Complete All Training
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Mark all users as having completed training modules
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Slide>

        {/* Desktop Tabs */}
        <Slide direction="up" in timeout={1200}>
          <Paper sx={{ width: '100%', mb: 3, boxShadow: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="analytics tabs"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab label="Risk Assessment" />
              <Tab label="Template Performance" />
              <Tab label="Time Trends" />
              <Tab label="User Distribution" />
              <Tab label="Email Management" />
            </Tabs>
          </Paper>
        </Slide>

        {/* Content Area */}
        <Fade in timeout={1500}>
          <Box>
            {/* Tabbed Analytics Section */}
            <Paper sx={{ width: '100%' }}>
              {/* Tab 1: Risk Assessment (Heatmap Table) */}
              {activeTab === 0 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {showDrillDown ? `${drillDownData.department} - User Details` : 'Department Risk Assessment'}
                  </Typography>
                  
                  {showDrillDown ? (
                    // Drill-down view
                    <Box>
                      <Button 
                        variant="outlined" 
                        onClick={handleBackToOverview}
                        sx={{ mb: 2 }}
                      >
                        ← Back to Overview
                      </Button>
                      
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Card sx={{ 
                            height: 140,
                            minWidth: 160,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' }
                          }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <GroupIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                              <Typography variant="h4" color="primary">
                                {drillDownData.stats.totalUsers}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Users
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Card sx={{ 
                            height: 140,
                            minWidth: 160,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' }
                          }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <EmailIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                              <Typography variant="h4" color="secondary">
                                {drillDownData.stats.totalEmails}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Emails Sent
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Card sx={{ 
                            height: 140,
                            minWidth: 160,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' }
                          }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                              <Typography variant="h4" color="success.main">
                                {drillDownData.stats.totalClicks}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Total Clicks
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Card sx={{ 
                            height: 140,
                            minWidth: 160,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' }
                          }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                              <Typography variant="h4" color="warning.main">
                                {drillDownData.stats.clickRate}%
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Click Rate
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                      
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>User</TableCell>
                              <TableCell align="center">Emails Received</TableCell>
                              <TableCell align="center">Clicks</TableCell>
                              <TableCell align="center">Click Rate</TableCell>
                              <TableCell align="center">Risk Level</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {drillDownData.users.map((user) => {
                              const userEmails = drillDownData.emails.filter(e => e.user_name === user.user);
                              const clickRate = userEmails.length > 0 ? 
                                Math.round((userEmails.filter(e => e.clicked).length / userEmails.length) * 100) : 0;
                              
                              let riskLevel = 'Low';
                              let riskColor = 'success';
                              if (clickRate > 30) {
                                riskLevel = 'High';
                                riskColor = 'error';
                              } else if (clickRate >= 15) {
                                riskLevel = 'Medium';
                                riskColor = 'warning';
                              }
                              
                              return (
                                <TableRow key={user.user} hover>
                                  <TableCell>{user.user}</TableCell>
                                  <TableCell align="center">{userEmails.length}</TableCell>
                                  <TableCell align="center">{userEmails.filter(e => e.clicked).length}</TableCell>
                                  <TableCell align="center">{clickRate}%</TableCell>
                                  <TableCell align="center">
                                    <Chip 
                                      label={riskLevel} 
                                      color={riskColor} 
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ) : (
                    // Overview table
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Department</TableCell>
                            <TableCell align="center">Click Rate (%)</TableCell>
                            <TableCell align="center">Risk Level</TableCell>
                            <TableCell align="center">Total Emails</TableCell>
                            <TableCell align="center">Total Clicks</TableCell>
                            <TableCell align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {riskHeatmapData.map((row) => (
                            <TableRow key={row.department} hover>
                              <TableCell>{row.department}</TableCell>
                              <TableCell align="center">{row.clickRate}%</TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={row.riskLevel} 
                                  color={row.riskColor} 
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">{row.totalEmails}</TableCell>
                              <TableCell align="center">{row.clicks}</TableCell>
                              <TableCell align="center">
                                <Button 
                                  size="small" 
                                  onClick={() => handleDrillDown(row.department)}
                                  disabled={row.totalEmails === 0}
                                >
                                  View Users
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  
                  {!showDrillDown && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Risk levels: Low (&lt;15%), Medium (15-30%), High (&gt;30%). Click "View Users" to see individual user details.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Tab 2: Template Performance (Bar Chart) */}
              {activeTab === 1 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Template Effectiveness
                  </Typography>
                  {emailLogs.length > 0 ? (
                    <Box sx={{ height: 400, position: 'relative' }}>
                      <Bar 
                        data={templateData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Click Rate (%)'
                              }
                            }
                          }
                        }} 
                      />
                    </Box>
                  ) : (
                    <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No email data available. Generate some emails to see template performance.
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Shows which email templates are most effective at eliciting clicks.
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Tab 3: Time Trends (Line Chart) */}
              {activeTab === 2 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Security Awareness Trends
                  </Typography>
                  {emailLogs.length > 0 ? (
                    <Box sx={{ height: 400, position: 'relative' }}>
                      <Line 
                        data={timeSeriesData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top'
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Click Rate (%)'
                              }
                            }
                          }
                        }} 
                      />
                    </Box>
                  ) : (
                    <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No email data available. Generate some emails to see time trends.
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tracks improvement in security awareness over time. Lower click rates indicate better awareness.
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Tab 4: User Distribution (Doughnut Chart) */}
              {activeTab === 3 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    User Risk Distribution
                  </Typography>
                  <Box sx={{ height: 400, position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: '60%' }}>
                      <Doughnut 
                        data={userRiskData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }} 
                      />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Distribution of users by their click behavior. Users with more clicks need additional training.
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Tab 5: Email Management */}
              {activeTab === 4 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Email Management
                  </Typography>
                  {emailLogs.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell>Template Type</TableCell>
                            <TableCell>Sent At</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {emailLogs.map((email) => {
                            return (
                              <TableRow key={email.id} hover>
                                <TableCell>{email.user_name || `User ${email.user_id}`}</TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {email.subject}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={email.template_type || 'Unknown'} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={email.clicked ? 'Clicked' : 'Not Clicked'} 
                                    color={email.clicked ? 'error' : 'success'} 
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    size="small" 
                                    onClick={() => handleDrillDown(email.user_name)}
                                  >
                                    Preview
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No emails generated yet. Generate some emails to see them here.
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Showing all {emailLogs.length} emails. Click "Preview" to view email content.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        </Fade>

        {/* Wipe Confirmation Dialog */}
        <Dialog
          open={showConfirmationDialog}
          onClose={() => setShowConfirmationDialog(false)}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Slide}
          transitionDuration={300}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="error" />
              Confirm Database Wipe
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              This action will permanently delete ALL data from the database including:
              <br />• All users and departments
              <br />• All email logs and analytics
              <br />• All phishing campaign data
              <br /><br />
              This action cannot be undone. Are you sure you want to proceed?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirmationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmWipe} 
              color="error" 
              variant="contained"
              disabled={isWiping}
            >
              {isWiping ? 'Wiping...' : 'Wipe All Data'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Wipe Status Alert */}
        {wipeStatus && (
          <Alert 
            severity={wipeStatus.type} 
            sx={{ mt: 2 }}
            onClose={() => setWipeStatus(null)}
          >
            <Typography variant="h6" gutterBottom>
              {wipeStatus.message}
            </Typography>
            {wipeStatus.details && (
              <Typography variant="body2">
                {typeof wipeStatus.details === 'object' 
                  ? `Deleted: ${wipeStatus.details.users || 0} users, ${wipeStatus.details.departments || 0} departments, ${wipeStatus.details.email_logs || 0} email logs`
                  : wipeStatus.details
                }
              </Typography>
            )}
          </Alert>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Dashboard; 