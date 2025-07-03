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
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
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
  TablePagination
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Group as GroupIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';
import API_CONFIG from '../config/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', department_id: '', age: 35 });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [trainingAnalytics, setTrainingAnalytics] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`);
      setUsers(res.data);
    } catch (error) {
      showSnackbar('Error fetching users', 'error');
    } finally {
      setLoading(false);
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

  const fetchTrainingAnalytics = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRAINING_COMPLETION}`);
      setTrainingAnalytics(res.data);
    } catch (error) {
      console.error('Error fetching training analytics:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchTrainingAnalytics();
  }, [fetchUsers, fetchDepartments]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAdd = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.department_id) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`, newUser);
      setNewUser({ name: '', email: '', department_id: '', age: 35 });
      setOpen(false);
      fetchUsers();
      showSnackbar('User added successfully');
    } catch (error) {
      showSnackbar('Error adding user', 'error');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingUser.name.trim() || !editingUser.email.trim() || !editingUser.department_id) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      await axios.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_BY_ID(editingUser.id)}`, editingUser);
      setEditOpen(false);
      setEditingUser(null);
      fetchUsers();
      showSnackbar('User updated successfully');
    } catch (error) {
      showSnackbar('Error updating user', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_BY_ID(id)}`);
        fetchUsers();
        showSnackbar('User deleted successfully');
      } catch (error) {
        showSnackbar('Error deleting user', 'error');
      }
    }
  };

  const handleCompleteTraining = async (userId, userName) => {
    try {
      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_COMPLETE_TRAINING(userId)}`);
      fetchUsers();
      fetchTrainingAnalytics();
      showSnackbar(`Training completed for ${userName}`);
    } catch (error) {
      showSnackbar('Error completing training', 'error');
    }
  };

  const handleCompleteDepartmentTraining = async (departmentId, departmentName) => {
    try {
      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEPARTMENT_COMPLETE_TRAINING(departmentId)}`);
      fetchUsers();
      fetchTrainingAnalytics();
      showSnackbar(`Training completed for ${departmentName} department`);
    } catch (error) {
      showSnackbar('Error completing department training', 'error');
    }
  };

  const handleCompleteAllTraining = async () => {
    if (window.confirm('Are you sure you want to mark all users as having completed training?')) {
      try {
        await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS_COMPLETE_ALL_TRAINING}`);
        fetchUsers();
        fetchTrainingAnalytics();
        showSnackbar('Training completed for all users');
      } catch (error) {
        showSnackbar('Error completing all training', 'error');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Unknown';
  };

  const getDepartmentColor = (departmentId) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
    const dept = departments.find(d => d.id === departmentId);
    if (!dept) return 'default';
    return colors[dept.id % colors.length];
  };

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
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Managing {users.length} users across {departments.length} departments
            {searchTerm && ` • Showing ${filteredUsers.length} filtered results`}
          </Typography>
          
          {/* Search Bar */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
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
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {users.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
              <CardContent sx={{ textAlign: 'center' }}>
                <BusinessIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h4" color="secondary">
                  {[...new Set(users.map(u => u.department_id))].length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Departments
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
                <SchoolIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {users.filter(u => u.training_completed).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Training Completed
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
                <CheckCircleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {trainingAnalytics?.overall_stats?.completion_rate || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Slide>

      {/* Training Actions */}
      <Slide direction="up" in timeout={1200}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4, boxShadow: 3 }} elevation={3}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            Training Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Simulate training completion for users and departments
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Button 
                fullWidth 
                variant="contained" 
                color="success"
                onClick={handleCompleteAllTraining}
                startIcon={<CheckCircleIcon />}
              >
                Complete All Training
              </Button>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography variant="body2" color="text.secondary">
                Mark all users as having completed training modules
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Slide>

      {/* Users Table */}
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Training Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user, index) => (
                  <Fade in timeout={300 + index * 100} key={user.id}>
                    <TableRow 
                      hover 
                      sx={{ 
                        '&:hover': { backgroundColor: 'action.hover' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getDepartmentName(user.department_id)}
                          color={getDepartmentColor(user.department_id)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.training_completed ? 'Completed' : 'Pending'}
                          color={user.training_completed ? 'success' : 'warning'}
                          size="small"
                          icon={user.training_completed ? <CheckCircleIcon /> : <SchoolIcon />}
                        />
                        {user.training_completed_at && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {new Date(user.training_completed_at).toLocaleDateString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit user">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEdit(user)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {!user.training_completed && (
                          <Tooltip title="Complete training">
                            <IconButton 
                              color="success" 
                              onClick={() => handleCompleteTraining(user.id, user.name)}
                              sx={{ mr: 1 }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete user">
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(user.id, user.name)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[25, 50, 100, 200]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Users per page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count} users`}
          />
        </Paper>
      </Slide>

      {/* Department Training Actions */}
      <Slide direction="up" in timeout={1600}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 4, boxShadow: 3 }} elevation={3}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon color="primary" />
            Department Training Actions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Complete training for entire departments
          </Typography>
          
          <Grid container spacing={2}>
            {departments.map((dept) => {
              const deptUsers = users.filter(u => u.department_id === dept.id);
              const completedCount = deptUsers.filter(u => u.training_completed).length;
              const completionRate = deptUsers.length > 0 ? (completedCount / deptUsers.length * 100) : 0;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={dept.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {dept.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {completedCount}/{deptUsers.length} users completed ({completionRate.toFixed(1)}%)
                      </Typography>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        color="success"
                        onClick={() => handleCompleteDepartmentTraining(dept.id, dept.name)}
                        disabled={completedCount === deptUsers.length}
                        startIcon={<CheckCircleIcon />}
                      >
                        Complete Training
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Slide>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Zoom in>
          <Fab
            color="primary"
            aria-label="add user"
            onClick={() => setOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
          >
            <AddIcon />
          </Fab>
        </Zoom>
      )}

      {/* Desktop Add Button */}
      {!isMobile && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            size="large"
            sx={{ minWidth: 200 }}
          >
            Add New User
          </Button>
        </Box>
      )}
      
      {/* Add User Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide}
        transitionDuration={300}
      >
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Department</InputLabel>
            <Select
              value={newUser.department_id}
              label="Department"
              onChange={(e) => setNewUser({ ...newUser, department_id: e.target.value })}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Add User</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog 
        open={editOpen} 
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide}
        transitionDuration={300}
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={editingUser?.name || ''}
            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={editingUser?.email || ''}
            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Department</InputLabel>
            <Select
              value={editingUser?.department_id || ''}
              label="Department"
              onChange={(e) => setEditingUser({ ...editingUser, department_id: e.target.value })}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

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

export default Users; 