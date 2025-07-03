import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import ApartmentIcon from '@mui/icons-material/Apartment';
import EmailIcon from '@mui/icons-material/Email';
import CampaignIcon from '@mui/icons-material/Campaign';
import { ReactComponent as SmxLogo } from './smx_logo.svg';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Users from './pages/Users';
import PhishingCampaigns from './pages/PhishingCampaigns';
import EmailLogs from './pages/EmailLogs';

const drawerWidth = 220;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Departments', icon: <ApartmentIcon />, path: '/departments' },
  { text: 'Users', icon: <GroupIcon />, path: '/users' },
  { text: 'Phishing Campaigns', icon: <CampaignIcon />, path: '/phishing-campaigns' },
  { text: 'Email Logs', icon: <EmailIcon />, path: '/email-logs' },
];

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="fixed" color="primary" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              <SmxLogo height={32} />
            </Box>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              SMX Phishing Simulation Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: 'primary.main', color: 'primary.contrastText' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {navItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton component={Link} to={item.path} sx={{ color: 'inherit' }}>
                    <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
          <Toolbar />
          <Container maxWidth="md" sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 4 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/users" element={<Users />} />
              <Route path="/phishing-campaigns" element={<PhishingCampaigns />} />
              <Route path="/email-logs" element={<EmailLogs />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
