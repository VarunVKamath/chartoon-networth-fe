import React, { useEffect, useState } from 'react';
import { Paper, Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { authService } from '../services/authService';
import CaptainMascot from '../components/CaptainMascot';

export default function AuthCallback({ onAuthSuccess }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const exchangeToken = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const requestToken = urlParams.get('request_token') || urlParams.get('requestToken');
        
        if (!requestToken) {
          throw new Error('No request_token found in URL parameters.');
        }

        console.log('Sending request token to backend...', requestToken);
        const session = await authService.callback(requestToken);
        
        setSuccess(true);
        setLoading(false);

        // Wait 1.5 seconds for visual confirmation, then trigger redirect/state change
        setTimeout(() => {
          onAuthSuccess(session);
        }, 1500);
      } catch (err) {
        console.error('Authentication callback failed', err);
        setError(err.response?.data?.error || err.message || 'Failed to authenticate with Zerodha.');
        setLoading(false);
      }
    };

    exchangeToken();
  }, [onAuthSuccess]);

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '70vh',
      width: '100%',
      p: 2
    }}>
      <Paper sx={{
        p: 5,
        width: '100%',
        maxWidth: 520,
        textAlign: 'center',
        border: '4px solid #1E1E1E',
        borderRadius: '24px',
        boxShadow: '8px 8px 0px #1E1E1E',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        transform: 'rotate(-1deg)'
      }}>
        {/* Decorative elements */}
        <Box sx={{ position: 'absolute', top: 10, right: 15, fontSize: '1.5rem', opacity: 0.8 }}>⚡</Box>
        <Box sx={{ position: 'absolute', bottom: 10, left: 15, fontSize: '1.5rem', opacity: 0.8 }}>⭐</Box>

        {loading && (
          <Box sx={{ py: 3 }}>
            <CaptainMascot pose="searching" size={140} style={{ marginBottom: '16px' }} />
            
            <CircularProgress size={50} thickness={4} sx={{ mb: 3, color: '#FF6B35' }} />
            
            <Typography variant="h4" fontFamily="Bangers" gutterBottom sx={{ letterSpacing: '1px' }}>
              CALIBRATING SYSTEM...
            </Typography>
            
            {/* Comic speech bubble */}
            <Box sx={{
              bgcolor: '#FFF8E7',
              border: '2px solid #1E1E1E',
              p: 2,
              borderRadius: '12px',
              mt: 2,
              boxShadow: '3px 3px 0px #1E1E1E'
            }}>
              <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold">
                Captain Candle is securing your credentials. Hang tight, teammate!
              </Typography>
            </Box>
          </Box>
        )}

        {success && (
          <Box sx={{ py: 3 }}>
            <CaptainMascot pose="happy" size={140} style={{ marginBottom: '16px' }} />
            
            <Typography variant="h4" fontFamily="Bangers" color="success.main" gutterBottom sx={{ letterSpacing: '1.5px' }}>
              ACCESS GRANTED!
            </Typography>
            
            {/* Success Speech Bubble */}
            <Box sx={{
              bgcolor: '#E8F5E9',
              border: '2.5px solid #1E1E1E',
              p: 2.5,
              borderRadius: '12px',
              mt: 2,
              boxShadow: '3px 3px 0px #1E1E1E'
            }}>
              <Typography variant="body1" fontFamily="Fredoka" fontWeight="bold" color="#1E1E1E">
                Success! Your Kite session is active! Redirecting to the Command Center...
              </Typography>
            </Box>
          </Box>
        )}

        {error && (
          <Box sx={{ py: 2 }}>
            <CaptainMascot pose="oops" size={140} style={{ marginBottom: '16px' }} />
            
            <Typography variant="h4" fontFamily="Bangers" color="error.main" gutterBottom sx={{ letterSpacing: '1px' }}>
              WHOOPS! RADAR BLOCKED!
            </Typography>
            
            <Alert severity="error" sx={{ 
              my: 2, 
              textAlign: 'left',
              border: '2px solid #1E1E1E',
              borderRadius: '12px',
              fontFamily: 'Fredoka',
              fontWeight: 'bold',
              boxShadow: '3px 3px 0px #1E1E1E'
            }}>
              {error}
            </Alert>
            
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.href = '/'}
              sx={{ 
                mt: 3,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                backgroundColor: '#FF6B35',
                '&:hover': {
                  backgroundColor: '#E85B28'
                }
              }}
            >
              Back to Command Center
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
