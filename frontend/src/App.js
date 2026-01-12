import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
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
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

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
      primary: '#1e293b',
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
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
      color: '#1e293b',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.75rem',
      color: '#1e293b',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#1e293b',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#1e293b',
    },
    body1: {
      color: '#475569',
    },
    body2: {
      color: '#64748b',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 24px',
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

function App() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({ count: 0 });
  const [tabValue, setTabValue] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [addResumeOpen, setAddResumeOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [addingResume, setAddingResume] = useState(false);

  // Filter only emails with resume data
  const resumes = useMemo(() => {
    return emails.filter(email => 
      email.hasAttachment && 
      email.attachmentData && 
      (email.attachmentData.name || email.attachmentData.email)
    );
  }, [emails]);

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

  useEffect(() => {
    fetchEmails();
    fetchStats();

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.on('newEmail', (data) => {
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

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('newEmail');
      socket.off('disconnect');
    };
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/resumes`);
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
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
      const response = await axios.get(`${API_URL}/api/resumes/stats/count`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const deleteResume = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/resumes/${id}`);
      fetchEmails();
      fetchStats();
      setNotification({
        type: 'success',
        message: 'Resume deleted successfully'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error deleting resume:', error);
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
      const response = await axios.post(`${API_URL}/api/resumes/add-from-url`, {
        url: resumeUrl.trim()
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
          padding: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Container maxWidth="xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ mb: 4, mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      mb: 1,
                      fontWeight: 900,
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    }}
                  >
                    youHRpower
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: '#64748b',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    }}
                  >
                    Intelligent Resume Management System
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddResumeOpen(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1e40af 0%, #6d28d9 100%)',
                      boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
                    },
                  }}
                >
                  Add Resume
                </Button>
              </Box>

              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <BusinessCenterIcon sx={{ fontSize: 40, color: '#2563eb', mb: 1 }} />
                        <Typography variant="h2" sx={{ color: '#1e293b', fontWeight: 700, mb: 1 }}>
                          {resumes.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          Total Resumes
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <AssessmentIcon sx={{ fontSize: 40, color: '#7c3aed', mb: 1 }} />
                        <Typography variant="h2" sx={{ color: '#1e293b', fontWeight: 700, mb: 1 }}>
                          {roleStats.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          Unique Roles
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        {isConnected ? (
                          <CheckCircleIcon sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
                        ) : (
                          <ErrorIcon sx={{ fontSize: 40, color: '#ef4444', mb: 1 }} />
                        )}
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {isConnected ? 'Live Sync' : 'Offline'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <TrendingUpIcon sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
                        <Typography variant="h2" sx={{ color: '#1e293b', fontWeight: 700, mb: 1 }}>
                          {roleStats[0]?.value || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          Top Role Count
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>
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
          <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                },
              }}
            >
              <Tab label="Resume Dashboard" icon={<BusinessCenterIcon />} iconPosition="start" />
              <Tab label="Role Analytics" icon={<AssessmentIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Main Content */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <CircularProgress size={60} sx={{ color: '#2563eb' }} />
            </Box>
          ) : tabValue === 0 ? (
            // Resume Dashboard Tab
            resumes.length === 0 ? (
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
                  {resumes.map((resume, index) => (
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
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            )
          ) : (
            // Role Analytics Tab
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h4" sx={{ mb: 3, color: '#1e293b', fontWeight: 700 }}>
                      Role Distribution
                    </Typography>
                    {roleStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={roleStats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {roleStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
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

export default App;
