import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import UploadPage from './UploadPage';
import LoginPage from './LoginPage';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Work as WorkIcon,
  BusinessCenter as BusinessCenterIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Link as LinkIcon,
  CloudUpload as CloudUploadIcon,
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  FileDownload as FileDownloadIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';
import ThreeDChart from './ThreeDChart';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Professional light theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1e40af',
    },
    secondary: {
      main: '#7c3aed',
      light: '#8b5cf6',
      dark: '#6d28d9',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.025em',
      color: '#0f172a',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.875rem',
      letterSpacing: '-0.02em',
      color: '#0f172a',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.015em',
      color: '#0f172a',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#0f172a',
      lineHeight: 1.5,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: '#0f172a',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#0f172a',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      color: '#475569',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      color: '#64748b',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-2px)',
            borderColor: 'rgba(37, 99, 235, 0.3)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '12px 28px',
          fontSize: '0.9375rem',
          letterSpacing: '0.01em',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2563eb',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.8125rem',
        },
      },
    },
  },
});

// Pie chart colors
const COLORS = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

// Motion variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({ count: 0 });
  const [tabValue, setTabValue] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [addResumeOpen, setAddResumeOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [addingResume, setAddingResume] = useState(false);
  const [socket, setSocket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Filter only emails with resume data
  const resumes = useMemo(() => {
    return emails.filter(email => 
      email.hasAttachment && 
      email.attachmentData && 
      (email.attachmentData.name || email.attachmentData.email)
    );
  }, [emails]);

  // Filtered resumes based on search and role
  const filteredResumes = useMemo(() => {
    let filtered = resumes;

    // Filter by search query (name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(resume => {
        const name = (resume.attachmentData?.name || '').toLowerCase();
        return name.includes(query);
      });
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(resume => {
        const role = resume.attachmentData?.role || 'Not Specified';
        return role === selectedRole;
      });
    }

    return filtered;
  }, [resumes, searchQuery, selectedRole]);

  // Get unique roles for filter dropdown
  const uniqueRoles = useMemo(() => {
    const roles = new Set();
    resumes.forEach(resume => {
      const role = resume.attachmentData?.role || 'Not Specified';
      roles.add(role);
    });
    return Array.from(roles).sort();
  }, [resumes]);

  // Calculate role statistics
  const roleStats = useMemo(() => {
    const roleCount = {};
    resumes.forEach(resume => {
      const role = resume.attachmentData?.role || 'Not Specified';
      roleCount[role] = (roleCount[role] || 0) + 1;
    });

    return Object.entries(roleCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 roles
  }, [resumes]);

  // Export to XLSX function
  const exportToExcel = () => {
    const data = filteredResumes.map(resume => ({
      'Name': resume.attachmentData?.name || 'N/A',
      'Email': resume.attachmentData?.email || 'N/A',
      'Mobile Number': resume.attachmentData?.contactNumber || 'N/A',
      'Date of Birth': resume.attachmentData?.dateOfBirth || 'N/A',
      'Experience': resume.attachmentData?.experience || 'N/A',
      'Role': resume.attachmentData?.role || 'Not Specified',
      'Received At': resume.receivedAt ? new Date(resume.receivedAt).toLocaleDateString() : 'N/A',
      'Subject': resume.subject || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resume Data');
    
    // Auto-size columns
    const colWidths = [
      { wch: 25 }, // Name
      { wch: 30 }, // Email
      { wch: 18 }, // Mobile Number
      { wch: 15 }, // Date of Birth
      { wch: 15 }, // Experience
      { wch: 25 }, // Role
      { wch: 15 }, // Received At
      { wch: 40 }  // Subject
    ];
    ws['!cols'] = colWidths;

    const fileName = `Resume_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    setNotification({
      type: 'success',
      message: `Exported ${filteredResumes.length} resume(s) to ${fileName}`
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);

  // Health check function to verify backend is reachable
  const checkBackendHealth = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/health`, { timeout: 3000 });
      if (response.status === 200) {
        setIsConnected(true);
        return true;
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setIsConnected(false);
      return false;
    }
    return false;
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsAuthenticated(true);
        setAdminData(response.data.admin);
        setAuthLoading(false);
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminData');
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize socket connection after authentication
    const newSocket = io(API_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });
    setSocket(newSocket);

    // Initial health check
    checkBackendHealth();
    fetchEmails();
    fetchStats();

    // Set up periodic health check (every 10 seconds)
    const healthCheckInterval = setInterval(() => {
      checkBackendHealth();
    }, 10000);

    newSocket.on('connect', () => {
      console.log('Connected to server via Socket.IO');
      setIsConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      // Don't set offline if API is still reachable
      checkBackendHealth();
    });

    newSocket.on('newEmail', (data) => {
      setNotification({
        type: 'success',
        message: data.message,
        email: data.email
      });
      fetchEmails();
      fetchStats();
      
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server via Socket.IO');
      // Check if API is still reachable even if socket disconnected
      checkBackendHealth();
    });

    return () => {
      clearInterval(healthCheckInterval);
      if (newSocket) {
        newSocket.off('connect');
        newSocket.off('connect_error');
        newSocket.off('newEmail');
        newSocket.off('disconnect');
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/api/resumes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminData');
        window.location.href = '/login';
        return;
      }
      setNotification({
        type: 'error',
        message: 'Failed to fetch resumes'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/api/resumes/stats/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminData');
        window.location.href = '/login';
      }
    }
  };

  const deleteResume = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_URL}/api/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEmails();
      fetchStats();
      setNotification({
        type: 'success',
        message: 'Resume deleted successfully'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error deleting resume:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminData');
        window.location.href = '/login';
        return;
      }
      setNotification({
        type: 'error',
        message: 'Failed to delete resume'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleAddResume = async () => {
    if (!resumeUrl.trim()) {
      setNotification({
        type: 'error',
        message: 'Please enter a valid PDF URL'
      });
      return;
    }

    try {
      setAddingResume(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${API_URL}/api/resumes/add-from-url`, {
        url: resumeUrl.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotification({
        type: 'success',
        message: 'Resume added successfully!'
      });

      setAddResumeOpen(false);
      setResumeUrl('');
      fetchEmails();
      fetchStats();

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error adding resume:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.error || 'Failed to add resume from URL'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setAddingResume(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminData');
    window.location.href = '/login';
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress size={60} sx={{ color: '#2563eb' }} />
        </Box>
      </ThemeProvider>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: '#ffffff',
          padding: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Card
              sx={{
                mb: 4,
                mt: 2,
                p: { xs: 2, sm: 3, md: 4 },
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: 'none',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 3 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                    <Typography
                      variant="h1"
                      sx={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: 900,
                        fontSize: { xs: '1.875rem', sm: '2.5rem', md: '3rem' },
                        letterSpacing: '-0.03em',
                        lineHeight: 1.1,
                      }}
                    >
                      youHRpower
                    </Typography>
                    {adminData && (
                      <Chip
                        label={`Admin: ${adminData.username}`}
                        size="small"
                        sx={{
                          bgcolor: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
                          background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
                          color: '#2563eb',
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          height: '28px',
                          border: '1px solid rgba(37, 99, 235, 0.2)',
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: '#64748b',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                    }}
                  >
                    Intelligent Resume Management System
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={() => {
                      const uploadLink = `${window.location.origin}/upload`;
                      navigator.clipboard.writeText(uploadLink);
                      setNotification({
                        type: 'success',
                        message: 'Shareable link copied to clipboard!'
                      });
                      setTimeout(() => setNotification(null), 3000);
                    }}
                    sx={{
                      borderColor: '#2563eb',
                      color: '#2563eb',
                      borderWidth: '1.5px',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#1e40af',
                        bgcolor: '#eff6ff',
                        borderWidth: '1.5px',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Share Link
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddResumeOpen(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1e40af 0%, #6d28d9 100%)',
                        boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Add Resume
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                      borderColor: '#ef4444',
                      color: '#ef4444',
                      borderWidth: '1.5px',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#dc2626',
                        bgcolor: '#fee2e2',
                        borderWidth: '1.5px',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </Box>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card
                      sx={{
                        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)',
                        border: '1px solid rgba(37, 99, 235, 0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '100px',
                          height: '100px',
                          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)',
                          borderRadius: '50%',
                          transform: 'translate(30px, -30px)',
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 1 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'rgba(37, 99, 235, 0.1)',
                            mb: 2,
                          }}
                        >
                          <BusinessCenterIcon sx={{ fontSize: 32, color: '#2563eb' }} />
                        </Box>
                        <Typography variant="h2" sx={{ color: '#0f172a', fontWeight: 800, mb: 0.5, fontSize: { xs: '2rem', sm: '2.25rem' } }}>
                          {resumes.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.9375rem' }}>
                          Total Resumes
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card
                      sx={{
                        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(124, 58, 237, 0.02) 100%)',
                        border: '1px solid rgba(124, 58, 237, 0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '100px',
                          height: '100px',
                          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
                          borderRadius: '50%',
                          transform: 'translate(30px, -30px)',
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 1 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'rgba(124, 58, 237, 0.1)',
                            mb: 2,
                          }}
                        >
                          <AssessmentIcon sx={{ fontSize: 32, color: '#7c3aed' }} />
                        </Box>
                        <Typography variant="h2" sx={{ color: '#0f172a', fontWeight: 800, mb: 0.5, fontSize: { xs: '2rem', sm: '2.25rem' } }}>
                          {roleStats.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.9375rem' }}>
                          Unique Roles
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card
                      sx={{
                        background: isConnected 
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)'
                          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%)',
                        border: isConnected 
                          ? '1px solid rgba(16, 185, 129, 0.1)'
                          : '1px solid rgba(239, 68, 68, 0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '100px',
                          height: '100px',
                          background: isConnected
                            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
                            : 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
                          borderRadius: '50%',
                          transform: 'translate(30px, -30px)',
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 1 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: isConnected 
                              ? 'rgba(16, 185, 129, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                            mb: 2,
                          }}
                        >
                          {isConnected ? (
                            <CheckCircleIcon sx={{ fontSize: 32, color: '#10b981' }} />
                          ) : (
                            <ErrorIcon sx={{ fontSize: 32, color: '#ef4444' }} />
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.9375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {isConnected ? 'Live Sync' : 'Offline'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card
                      sx={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '100px',
                          height: '100px',
                          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
                          borderRadius: '50%',
                          transform: 'translate(30px, -30px)',
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 1 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'rgba(245, 158, 11, 0.1)',
                            mb: 2,
                          }}
                        >
                          <TrendingUpIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
                        </Box>
                        <Typography variant="h2" sx={{ color: '#0f172a', fontWeight: 800, mb: 0.5, fontSize: { xs: '2rem', sm: '2.25rem' } }}>
                          {roleStats[0]?.value || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.9375rem' }}>
                          Top Role Count
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
          </motion.div>

          {/* Notification Snackbar */}
          <Snackbar
            open={!!notification}
            autoHideDuration={5000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseNotification}
              severity={notification?.type || 'info'}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {notification?.message}
            </Alert>
          </Snackbar>

          {/* Add Resume Dialog */}
          <Dialog 
            open={addResumeOpen} 
            onClose={() => !addingResume && setAddResumeOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ pb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinkIcon sx={{ color: '#2563eb' }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Add Resume from URL
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <TextField
                  fullWidth
                  label="PDF Resume URL"
                  placeholder="https://example.com/resume.pdf"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  disabled={addingResume}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Enter a direct link to a PDF resume file"
                  sx={{ mb: 2 }}
                />
                {addingResume && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" sx={{ mt: 1, color: '#64748b', textAlign: 'center' }}>
                      Processing resume...
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
              <Button 
                onClick={() => setAddResumeOpen(false)} 
                disabled={addingResume}
                sx={{ color: '#64748b' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddResume}
                variant="contained"
                disabled={addingResume || !resumeUrl.trim()}
                startIcon={addingResume ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1e40af 0%, #6d28d9 100%)',
                  },
                }}
              >
                {addingResume ? 'Processing...' : 'Add Resume'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card
              sx={{
                mb: 4,
                p: 0,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: 'none',
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{
                  px: 2,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    minHeight: 64,
                    color: '#64748b',
                    '&.Mui-selected': {
                      color: '#2563eb',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  },
                }}
              >
                <Tab 
                  label="Resume Dashboard" 
                  icon={<BusinessCenterIcon sx={{ fontSize: 20 }} />} 
                  iconPosition="start"
                  sx={{ gap: 1.5 }}
                />
                <Tab 
                  label="Role Analytics" 
                  icon={<AssessmentIcon sx={{ fontSize: 20 }} />} 
                  iconPosition="start"
                  sx={{ gap: 1.5 }}
                />
              </Tabs>
            </Card>
          </motion.div>

          {/* Main Content */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <CircularProgress size={60} sx={{ color: '#2563eb' }} />
            </Box>
          ) : tabValue === 0 ? (
            // Resume Dashboard Tab
            <>
              {/* Search and Filter Section */}
              {resumes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card 
                    sx={{ 
                      mb: 3, 
                      p: 3,
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      boxShadow: 'none',
                    }}
                  >
                    <Grid container spacing={2.5} alignItems="center">
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          placeholder="Search by candidate name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#64748b', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: '#f8fafc',
                              '&:hover': {
                                bgcolor: '#f1f5f9',
                              },
                              '&.Mui-focused': {
                                bgcolor: '#ffffff',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label="Filter by Role"
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          SelectProps={{
                            native: true,
                          }}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <FilterListIcon sx={{ color: '#64748b', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: '#f8fafc',
                              '&:hover': {
                                bgcolor: '#f1f5f9',
                              },
                              '&.Mui-focused': {
                                bgcolor: '#ffffff',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 500,
                            },
                          }}
                        >
                          <option value="all">All Roles ({resumes.length})</option>
                          {uniqueRoles.map((role) => {
                            const count = resumes.filter(r => (r.attachmentData?.role || 'Not Specified') === role).length;
                            return (
                              <option key={role} value={role}>
                                {role} ({count})
                              </option>
                            );
                          })}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<FileDownloadIcon />}
                          onClick={exportToExcel}
                          disabled={filteredResumes.length === 0}
                          sx={{
                            py: 1.75,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                              transform: 'translateY(-2px)',
                            },
                            '&:disabled': {
                              background: '#cbd5e1',
                              color: '#94a3b8',
                            },
                          }}
                        >
                          Export XLSX ({filteredResumes.length})
                        </Button>
                      </Grid>
                    </Grid>
                  </Card>
                </motion.div>
              )}

              {resumes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  sx={{
                    textAlign: 'center',
                    py: 8,
                  }}
                >
                  <CardContent>
                    <BusinessCenterIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
                    <Typography variant="h4" sx={{ mb: 1, color: '#1e293b' }}>
                      No Resumes Found
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                      Add resumes via email or URL to get started
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setAddResumeOpen(true)}
                      sx={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      }}
                    >
                      Add Your First Resume
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Grid container spacing={3}>
                <AnimatePresence>
                  {filteredResumes.length === 0 && resumes.length > 0 ? (
                    <Grid item xs={12}>
                      <Card sx={{ textAlign: 'center', py: 6 }}>
                        <CardContent>
                          <SearchIcon sx={{ fontSize: 60, color: '#cbd5e1', mb: 2 }} />
                          <Typography variant="h5" sx={{ mb: 1, color: '#1e293b' }}>
                            No Resumes Found
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                            Try adjusting your search or filter criteria
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedRole('all');
                            }}
                            sx={{ color: '#2563eb', borderColor: '#2563eb' }}
                          >
                            Clear Filters
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ) : (
                    filteredResumes.map((resume, index) => (
                    <Grid item xs={12} md={6} lg={4} key={resume._id}>
                      <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                      >
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1, p: 3 }}>
                            {/* Header */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                <Avatar
                                  sx={{
                                    bgcolor: '#2563eb',
                                    width: 56,
                                    height: 56,
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  {(resume.attachmentData?.name || 'U')[0].toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: 700,
                                      color: '#1e293b',
                                      mb: 0.5,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {resume.attachmentData?.name || 'Unknown Candidate'}
                                  </Typography>
                                  {resume.attachmentData?.role && (
                                    <Chip
                                      label={resume.attachmentData.role}
                                      size="small"
                                      sx={{
                                        bgcolor: '#eff6ff',
                                        color: '#2563eb',
                                        border: '1px solid #dbeafe',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this resume?')) {
                                    deleteResume(resume._id);
                                  }
                                }}
                                sx={{
                                  color: '#64748b',
                                  '&:hover': {
                                    color: '#ef4444',
                                    bgcolor: '#fee2e2',
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Resume Data */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {resume.attachmentData?.email && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <EmailIcon sx={{ fontSize: 20, color: '#2563eb' }} />
                                  <Typography variant="body2" sx={{ color: '#475569', flex: 1 }}>
                                    {resume.attachmentData.email}
                                  </Typography>
                                </Box>
                              )}
                              {resume.attachmentData?.contactNumber && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <PhoneIcon sx={{ fontSize: 20, color: '#7c3aed' }} />
                                  <Typography variant="body2" sx={{ color: '#475569', flex: 1 }}>
                                    {resume.attachmentData.contactNumber}
                                  </Typography>
                                </Box>
                              )}
                              {resume.attachmentData?.dateOfBirth && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <CalendarIcon sx={{ fontSize: 20, color: '#10b981' }} />
                                  <Typography variant="body2" sx={{ color: '#475569', flex: 1 }}>
                                    {resume.attachmentData.dateOfBirth}
                                  </Typography>
                                </Box>
                              )}
                              {resume.attachmentData?.experience && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <WorkIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                                  <Typography variant="body2" sx={{ color: '#475569', flex: 1 }}>
                                    {resume.attachmentData.experience}
                                  </Typography>
                                </Box>
                              )}
                            </Box>

                            {/* Footer */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#94a3b8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                <CalendarIcon sx={{ fontSize: 14 }} />
                                {formatDate(resume.receivedAt || resume.createdAt)}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<DownloadIcon />}
                                  onClick={async () => {
                                    try {
                                      const token = localStorage.getItem('authToken');
                                      
                                      if (!token) {
                                        throw new Error('Not authenticated. Please login again.');
                                      }
                                      
                                      console.log(`📥 Downloading PDF for resume ID: ${resume._id}`);
                                      
                                      // Use fetch instead of axios for blob download
                                      const response = await fetch(`${API_URL}/api/resumes/download/${resume._id}`, {
                                        headers: { 
                                          'Authorization': `Bearer ${token}` 
                                        },
                                      });
                                      
                                      console.log(`📥 Response status: ${response.status}`);
                                      
                                      // Check if response is OK
                                      if (!response.ok) {
                                        // Try to get error message from response
                                        let errorMessage = 'Failed to download PDF';
                                        try {
                                          const contentType = response.headers.get('content-type');
                                          if (contentType && contentType.includes('application/json')) {
                                            const errorData = await response.json();
                                            errorMessage = errorData.error || errorMessage;
                                          } else {
                                            const text = await response.text();
                                            if (text) {
                                              try {
                                                const errorData = JSON.parse(text);
                                                errorMessage = errorData.error || errorMessage;
                                              } catch {
                                                errorMessage = text || errorMessage;
                                              }
                                            }
                                          }
                                        } catch (e) {
                                          console.error('Error parsing error response:', e);
                                          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                                        }
                                        throw new Error(errorMessage);
                                      }
                                      
                                      // Check if response is actually a PDF
                                      const contentType = response.headers.get('content-type');
                                      if (!contentType || !contentType.includes('application/pdf')) {
                                        console.warn('⚠️ Response is not a PDF, content-type:', contentType);
                                      }
                                      
                                      // Get blob from response
                                      const blob = await response.blob();
                                      
                                      if (blob.size === 0) {
                                        throw new Error('Downloaded file is empty');
                                      }
                                      
                                      console.log(`✅ PDF blob received, size: ${blob.size} bytes`);
                                      
                                      // Create blob URL and download
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      const fileName = `${resume.attachmentData?.name || 'resume'}_resume.pdf`;
                                      link.setAttribute('download', fileName);
                                      document.body.appendChild(link);
                                      link.click();
                                      link.remove();
                                      window.URL.revokeObjectURL(url);
                                      
                                      setNotification({
                                        type: 'success',
                                        message: 'Resume PDF downloaded successfully!'
                                      });
                                      setTimeout(() => setNotification(null), 3000);
                                    } catch (error) {
                                      console.error('❌ Error downloading PDF:', error);
                                      setNotification({
                                        type: 'error',
                                        message: error.message || 'Failed to download PDF'
                                      });
                                      setTimeout(() => setNotification(null), 5000);
                                    }
                                  }}
                                  sx={{
                                    borderColor: '#2563eb',
                                    color: '#2563eb',
                                    fontSize: '0.75rem',
                                    py: 0.5,
                                    px: 1.5,
                                    minWidth: 'auto',
                                    '&:hover': {
                                      borderColor: '#1e40af',
                                      bgcolor: '#eff6ff',
                                    },
                                  }}
                                >
                                  Download PDF
                                </Button>
                                <Chip
                                  icon={<PersonIcon />}
                                  label="Resume"
                                  size="small"
                                  sx={{
                                    bgcolor: '#d1fae5',
                                    color: '#065f46',
                                    border: '1px solid #a7f3d0',
                                  }}
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                    ))
                  )}
                </AnimatePresence>
              </Grid>
            )}
            </>
          ) : (
            // Role Analytics Tab
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card sx={{ p: 3, height: '100%', minHeight: '500px' }}>
                    <Typography variant="h4" sx={{ mb: 3, color: '#1e293b', fontWeight: 700 }}>
                      3D Role Distribution
                    </Typography>
                    {roleStats.length > 0 ? (
                      <Box sx={{ width: '100%', height: '450px', position: 'relative' }}>
                        <ThreeDChart data={roleStats} />
                        <Box sx={{ position: 'absolute', bottom: 10, left: 10, bgcolor: 'rgba(255, 255, 255, 0.9)', p: 1.5, borderRadius: 2, backdropFilter: 'blur(10px)' }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                            💡 Drag to rotate • Scroll to zoom
                          </Typography>
                        </Box>
                        {/* Labels overlay */}
                        <Box sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(255, 255, 255, 0.95)', p: 2, borderRadius: 2, minWidth: '200px' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1e293b' }}>
                            Role Distribution
                          </Typography>
                          {roleStats.map((item, index) => {
                            const colors = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
                            return (
                              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: colors[index % colors.length] }} />
                                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                                  {item.name}: {item.value}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="body1" sx={{ color: '#64748b' }}>
                          No role data available
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} lg={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h4" sx={{ mb: 3, color: '#1e293b', fontWeight: 700 }}>
                      Top Roles (Bar Chart)
                    </Typography>
                    {roleStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={roleStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#64748b"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis stroke="#64748b" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#ffffff', 
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="body1" sx={{ color: '#64748b' }}>
                          No role data available
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ mb: 3, color: '#1e293b', fontWeight: 700 }}>
                      Role Statistics Table
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f8fafc' }}>
                            <TableCell sx={{ color: '#1e293b', fontWeight: 700 }}>Rank</TableCell>
                            <TableCell sx={{ color: '#1e293b', fontWeight: 700 }}>Role</TableCell>
                            <TableCell sx={{ color: '#1e293b', fontWeight: 700 }} align="right">Count</TableCell>
                            <TableCell sx={{ color: '#1e293b', fontWeight: 700 }} align="right">Percentage</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {roleStats.map((role, index) => (
                            <TableRow key={role.name} hover>
                              <TableCell>
                                <Chip
                                  label={`#${index + 1}`}
                                  size="small"
                                  sx={{
                                    bgcolor: COLORS[index % COLORS.length],
                                    color: '#fff',
                                    fontWeight: 700,
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ color: '#1e293b', fontWeight: 600 }}>
                                {role.name}
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#1e293b', fontWeight: 600 }}>
                                {role.value}
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#64748b' }}>
                                {((role.value / resumes.length) * 100).toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Main App Component with Routing
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/upload" 
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
