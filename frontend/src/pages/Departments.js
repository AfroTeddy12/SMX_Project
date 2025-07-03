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
  IconButton,
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
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import axios from 'axios';
import API_CONFIG from '../config/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newDept, setNewDept] = useState('');
  const [editingDept, setEditingDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEPARTMENTS}`);
      setDepartments(res.data);
    } catch (error) {
      showSnackbar('Error fetching departments', 'error');
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

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, [fetchDepartments, fetchUsers]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAdd = async () => {
    if (!newDept.trim()) {
      showSnackbar('Please enter a department name', 'error');
      return;
    }
    
    try {
      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEPARTMENTS}`, { name: newDept });
      setNewDept('');
      setOpen(false);
      fetchDepartments();
      showSnackbar('Department added successfully');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        showSnackbar(err.response.data.detail, 'error');
      } else {
        showSnackbar('Error adding department', 'error');
      }
    }
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingDept.name.trim()) {
      showSnackbar('Please enter a department name', 'error');
      return;
    }
    
    try {
      await axios.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEPARTMENT_BY_ID(editingDept.id)}`, { name: editingDept.name });
      setEditOpen(false);
      setEditingDept(null);
      fetchDepartments();
      showSnackbar('Department updated successfully');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        showSnackbar(err.response.data.detail, 'error');
      } else {
        showSnackbar('Error updating department', 'error');
      }
    }
  };

  const handleDelete = async (id, name) => {
    const userCount = users.filter(user => user.department_id === id).length;
    const message = userCount > 0 
      ? `Are you sure you want to delete ${name}? This department has ${userCount} user(s) assigned to it.`
      : `Are you sure you want to delete ${name}?`;
    
    if (window.confirm(message)) {
      try {
        await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEPARTMENT_BY_ID(id)}`);
        fetchDepartments();
        showSnackbar('Department deleted successfully');
      } catch (error) {
        showSnackbar('Error deleting department', 'error');
      }
    }
  };

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserCount = (departmentId) => {
    return users.filter(user => user.department_id === departmentId).length;
  };

  const getDepartmentColor = (index) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
    return colors[index % colors.length];
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
            Department Management
          </Typography>
          
          {/* Search Bar */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Slide direction="up" in timeout={1000}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
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
                <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {departments.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Departments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
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
                <GroupIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h4" color="secondary">
                  {users.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
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
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {departments.length > 0 ? Math.round(users.length / departments.length) : 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Users/Dept
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Slide>

      {/* Departments Table */}
      <Slide direction="up" in timeout={1200}>
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Users</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDepartments.map((dept, index) => (
                  <Fade in timeout={300 + index * 100} key={dept.id}>
                    <TableRow 
                      hover 
                      sx={{ 
                        '&:hover': { backgroundColor: 'action.hover' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label={dept.name}
                            color={getDepartmentColor(index)}
                            variant="outlined"
                            sx={{ mr: 2 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {getUserCount(dept.id)} user(s)
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit department">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEdit(dept)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete department">
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(dept.id, dept.name)}
                            disabled={getUserCount(dept.id) > 0}
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
        </Paper>
      </Slide>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Zoom in>
          <Fab
            color="primary"
            aria-label="add department"
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
            Add New Department
          </Button>
        </Box>
      )}
      
      {/* Add Department Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide}
        transitionDuration={300}
      >
        <DialogTitle>Add New Department</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Department Name"
            fullWidth
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Add Department</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog 
        open={editOpen} 
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide}
        transitionDuration={300}
      >
        <DialogTitle>Edit Department</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Department Name"
            fullWidth
            value={editingDept?.name || ''}
            onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
            sx={{ mb: 2 }}
          />
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

export default Departments; 