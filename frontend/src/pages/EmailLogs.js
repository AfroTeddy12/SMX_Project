import React, { useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Fade,
  Slide,
  Tooltip,
  Fab,
  Zoom,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TablePagination
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  DoneAll as DoneAllIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  Click as ClickIcon,
  Reply as ReplyIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import axios from 'axios';
import API_CONFIG from '../config/api';

const EmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filterUser, setFilterUser] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchLogs = useCallback(async (userId, deptId) => {
    try {
      setLoading(true);
      let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMAIL_LOGS}?`;
      const params = [];
      
      if (userId) params.push(`user_id=${userId}`);
      if (deptId) params.push(`department_id=${deptId}`);
      
      if (params.length > 0) {
        url += params.join('&');
      }
      
      const res = await axios.get(url);
      setLogs(res.data);
    } catch (error) {
      showSnackbar('Error fetching email logs', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`);
      setUsers(res.data);
    } catch (error) {
      showSnackbar('Error fetching users', 'error');
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEPARTMENTS}`);
      setDepartments(res.data);
    } catch (error) {
      showSnackbar('Error fetching departments', 'error');
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchDepartments(),
        fetchLogs(filterUser, filterDept)
      ]);
    } catch (error) {
      showSnackbar('Error refreshing data', 'error');
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, fetchDepartments, fetchLogs, filterUser, filterDept]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    fetchLogs(filterUser, filterDept);
  }, [fetchLogs, filterUser, filterDept]);

  const handleSimulateClick = async (logId) => {
    try {
      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMAIL_LOG_CLICK(logId)}`);
      fetchLogs(filterUser, filterDept);
      showSnackbar('Click simulated successfully');
    } catch (error) {
      showSnackbar('Error simulating click', 'error');
    }
  };

  const handleSimulateResponse = async (logId) => {
    try {
      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMAIL_LOG_RESPOND(logId)}`);
      fetchLogs(filterUser, filterDept);
      showSnackbar('Response simulated successfully');
    } catch (error) {
      showSnackbar('Error simulating response', 'error');
    }
  };

  const filteredLogs = logs.filter(log => {
    const user = users.find(u => u.id === log.user_id);
    const dept = user ? departments.find(d => d.id === user.department_id) : null;
    
    return (
      log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dept && dept.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }).sort((a, b) => {
    // Sort by sent_at in reverse order (newest first)
    const dateA = new Date(a.sent_at || 0);
    const dateB = new Date(b.sent_at || 0);
    return dateB - dateA;
  });

  const paginatedLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStats = () => {
    const totalEmails = logs.length;
    const clickedEmails = logs.filter(log => log.clicked).length;
    const respondedEmails = logs.filter(log => log.responded).length;
    const clickRate = totalEmails > 0 ? ((clickedEmails / totalEmails) * 100).toFixed(1) : 0;
    const responseRate = totalEmails > 0 ? ((respondedEmails / totalEmails) * 100).toFixed(1) : 0;

    return { totalEmails, clickedEmails, respondedEmails, clickRate, responseRate };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
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
            Email Logs
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Tracking {logs.length} emails across {users.length} users
            {searchTerm && ` • Showing ${filteredLogs.length} filtered results`}
          </Typography>
          
          {/* Search Bar */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search emails by subject, user, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
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
                <EmailIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {stats.totalEmails}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Emails
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
                <DoneAllIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h4" color="secondary">
                  {stats.respondedEmails}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Responded
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
                <PersonIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {stats.clickRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Slide>

      {/* Filters */}
      <Slide direction="up" in timeout={1200}>
        <Paper sx={{ p: 2, mb: 3, boxShadow: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth sx={{ minWidth: 340 }}>
                <InputLabel>Filter by User</InputLabel>
                <Select
                  value={filterUser}
                  label="Filter by User"
                  onChange={(e) => setFilterUser(e.target.value)}
                  sx={{ minWidth: 340 }}
                >
                  <MenuItem value="">All Users</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth sx={{ minWidth: 340 }}>
                <InputLabel>Filter by Department</InputLabel>
                <Select
                  value={filterDept}
                  label="Filter by Department"
                  onChange={(e) => setFilterDept(e.target.value)}
                  sx={{ minWidth: 340 }}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Tooltip title="Refresh data">
                  <IconButton 
                    onClick={fetchAllData} 
                    color="primary"
                    disabled={loading}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Slide>

      {/* Email Logs Table */}
      <Slide direction="up" in timeout={1400}>
        <Paper sx={{ 
          width: '100%', 
          overflow: 'hidden',
          boxShadow: 3,
          borderRadius: 2
        }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Sent At</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLogs.map((log, index) => {
                  const user = users.find((u) => u.id === log.user_id);
                  const dept = user ? departments.find((d) => d.id === user.department_id) : null;
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
                          {dept && (
                            <Chip 
                              label={dept.name}
                              size="small"
                              variant="outlined"
                            />
                          )}
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
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Chip 
                              label={log.clicked ? 'Clicked' : 'Not Clicked'} 
                              color={log.clicked ? 'error' : 'success'} 
                              size="small"
                            />
                            <Chip 
                              label={log.responded ? 'Responded' : 'No Response'} 
                              color={log.responded ? 'warning' : 'default'} 
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Simulate click">
                            <IconButton
                              color={log.clicked ? 'success' : 'primary'}
                              disabled={log.clicked}
                              onClick={() => handleSimulateClick(log.id)}
                              sx={{ mr: 1 }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Simulate response">
                            <IconButton
                              color={log.responded ? 'success' : 'secondary'}
                              disabled={log.responded}
                              onClick={() => handleSimulateResponse(log.id)}
                            >
                              <DoneAllIcon />
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
          <TablePagination
            rowsPerPageOptions={[25, 50, 100, 200]}
            component="div"
            count={filteredLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Emails per page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count} emails`}
          />
        </Paper>
      </Slide>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Zoom in>
          <Fab
            color="primary"
            aria-label="refresh"
            onClick={fetchAllData}
            disabled={loading}
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

export default EmailLogs;