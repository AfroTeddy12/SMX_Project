import React, { useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  Grid,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Tooltip,
  Fab,
  Zoom,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon,
  Campaign as CampaignIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Click as ClickIcon
} from '@mui/icons-material';
import axios from 'axios';
import API_CONFIG from '../config/api';

const PhishingCampaigns = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allDeptsLoading, setAllDeptsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchUsers = useCallback(async () => {
    try {
      console.log('Fetching users...');
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`);
      console.log('Users fetched:', res.data.length);
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Error fetching users', 'error');
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      console.log('Fetching departments...');
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEPARTMENTS}`);
      console.log('Departments fetched:', res.data.length);
      setDepartments(res.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      showSnackbar('Error fetching departments', 'error');
    }
  }, []);

  const fetchEmailLogs = useCallback(async () => {
    try {
      console.log('Fetching email logs...');
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMAIL_LOGS}`);
      console.log('Email logs fetched:', res.data.length);
      setEmailLogs(res.data.slice(-10).reverse()); // Show last 10, newest first
    } catch (error) {
      console.error('Error fetching email logs:', error);
      showSnackbar('Error fetching email logs', 'error');
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    console.log('Starting to fetch all data...');
    setInitialLoading(true);
    setLoadingError(null);
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const dataPromise = Promise.all([
        fetchUsers(),
        fetchDepartments(),
        fetchEmailLogs()
      ]);
      
      await Promise.race([dataPromise, timeoutPromise]);
      console.log('All data fetched successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoadingError(error.message || 'Failed to load data');
      showSnackbar('Error refreshing data: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      console.log('Setting initialLoading to false');
      setInitialLoading(false);
    }
  }, [fetchUsers, fetchDepartments, fetchEmailLogs]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleGenerateUser = async () => {
    if (!selectedUser) {
      showSnackbar('Please select a user', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_EMAIL}`, null, { params: { user_id: selectedUser } });
      showSnackbar('AI-powered phishing email generated and sent to user.');
      fetchEmailLogs();
    } catch (err) {
      showSnackbar('Failed to generate email for user.', 'error');
    }
    setLoading(false);
  };

  const handleGenerateDept = async () => {
    if (!selectedDept) {
      showSnackbar('Please select a department', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_EMAIL_DEPARTMENT}`, null, {
        params: { department_id: selectedDept },
      });
      showSnackbar(`AI-powered phishing emails generated and sent to ${res.data.sent} users in department.`);
      fetchEmailLogs();
    } catch (err) {
      showSnackbar('Failed to generate emails for department.', 'error');
    }
    setLoading(false);
  };

  const handleGenerateAllDepartments = async () => {
    setAllDeptsLoading(true);
    let totalEmails = 0;
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const dept of departments) {
        try {
          const res = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_EMAIL_DEPARTMENT}`, null, {
            params: { department_id: dept.id },
          });
          totalEmails += res.data.sent;
          successCount++;
          console.log(`Generated ${res.data.sent} emails for ${dept.name}`);
        } catch (err) {
          errorCount++;
          console.error(`Failed to generate emails for ${dept.name}:`, err);
        }
        // Small delay to be polite to the API
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (errorCount === 0) {
        showSnackbar(`Successfully generated ${totalEmails} AI-powered phishing emails across all ${successCount} departments.`);
      } else {
        showSnackbar(`Generated ${totalEmails} emails across ${successCount} departments. ${errorCount} departments had errors.`, 'warning');
      }
      fetchEmailLogs();
    } catch (err) {
      showSnackbar('Failed to generate emails for all departments.', 'error');
    }
    setAllDeptsLoading(false);
  };

  const handleSimulateClick = async (logId) => {
    try {
      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMAIL_LOG_CLICK(logId)}`);
      fetchEmailLogs();
      showSnackbar('Click simulated successfully');
    } catch (error) {
      showSnackbar('Error simulating click', 'error');
    }
  };

  const getStats = () => {
    const totalEmails = emailLogs.length;
    const clickedEmails = emailLogs.filter(log => log.clicked).length;
    const clickRate = totalEmails > 0 ? ((clickedEmails / totalEmails) * 100).toFixed(1) : 0;
    const recentEmails = emailLogs.filter(log => {
      const sentDate = new Date(log.sent_at);
      const now = new Date();
      const diffHours = (now - sentDate) / (1000 * 60 * 60);
      return diffHours <= 24;
    }).length;

    return { totalEmails, clickedEmails, clickRate, recentEmails };
  };

  const stats = getStats();

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Phishing Campaigns...
        </Typography>
      </Box>
    );
  }

  if (loadingError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <Alert severity="error" sx={{ mb: 2, maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Failed to Load Data
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {loadingError}
          </Typography>
          <Button 
            variant="contained" 
            onClick={fetchAllData}
            startIcon={<RefreshIcon />}
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            fontWeight: 'bold'
          }}>
            Phishing Campaigns
          </Typography>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Slide direction="up" in timeout={1000}>
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
                <SendIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {stats.totalEmails}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recent Emails
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
                  {stats.clickedEmails}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Clicked
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
                <PersonIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h4" color="secondary">
                  {stats.clickRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
              <CardContent sx={{ textAlign: 'center' }}>
                <CampaignIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {stats.recentEmails}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last 24h
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Slide>
      
      {/* AI-Powered Email Generation Section */}
      <Slide direction="up" in timeout={1200}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4, boxShadow: 3 }} elevation={3}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CampaignIcon color="primary" />
            AI-Powered Phishing Email Generation
          </Typography>
          {/* Description removed */}
          <Grid container spacing={2} alignItems="center">
            {/* User and Department select, one button */}
            <Grid item xs={12} md={5}>
              <FormControl fullWidth sx={{ width: 180 }}>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={selectedUser}
                  label="Select User"
                  onChange={(e) => setSelectedUser(e.target.value)}
                  sx={{ width: 180 }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth sx={{ width: 180 }}>
                <InputLabel>Select Department</InputLabel>
                <Select
                  value={selectedDept}
                  label="Select Department"
                  onChange={(e) => setSelectedDept(e.target.value)}
                  sx={{ width: 180 }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  if (selectedUser) {
                    handleGenerateUser();
                  } else if (selectedDept) {
                    handleGenerateDept();
                  } else {
                    showSnackbar('Please select a user or department', 'error');
                  }
                }}
                disabled={loading || (!selectedUser && !selectedDept)}
                startIcon={
                  loading ? <CircularProgress size={20} /> :
                  selectedUser ? <PersonIcon /> :
                  selectedDept ? <GroupIcon /> : null
                }
              >
                GENERATE EMAIL
              </Button>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <Button 
                fullWidth 
                variant="contained" 
                color="secondary"
                onClick={handleGenerateAllDepartments} 
                disabled={allDeptsLoading}
                startIcon={allDeptsLoading ? <CircularProgress size={20} /> : <BusinessIcon />}
              >
                Generate for All Departments ({departments.length})
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Slide>

      {/* Recent Email Logs */}
      <Slide direction="up" in timeout={1400}>
        <Paper sx={{ 
          width: '100%', 
          overflow: 'hidden',
          boxShadow: 3,
          borderRadius: 2
        }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SendIcon color="primary" />
              Recent Email Activity
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Sent At</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emailLogs.map((log, index) => {
                  const user = users.find((u) => u.id === log.user_id);
                  return (
                    <Fade in timeout={300 + index * 50} key={log.id}>
                      <TableRow 
                        hover 
                        sx={{ 
                          '&:hover': { backgroundColor: 'action.hover' },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user ? user.name : `User ${log.user_id}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user ? user.email : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {log.subject}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {log.sent_at ? new Date(log.sent_at).toLocaleString() : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={log.clicked ? 'Clicked' : 'Not Clicked'} 
                            color={log.clicked ? 'error' : 'success'} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Simulate click">
                            <IconButton
                              color={log.clicked ? 'success' : 'primary'}
                              disabled={log.clicked}
                              onClick={() => handleSimulateClick(log.id)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Slide>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Zoom in>
          <Fab
            color="primary"
            aria-label="refresh"
            onClick={fetchAllData}
            disabled={loading || allDeptsLoading}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
          >
            <RefreshIcon />
          </Fab>
        </Zoom>
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
  );
};

export default PhishingCampaigns;