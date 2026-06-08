import React, { useState } from 'react';
import { 
  Paper, Box, Typography, Button, Divider, Chip, 
  Grid, Avatar, List, ListItem, ListItemIcon, ListItemText, Alert
} from '@mui/material';
import { 
  AccountBalance, CheckCircle, Cancel, Person, Fingerprint, AccessTime, PowerSettingsNew 
} from '@mui/icons-material';
import { format } from 'date-fns';
import { authService } from '../services/authService';
import CaptainMascot from '../components/CaptainMascot';

export default function ZerodhaSettings({ auth, setAuth, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const { loginUrl } = await authService.login();
      if (loginUrl) {
        window.location.href = loginUrl;
      } else {
        setError('Failed to retrieve login URL');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while getting login URL');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Zerodha Account? This will stop automated trading.')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.logout();
      setAuth({
        connected: false,
        userName: '',
        userId: '',
        loginTime: ''
      });
      setSuccess('Zerodha account disconnected successfully.');
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message || 'Error occurred while disconnecting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ 
          p: 4, 
          height: '100%', 
          position: 'relative', 
          overflow: 'hidden',
          borderColor: '#1E1E1E',
          boxShadow: '6px 6px 0px #1E1E1E'
        }}>
          {/* Accent cartoon star decal */}
          <Box sx={{
            position: 'absolute',
            top: 10,
            right: 15,
            fontSize: '1.8rem',
            userSelect: 'none',
            transform: 'rotate(15deg)'
          }}>⭐</Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: auth.connected ? '#6BCB77' : '#FF4D4D', 
              width: 56, 
              height: 56,
              border: '3px solid #1E1E1E',
              boxShadow: '3px 3px 0px #1E1E1E'
            }}>
              <AccountBalance fontSize="large" sx={{ color: '#1E1E1E' }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontFamily="Bangers" sx={{ letterSpacing: '1px', lineHeight: 1.1 }}>
                Broker Connection Portal
              </Typography>
              <Typography variant="body2" fontFamily="Fredoka" color="text.secondary">
                Secure API Connection for Strategy execution & Orders placement
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2, borderColor: '#1E1E1E', borderWidth: '1.5px' }} />

          {error && <Alert severity="error" sx={{ mb: 3, border: '2px solid #1E1E1E', borderRadius: '12px', fontFamily: 'Fredoka', fontWeight: 'bold' }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, border: '2px solid #1E1E1E', borderRadius: '12px', fontFamily: 'Fredoka', fontWeight: 'bold' }} onClose={() => setSuccess('')}>{success}</Alert>}

          <Box sx={{ mt: 3 }}>
            {auth.connected ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                  <Typography variant="subtitle1" fontFamily="Fredoka" fontWeight="bold">
                    Connection Status:
                  </Typography>
                  <Chip 
                    icon={<CheckCircle style={{ color: '#1E1E1E' }} />} 
                    label="Active & Connected" 
                    color="success" 
                    sx={{ fontWeight: 'bold', border: '2.5px solid #1E1E1E' }}
                  />
                </Box>

                <List sx={{ 
                  bgcolor: '#FFF8E7', 
                  borderRadius: '16px', 
                  p: 2, 
                  mb: 3,
                  border: '2.5px solid #1E1E1E',
                  boxShadow: '3px 3px 0px #1E1E1E'
                }}>
                  <ListItem>
                    <ListItemIcon>
                      <Person sx={{ color: '#FF6B35' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="User Name" 
                      secondary={auth.userName || 'N/A'} 
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ variant: 'body1', fontWeight: 'bold', color: 'text.primary', fontFamily: 'Fredoka' }}
                    />
                  </ListItem>
                  <Divider sx={{ borderColor: 'rgba(30,30,30,0.1)' }} />
                  <ListItem>
                    <ListItemIcon>
                      <Fingerprint sx={{ color: '#FF6B35' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="User ID" 
                      secondary={auth.userId || 'N/A'} 
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ variant: 'body1', fontWeight: 'bold', color: 'text.primary', fontFamily: 'Fredoka' }}
                    />
                  </ListItem>
                  <Divider sx={{ borderColor: 'rgba(30,30,30,0.1)' }} />
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime sx={{ color: '#FF6B35' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Login Timestamp" 
                      secondary={auth.loginTime ? format(new Date(auth.loginTime), 'yyyy-MM-dd HH:mm:ss') : 'N/A'} 
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ variant: 'body1', fontWeight: 'bold', color: 'text.primary', fontFamily: 'Fredoka' }}
                    />
                  </ListItem>
                </List>

                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  startIcon={<PowerSettingsNew />}
                  onClick={handleDisconnect}
                  disabled={loading}
                  sx={{ 
                    borderRadius: '12px',
                    borderColor: '#1E1E1E',
                    borderWidth: '3px',
                    backgroundColor: '#FF4D4D',
                    color: '#FFFFFF',
                    '&:hover': {
                      backgroundColor: '#E63939',
                      borderWidth: '3px',
                      transform: 'translate(-2px, -2px)',
                      boxShadow: '4px 4px 0px #1E1E1E'
                    }
                  }}
                >
                  Disconnect Account
                </Button>
              </Box>
            ) : (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                  <Typography variant="subtitle1" fontFamily="Fredoka" fontWeight="bold">
                    Connection Status:
                  </Typography>
                  <Chip 
                    icon={<Cancel style={{ color: '#FFFFFF' }} />} 
                    label="Disconnected" 
                    color="error" 
                    sx={{ fontWeight: 'bold', border: '2.5px solid #1E1E1E' }}
                  />
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  alignItems: { xs: 'center', sm: 'flex-start' },
                  gap: 2, 
                  mb: 3 
                }}>
                  <CaptainMascot pose="warning" size={80} />
                  <Box sx={{
                    flex: 1,
                    position: 'relative',
                    bgcolor: '#FFF8E7',
                    border: '2.5px solid #1E1E1E',
                    p: 2.5,
                    borderRadius: '16px',
                    boxShadow: '3px 3px 0px #1E1E1E',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: { xs: '50%', sm: '-10px' },
                      top: { xs: '-10px', sm: '25px' },
                      transform: { xs: 'translateX(-50%) rotate(45deg)', sm: 'rotate(45deg)' },
                      width: '12px',
                      height: '12px',
                      bgcolor: '#FFF8E7',
                      borderLeft: '2.5px solid #1E1E1E',
                      borderBottom: { xs: 'none', sm: '2.5px solid #1E1E1E' },
                      borderTop: { xs: '2.5px solid #1E1E1E', sm: 'none' }
                    }
                  }}>
                    <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold">
                      Captain Candle alert! Your Kite session is not active. Automated trading strategies and order validation are disabled until you complete the authentication flow.
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<AccountBalance />}
                  onClick={handleConnect}
                  disabled={loading}
                  sx={{ 
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    backgroundColor: '#FF6B35',
                    color: '#1E1E1E',
                    boxShadow: '4px 4px 0px #1E1E1E',
                    '&:hover': {
                      backgroundColor: '#FFD93D',
                      transform: 'translate(-2px, -2px)',
                      boxShadow: '6px 6px 0px #1E1E1E',
                    }
                  }}
                >
                  Connect Zerodha Account
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper sx={{ 
          p: 4, 
          height: '100%',
          borderColor: '#1E1E1E',
          boxShadow: '6px 6px 0px #1E1E1E',
          background: 'linear-gradient(to bottom, #FFFFFF 0%, #FFF8E7 100%)'
        }}>
          <Typography variant="h5" fontFamily="Bangers" gutterBottom sx={{ letterSpacing: '1px' }}>
            Authentication Guide
          </Typography>
          <Typography variant="body2" paragraph fontFamily="Fredoka" fontWeight="500" color="text.secondary">
            Zerodha Kite Connect requires a daily authentication. The access token generated is valid for 24 hours (until 6:00 AM the next day).
          </Typography>
          
          <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold" sx={{ mb: 1, textTransform: 'uppercase', color: '#FF6B35' }}>
            Steps to Authenticate:
          </Typography>
          <Box component="ol" sx={{ 
            pl: 2.5, 
            fontSize: '0.875rem', 
            color: 'text.primary',
            fontFamily: 'Fredoka',
            fontWeight: '600',
            '& li': { mb: 1.5 }
          }}>
            <li>Click <b>Connect Zerodha Account</b>.</li>
            <li>You will be redirected to the secure Zerodha login page.</li>
            <li>Log in with your credentials, PIN, and TOTP.</li>
            <li>Upon success, you will automatically be redirected back to the dashboard, and your session will be restored.</li>
          </Box>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2, borderTop: '2px dashed #1E1E1E', pt: 2, fontFamily: 'Fredoka', fontWeight: 'bold' }}>
            ⚠️ API key usage is restricted under developer console terms. Ensure your redirect URL is whitelisted.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
