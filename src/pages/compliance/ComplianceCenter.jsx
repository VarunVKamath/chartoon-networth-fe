import React from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent } from '@mui/material';
import { Shield, ErrorOutline, InfoOutlined, LockOutlined, SchoolOutlined } from '@mui/icons-material';
import CaptainMascot from '../../components/CaptainMascot';

export default function ComplianceCenter() {
  return (
    <Box sx={{ py: 2 }}>
      {/* SECTION 1: Title & Mascot Welcome Banner */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #FF6B35 0%, #FFD93D 100%)',
          color: '#1E1E1E',
          border: '4px solid #1E1E1E',
          boxShadow: '8px 8px 0px #1E1E1E',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background cloud vectors */}
        <Box sx={{ position: 'absolute', top: -20, left: -20, opacity: 0.15, fontSize: '10rem', userSelect: 'none' }}>☁️</Box>
        <Box sx={{ position: 'absolute', bottom: -30, right: 30, opacity: 0.15, fontSize: '12rem', userSelect: 'none' }}>☁️</Box>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <CaptainMascot pose="warning" size={150} />
          </Grid>
          <Grid item xs={12} md={9}>
            {/* Comic style Speech Bubble */}
            <Box
              sx={{
                position: 'relative',
                background: '#FFFFFF',
                border: '3.5px solid #1E1E1E',
                borderRadius: '16px',
                p: 3,
                boxShadow: '4px 4px 0px #1E1E1E',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: { xs: '50%', md: '-20px' },
                  top: { xs: '-20px', md: '50%' },
                  transform: { xs: 'translateX(-50%) rotate(270deg)', md: 'translateY(-50%) rotate(180deg)' },
                  borderWidth: '10px 10px 10px 0',
                  borderStyle: 'solid',
                  borderColor: 'transparent #FFFFFF transparent transparent',
                  display: 'block',
                  width: 0,
                  zIndex: 2
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: { xs: '50%', md: '-24px' },
                  top: { xs: '-24px', md: '50%' },
                  transform: { xs: 'translateX(-50%) rotate(270deg)', md: 'translateY(-50%) rotate(180deg)' },
                  borderWidth: '12px 12px 12px 0',
                  borderStyle: 'solid',
                  borderColor: 'transparent #1E1E1E transparent transparent',
                  display: 'block',
                  width: 0,
                  zIndex: 1
                }
              }}
            >
              <Typography
                variant="h3"
                fontFamily="Bangers"
                gutterBottom
                sx={{
                  letterSpacing: '1px',
                  color: '#1E1E1E',
                  textShadow: '1px 1px 0px #FFF',
                  lineHeight: 1.1
                }}
              >
                Trust & Compliance Center
              </Typography>
              <Typography variant="body1" fontFamily="Fredoka" fontWeight="medium" sx={{ fontSize: '1.1rem', color: '#1E1E1E' }}>
                Hey there, Trader! Safety first! Welcome to our Safety & Compliance Hub. As your trusty companion, 
                Captain Candle is here to help you navigate market rules, understanding risks, and keep your experience secure!
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Comic Panel Grid for disclosures */}
      <Grid container spacing={4}>
        
        {/* SECTION 2: Market Risk Disclosure */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              background: '#FFFFFF',
              border: '3.5px solid #1E1E1E',
              boxShadow: '6px 6px 0px #1E1E1E',
              borderRadius: '20px',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.01)' }
            }}
          >
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <AvatarBubble bg="#FF6B35">
                  <ErrorOutline sx={{ color: '#FFFFFF', fontSize: '2rem' }} />
                </AvatarBubble>
                <Typography variant="h5" fontFamily="Fredoka" fontWeight="bold" color="#1E1E1E">
                  Market Risk Disclosure
                </Typography>
              </Box>
              <Box sx={{ flex: 1, bgcolor: '#FFF8E7', p: 3, borderRadius: '12px', border: '2px dashed #1E1E1E' }}>
                <Typography variant="body1" fontFamily="Fredoka" fontWeight="600" sx={{ mb: 2, color: '#1E1E1E', lineHeight: 1.6 }}>
                  Investments in securities markets are subject to market risks.
                </Typography>
                <Typography variant="body1" fontFamily="Fredoka" fontWeight="600" color="#1E1E1E" sx={{ lineHeight: 1.6 }}>
                  Past performance does not guarantee future results.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* SECTION 3: API Trading Information */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              background: '#FFFFFF',
              border: '3.5px solid #1E1E1E',
              boxShadow: '6px 6px 0px #1E1E1E',
              borderRadius: '20px',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.01)' }
            }}
          >
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <AvatarBubble bg="#4D96FF">
                  <InfoOutlined sx={{ color: '#FFFFFF', fontSize: '2rem' }} />
                </AvatarBubble>
                <Typography variant="h5" fontFamily="Fredoka" fontWeight="bold" color="#1E1E1E">
                  API Trading Information
                </Typography>
              </Box>
              <Box sx={{ flex: 1, bgcolor: '#FFF8E7', p: 3, borderRadius: '12px', border: '2px dashed #1E1E1E' }}>
                <Typography variant="body1" fontFamily="Fredoka" fontWeight="600" color="#1E1E1E" sx={{ lineHeight: 1.6 }}>
                  Orders are executed through authorized broker APIs.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* SECTION 4: Transparency */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              background: '#FFFFFF',
              border: '3.5px solid #1E1E1E',
              boxShadow: '6px 6px 0px #1E1E1E',
              borderRadius: '20px',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.01)' }
            }}
          >
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <AvatarBubble bg="#FFD93D">
                  <Shield sx={{ color: '#1E1E1E', fontSize: '2rem' }} />
                </AvatarBubble>
                <Typography variant="h5" fontFamily="Fredoka" fontWeight="bold" color="#1E1E1E">
                  Transparency
                </Typography>
              </Box>
              <Box sx={{ flex: 1, bgcolor: '#FFF8E7', p: 3, borderRadius: '12px', border: '2px dashed #1E1E1E' }}>
                <Typography variant="body1" fontFamily="Fredoka" fontWeight="600" sx={{ mb: 2, color: '#1E1E1E', lineHeight: 1.6 }}>
                  This platform provides market analysis and execution tools.
                </Typography>
                <Typography variant="body1" fontFamily="Fredoka" fontWeight="600" color="#1E1E1E" sx={{ lineHeight: 1.6 }}>
                  It does not provide investment advice.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* SECTION 5: Security */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              background: '#FFFFFF',
              border: '3.5px solid #1E1E1E',
              boxShadow: '6px 6px 0px #1E1E1E',
              borderRadius: '20px',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.01)' }
            }}
          >
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <AvatarBubble bg="#6BCB77">
                  <LockOutlined sx={{ color: '#FFFFFF', fontSize: '2rem' }} />
                </AvatarBubble>
                <Typography variant="h5" fontFamily="Fredoka" fontWeight="bold" color="#1E1E1E">
                  Security
                </Typography>
              </Box>
              <Box sx={{ flex: 1, bgcolor: '#FFF8E7', p: 3, borderRadius: '12px', border: '2px dashed #1E1E1E', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <SecuritySticker text="Secure Authentication" />
                <SecuritySticker text="Authorized API Access" />
                <SecuritySticker text="Data Protection" />
                <SecuritySticker text="Activity Monitoring" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* SECTION 6: Educational Notice */}
        <Grid item xs={12}>
          <Card
            sx={{
              background: '#FFFFFF',
              border: '3.5px solid #1E1E1E',
              boxShadow: '6px 6px 0px #1E1E1E',
              borderRadius: '20px'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <AvatarBubble bg="#FF6B35">
                  <SchoolOutlined sx={{ color: '#FFFFFF', fontSize: '2rem' }} />
                </AvatarBubble>
                <Typography variant="h5" fontFamily="Fredoka" fontWeight="bold" color="#1E1E1E">
                  Educational Notice
                </Typography>
              </Box>
              <Box sx={{ bgcolor: '#FFF8E7', p: 3, borderRadius: '12px', border: '2px dashed #1E1E1E' }}>
                <Typography variant="body1" fontFamily="Fredoka" fontWeight="600" color="#1E1E1E" sx={{ lineHeight: 1.7 }}>
                  This application is intended to help users understand market data, monitor investments, and execute trades through approved broker integrations.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}

// Helpers for styled cartoon items
function AvatarBubble({ children, bg }) {
  return (
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        bgcolor: bg,
        border: '3px solid #1E1E1E',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '2px 2px 0px #1E1E1E'
      }}
    >
      {children}
    </Box>
  );
}

function SecuritySticker({ text }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1.5,
        bgcolor: '#FFFFFF',
        border: '2.5px solid #1E1E1E',
        borderRadius: '12px',
        boxShadow: '3px 3px 0px #1E1E1E',
        textAlign: 'center',
        transform: `rotate(${(Math.random() * 4 - 2).toFixed(1)}deg)`
      }}
    >
      <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold" color="#1E1E1E">
        🛡️ {text}
      </Typography>
    </Box>
  );
}
