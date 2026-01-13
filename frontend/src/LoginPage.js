import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Link,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
  Security as SecurityIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Professional production theme
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
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    success: {
      main: '#10b981',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease',
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
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '14px 28px',
          fontSize: '1rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
          },
        },
      },
    },
  },
});

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token is still valid
      axios.get(`${API_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        navigate('/');
      })
      .catch(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminData');
      });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username: username.trim(),
        password: password
      });

      // Store token and admin data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('adminData', JSON.stringify(response.data.admin));

      // If remember me is checked, we already stored it (30 day expiration)
      // If not checked, we could use sessionStorage instead, but localStorage is fine

      // Redirect to dashboard
      navigate('/');

    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      
      // Clear password on error
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 20s ease infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: 2, sm: 3 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
            animation: 'pulse 8s ease-in-out infinite',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Card
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Header Section */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  padding: { xs: 3, sm: 4 },
                  textAlign: 'center',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.1,
                  },
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <BusinessIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                      fontWeight: 900,
                      mb: 1,
                      color: 'white',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    youHRpower
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      opacity: 0.95, 
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                    }}
                  >
                    Admin Portal
                  </Typography>
                </motion.div>
              </Box>

              <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <SecurityIcon sx={{ fontSize: 40, color: '#2563eb', mb: 2 }} />
                    <Typography
                      variant="h4"
                      sx={{
                        mb: 1,
                        color: '#1e293b',
                        fontWeight: 700,
                      }}
                    >
                      Welcome Back
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        fontSize: '0.95rem',
                      }}
                    >
                      Sign in to access your dashboard
                    </Typography>
                  </Box>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 3,
                          borderRadius: 2,
                          '& .MuiAlert-icon': {
                            fontSize: 24,
                          },
                        }}
                        onClose={() => setError(null)}
                      >
                        {error}
                      </Alert>
                    </motion.div>
                  )}

                  <Box component="form" onSubmit={handleLogin} noValidate>
                    <TextField
                      fullWidth
                      label="Username or Email"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError(null);
                      }}
                      disabled={loading}
                      margin="normal"
                      required
                      autoComplete="username"
                      autoFocus
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: '#2563eb' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ 
                        mb: 2,
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#2563eb',
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      disabled={loading}
                      margin="normal"
                      required
                      autoComplete="current-password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: '#2563eb' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ 
                                color: '#64748b',
                                '&:hover': {
                                  color: '#2563eb',
                                },
                              }}
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ 
                        mb: 2,
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#2563eb',
                        },
                      }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            sx={{
                              color: '#2563eb',
                              '&.Mui-checked': {
                                color: '#2563eb',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Remember me
                          </Typography>
                        }
                      />
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          // TODO: Implement forgot password
                          setError('Forgot password feature coming soon');
                        }}
                        sx={{
                          color: '#2563eb',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Forgot password?
                      </Link>
                    </Box>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading || !username.trim() || !password.trim()}
                      startIcon={loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <LoginIcon />}
                      sx={{
                        py: 1.75,
                        mb: 3,
                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1e40af 0%, #6d28d9 100%)',
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: '#cbd5e1',
                          color: '#94a3b8',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <Divider sx={{ my: 3 }}>
                      <Typography variant="body2" sx={{ color: '#94a3b8', px: 2 }}>
                        Secure Access
                      </Typography>
                    </Divider>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>
                        Default credentials for first-time setup
                      </Typography>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 2,
                          py: 1,
                          bgcolor: '#f1f5f9',
                          borderRadius: 2,
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          Username: <strong style={{ color: '#1e293b' }}>admin</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#cbd5e1', mx: 1 }}>•</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          Password: <strong style={{ color: '#1e293b' }}>admin123</strong>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              </CardContent>
            </Card>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                © 2024 youHRpower. All rights reserved.
              </Typography>
            </Box>
          </motion.div>
        </Container>

        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.1; }
            50% { transform: scale(1.1); opacity: 0.15; }
          }
        `}</style>
      </Box>
    </ThemeProvider>
  );
}

export default LoginPage;
