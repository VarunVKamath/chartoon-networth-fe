import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Paper, Typography, Button, TextField, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Alert, LinearProgress, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, Tabs, Tab, Card, CardContent
} from '@mui/material';
import { 
  PlayArrow, Stop, Warning, Refresh, TrendingUp, AccountBalance 
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

import ZerodhaSettings from './pages/ZerodhaSettings';
import AuthCallback from './pages/AuthCallback';
import ComplianceCenter from './pages/compliance/ComplianceCenter';
import { authService } from './services/authService';
import CaptainMascot from './components/CaptainMascot';

const API_BASE = import.meta.env.VITE_API_URL || '/api'; // Configurable URL for production / local fallback

// Axios instance with interceptors
const api = axios.create({ baseURL: API_BASE });

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

function App() {
  const [activeTab, setActiveTab] = useState(0);
  
  // Connection & Mode
  const [kiteConnected, setKiteConnected] = useState(false);
  const [tradingMode, setTradingMode] = useState('PAPER');
  const [auth, setAuth] = useState({
    connected: false,
    userName: '',
    userId: '',
    loginTime: ''
  });
  const [isCallbackPage, setIsCallbackPage] = useState(
    window.location.pathname === '/kite-callback' || 
    window.location.pathname === '/callback' || 
    window.location.search.includes('request_token=')
  );
  
  // Dashboard State
  const [dashboardStatus, setDashboardStatus] = useState('WAITING_FOR_MARKET');
  const [currentTrade, setCurrentTrade] = useState(null);
  const [rankedStocks, setRankedStocks] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [liveLogs, setLiveLogs] = useState([]);
  const [stocksList, setStocksList] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [manualSymbol, setManualSymbol] = useState('');
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [newStocksInput, setNewStocksInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      const [statusRes, stocksRes, historyRes] = await Promise.all([
        api.get('/dashboard/status'),
        api.get('/strategy/stocks'),
        api.get('/trade/history')
      ]);
      
      const statusData = statusRes.data;
      const stocksData = stocksRes.data;
      const historyData = historyRes.data;
      
      if (!statusData || typeof statusData !== 'object' || 
          !stocksData || typeof stocksData !== 'object' || 
          !historyData || typeof historyData !== 'object') {
        throw new Error('API returned invalid JSON response. Please check your VITE_API_URL environment variable configuration.');
      }
      
      setDashboardStatus(statusData.status || 'WAITING_FOR_MARKET');
      setCurrentTrade(statusData.currentTrade || null);
      setTradingMode(statusData.mode || 'PAPER');
      setStocksList(stocksData.stocks || []);
      setTradeHistory(historyData.history || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch data from backend API');
    }
  };

  // Polling for live data
  useEffect(() => {
    fetchInitialData();
    
    const interval = setInterval(async () => {
      try {
        const [statusRes, currentRes, logsRes] = await Promise.all([
          api.get('/dashboard/status'),
          api.get('/trade/current'),
          api.get('/dashboard/logs')
        ]);
        
        const statusData = statusRes.data;
        const currentData = currentRes.data;
        const logsData = logsRes.data;
        
        if (statusData && typeof statusData === 'object') {
          setDashboardStatus(statusData.status || 'WAITING_FOR_MARKET');
        }
        if (currentData && typeof currentData === 'object') {
          setCurrentTrade(currentData.trade || null);
        }
        if (logsData && typeof logsData === 'object') {
          setLiveLogs(logsData.logs || []);
        }
        
        // Refresh history occasionally
        if (Math.random() < 0.3) {
          const hist = await api.get('/trade/history');
          const histData = hist.data;
          if (histData && typeof histData === 'object') {
            setTradeHistory(histData.history || []);
          }
        }
      } catch (e) {
        // silent fail on poll
      }
    }, 4000); // Poll every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // Check Kite connection status
  const checkKiteStatus = async () => {
    try {
      const data = await authService.status();
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid authentication status response');
      }
      setAuth({
        connected: !!data.connected,
        userName: data.userName || '',
        userId: data.userId || '',
        loginTime: data.loginTime || ''
      });
      setKiteConnected(!!data.connected);
      setTradingMode(data.mode || 'PAPER');
    } catch (err) {
      setKiteConnected(false);
      setAuth({
        connected: false,
        userName: '',
        userId: '',
        loginTime: ''
      });
    }
  };

  useEffect(() => {
    checkKiteStatus();
  }, []);

  const handleAuthSuccess = (session) => {
    if (session && typeof session === 'object') {
      setAuth({
        connected: true,
        userName: session.userName || session.user_name || '',
        userId: session.userId || session.user_id || '',
        loginTime: session.loginTime || new Date().toISOString()
      });
      setKiteConnected(true);
      setSuccess('Kite session activated successfully! You are now connected.');
    } else {
      setError('Received invalid session after Zerodha authentication.');
    }
    // Remove token params from URL and navigate back to root
    window.history.pushState({}, '', '/');
    setIsCallbackPage(false);
  };

  // Trigger manual scan & show ranking
  const handleScanStocks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/strategy/scan');
      const data = res.data;
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid scan response received');
      }
      setRankedStocks(data.rankedStocks || []);
      setSuccess(`Scan complete. Top pick: ${data.bestStock?.symbol || 'None'}`);
    } catch (err) {
      setError(err.message || 'Scan failed. Is Kite connected?');
    }
    setLoading(false);
  };

  // Manual Buy
  const handleManualBuy = async () => {
    if (!manualSymbol) return;
    setLoading(true);
    try {
      const res = await api.post('/trade/buy', { symbol: manualSymbol });
      const data = res.data;
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid buy response received');
      }
      if (data.success) {
        setSuccess(`Manual BUY placed for ${manualSymbol}`);
        setManualSymbol('');
      } else {
        setError(data.reason || 'Buy failed');
      }
    } catch (err) {
      setError(err.message || 'Buy request failed');
    }
    setLoading(false);
  };

  // Sell / Emergency
  const handleSell = async () => {
    setLoading(true);
    try {
      await api.post('/trade/sell');
      setSuccess('Sell order placed');
    } catch (err) {
      setError('Sell failed');
    }
    setLoading(false);
  };

  const handleEmergency = async () => {
    if (!window.confirm('Emergency square off ALL positions?')) return;
    setLoading(true);
    try {
      await api.post('/trade/emergency-square-off');
      setSuccess('Emergency square off executed');
    } catch (err) {
      setError('Emergency failed');
    }
    setLoading(false);
  };

  // Update stock list
  const handleUpdateStocks = async () => {
    const stocks = newStocksInput.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    if (stocks.length !== 10) {
      setError('Exactly 10 comma-separated stocks required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/strategy/stocks', { stocks });
      setStocksList(stocks);
      setShowStockDialog(false);
      setNewStocksInput('');
      setSuccess('Stock universe updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
    setLoading(false);
  };

  // Status color helper
  const getStatusColor = (status) => {
    if (status === 'TRADE_ACTIVE') return 'success';
    if (status === 'SCANNING_STOCKS') return 'warning';
    if (status === 'POSITION_CLOSED') return 'info';
    return 'default';
  };

  // Calculate daily PnL from history
  const dailyPnL = tradeHistory.reduce((sum, t) => sum + (t.pnl || 0), 0);

  const customTabStyle = {
    fontFamily: 'Fredoka',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    borderRadius: '12px',
    border: '3px solid #1E1E1E',
    boxShadow: '3px 3px 0px #1E1E1E',
    backgroundColor: '#FFFFFF',
    color: '#1E1E1E',
    mx: 0.5,
    my: 0.5,
    textTransform: 'none',
    transition: 'transform 0.15s, box-shadow 0.15s',
    '&:hover': {
      backgroundColor: '#FFD93D',
      transform: 'translate(-2px, -2px)',
      boxShadow: '4px 4px 0px #1E1E1E'
    },
    '&.Mui-selected': {
      backgroundColor: '#FF6B35',
      color: '#FFFFFF',
      transform: 'translate(1px, 1px)',
      boxShadow: '1px 1px 0px #1E1E1E'
    }
  };

  if (isCallbackPage) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <AuthCallback onAuthSuccess={handleAuthSuccess} />
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
        {/* Header (Cartoon Command Center Appearance) */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderColor: '#1E1E1E', 
            borderWidth: '4px',
            boxShadow: '6px 6px 0px #1E1E1E',
            background: 'linear-gradient(135deg, #FFD93D 0%, #FFF8E7 100%)',
            position: 'relative'
          }}
        >
          {/* Decorative burst decal */}
          <Box sx={{
            position: 'absolute',
            top: -12,
            right: 30,
            bgcolor: '#4D96FF',
            border: '2.5px solid #1E1E1E',
            borderRadius: '8px',
            px: 1.5,
            py: 0.5,
            transform: 'rotate(5deg)',
            boxShadow: '2px 2px 0px #1E1E1E',
            zIndex: 10
          }}>
            <Typography variant="caption" fontFamily="Fredoka" fontWeight="bold" color="#FFFFFF">
              90s SPECIAL EDITION 🚀
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CaptainMascot pose="happy" size={68} />
              <Box>
                <Typography variant="h3" sx={{ m: 0, textShadow: '2px 2px 0px #FFFFFF', color: '#1E1E1E', letterSpacing: '1px', lineHeight: 1.1 }}>
                  Chartoon Networth
                </Typography>
                <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold" color="text.secondary">
                  9:15 AM Auto Select + Buy • 10:00 AM Auto Exit • SL/Target Protection
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
              <Chip 
                icon={tradingMode === 'REAL' ? <Warning sx={{ color: '#1E1E1E !important' }} /> : <TrendingUp sx={{ color: '#1E1E1E !important' }} />}
                label={tradingMode} 
                color={tradingMode === 'REAL' ? 'error' : 'success'} 
                sx={{ 
                  fontWeight: 'bold', 
                  borderWidth: '2.5px',
                  borderColor: '#1E1E1E',
                  boxShadow: '2.5px 2.5px 0px #1E1E1E'
                }}
              />
              <Chip 
                label={kiteConnected ? 'Kite Connected' : 'Kite Disconnected'} 
                color={kiteConnected ? 'success' : 'error'} 
                sx={{ 
                  fontWeight: 'bold', 
                  borderWidth: '2.5px',
                  borderColor: '#1E1E1E',
                  boxShadow: '2.5px 2.5px 0px #1E1E1E'
                }}
              />
              <Button 
                variant="outlined" 
                startIcon={<Refresh />} 
                onClick={fetchInitialData}
                disabled={loading}
                sx={{
                  borderWidth: '2.5px !important',
                  fontWeight: 'bold',
                  borderColor: '#1E1E1E',
                  backgroundColor: '#FFFFFF',
                  color: '#1E1E1E',
                  boxShadow: '2.5px 2.5px 0px #1E1E1E',
                  '&:hover': {
                    borderWidth: '2.5px !important',
                    borderColor: '#1E1E1E',
                    backgroundColor: '#FFD93D'
                  }
                }}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Alerts (Comic banners) */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError('')} 
            sx={{ 
              mb: 3, 
              border: '3px solid #1E1E1E', 
              borderRadius: '16px',
              boxShadow: '4px 4px 0px #1E1E1E',
              fontFamily: 'Fredoka',
              fontWeight: 'bold'
            }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert 
            severity="success" 
            onClose={() => setSuccess('')} 
            sx={{ 
              mb: 3, 
              border: '3px solid #1E1E1E', 
              borderRadius: '16px',
              boxShadow: '4px 4px 0px #1E1E1E',
              fontFamily: 'Fredoka',
              fontWeight: 'bold'
            }}
          >
            {success}
          </Alert>
        )}

        {/* Navigation Tabs (Sticker layout) */}
        <Box sx={{ mb: 4 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTabs-flexContainer': { gap: 1.5 }
            }}
          >
            <Tab label="Live Dashboard" sx={customTabStyle} />
            <Tab label="Trade History & PnL" sx={customTabStyle} />
            <Tab label="Settings & Controls" sx={customTabStyle} />
            <Tab label="Safety & Compliance" sx={customTabStyle} />
          </Tabs>
        </Box>

        {/* TAB 0: LIVE DASHBOARD */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            
            {/* Captain Candle Welcome Panel */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3, 
                border: '3px solid #1E1E1E',
                boxShadow: '5px 5px 0px #1E1E1E',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #FF6B35 0%, #FFD93D 100%)',
                color: '#1E1E1E',
                display: 'flex',
                alignItems: 'center',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3
              }}>
                <CaptainMascot pose="happy" size={110} />
                <Box sx={{
                  flex: 1,
                  bgcolor: '#FFFFFF',
                  p: 2.5,
                  borderRadius: '16px',
                  border: '3px solid #1E1E1E',
                  boxShadow: '3px 3px 0px #1E1E1E',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: { xs: '50%', sm: '-12px' },
                    top: { xs: '-12px', sm: '50%' },
                    transform: { xs: 'translateX(-50%) rotate(270deg)', sm: 'translateY(-50%) rotate(180deg)' },
                    borderWidth: '6px 6px 6px 0',
                    borderStyle: 'solid',
                    borderColor: 'transparent #FFFFFF transparent transparent',
                    display: 'block',
                    width: 0
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: { xs: '50%', sm: '-16px' },
                    top: { xs: '-16px', sm: '50%' },
                    transform: { xs: 'translateX(-50%) rotate(270deg)', sm: 'translateY(-50%) rotate(180deg)' },
                    borderWidth: '8px 8px 8px 0',
                    borderStyle: 'solid',
                    borderColor: 'transparent #1E1E1E transparent transparent',
                    display: 'block',
                    width: 0,
                    zIndex: -1
                  }
                }}>
                  <Typography variant="h5" fontFamily="Fredoka" fontWeight="bold" gutterBottom>
                    Welcome to the Cartoon Command Center! 🕯️
                  </Typography>
                  <Typography variant="body1" fontFamily="Fredoka" fontWeight="500">
                    I'm <b>Captain Candle</b>, your stock market sidekick! I keep watch over your portfolio metrics,
                    calculating momentum, analyzing stock rankings, and tracking open trades. Make sure your account is connected below!
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Zerodha Connection Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', border: '3px solid #1E1E1E' }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" fontFamily="Bangers" gutterBottom display="flex" alignItems="center" gap={1}>
                      Zerodha Connection {auth.connected ? '✅' : '❌'}
                    </Typography>
                    {auth.connected ? (
                      <Box sx={{ 
                        mt: 1.5,
                        bgcolor: '#FFF8E7',
                        p: 1.5,
                        borderRadius: '10px',
                        border: '1.5px dashed #1E1E1E'
                      }}>
                        <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold">
                          User: {auth.userName}
                        </Typography>
                        <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold">
                          ID: {auth.userId}
                        </Typography>
                        <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold" sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          Login: {auth.loginTime ? format(new Date(auth.loginTime), 'HH:mm:ss') : 'N/A'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" fontFamily="Fredoka" color="text.secondary" sx={{ mt: 1 }}>
                        Kite session is not active. Connect to enable auto-trading.
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ mt: 2.5 }}>
                    {auth.connected ? (
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        onClick={async () => {
                          if (window.confirm('Disconnect Zerodha account?')) {
                            await authService.logout();
                            checkKiteStatus();
                            setSuccess('Zerodha account disconnected.');
                          }
                        }}
                        sx={{
                          backgroundColor: '#FF4D4D',
                          color: '#FFFFFF',
                          borderColor: '#1E1E1E',
                          borderWidth: '2px !important',
                          '&:hover': {
                            backgroundColor: '#E63939'
                          }
                        }}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary"
                        size="small"
                        sx={{ 
                          fontWeight: 'bold', 
                          color: '#1E1E1E',
                          background: 'linear-gradient(45deg, #FF6B35 30%, #FFD93D 90%)',
                          borderColor: '#1E1E1E',
                          borderWidth: '2.5px',
                          boxShadow: '3px 3px 0px #1E1E1E',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #E85B28 30%, #E8C52E 90%)'
                          }
                        }}
                        onClick={async () => {
                          try {
                            const { loginUrl } = await authService.login();
                            if (loginUrl) window.location.href = loginUrl;
                          } catch (err) {
                            setError('Failed to get login URL');
                          }
                        }}
                      >
                        Connect Account
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Strategy Status Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', border: '3px solid #1E1E1E' }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" fontFamily="Bangers" gutterBottom>Strategy Status</Typography>
                    <Chip 
                      label={dashboardStatus.replace(/_/g, ' ')} 
                      color={getStatusColor(dashboardStatus)} 
                      sx={{ mb: 1.5, fontSize: '0.85rem', fontWeight: 'bold', border: '2px solid #1E1E1E' }}
                    />
                    <Typography variant="body2" fontFamily="Fredoka" color="text.secondary">
                      {dashboardStatus === 'WAITING_FOR_MARKET' && 'Next action: 9:15 AM auto-scan'}
                      {dashboardStatus === 'SCANNING_STOCKS' && 'Analyzing 10 stocks...'}
                      {dashboardStatus === 'TRADE_ACTIVE' && 'Position open • Monitoring SL/Target'}
                      {dashboardStatus === 'POSITION_CLOSED' && 'Trade completed for today'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2.5 }}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      onClick={handleScanStocks}
                      disabled={loading || !kiteConnected}
                      startIcon={<PlayArrow />}
                      size="small"
                      sx={{
                        borderColor: '#1E1E1E',
                        backgroundColor: '#4D96FF',
                        color: '#FFFFFF',
                        '&:hover': {
                          backgroundColor: '#2A7FFF',
                          color: '#FFFFFF'
                        }
                      }}
                    >
                      Manual Scan Now
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Active Position Card (Trading-Card Style Layout) */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%', 
                border: '3px solid #1E1E1E',
                position: 'relative',
                background: currentTrade ? 'linear-gradient(to bottom, #FFFFFF 0%, #FFF8E7 100%)' : '#FFFFFF',
                boxShadow: currentTrade ? '6px 6px 0px #4D96FF' : '5px 5px 0px #1E1E1E'
              }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
                  <Box>
                    <Typography variant="h5" fontFamily="Bangers" gutterBottom>Active Position</Typography>
                    
                    {currentTrade ? (
                      <Box sx={{
                        border: '2px solid #1E1E1E',
                        borderRadius: '12px',
                        p: 1.5,
                        backgroundColor: '#FFFFFF',
                        boxShadow: '3px 3px 0px #1E1E1E'
                      }}>
                        <Typography variant="h4" fontFamily="Bangers" color="primary" sx={{ m: 0 }}>
                          {currentTrade.symbol}
                        </Typography>
                        <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold">
                          Entry: ₹{currentTrade.entryPrice?.toFixed(2)} | Qty: {currentTrade.quantity}
                        </Typography>
                        <Typography variant="body2" fontFamily="Fredoka" color="text.secondary" fontWeight="bold">
                          SL: ₹{currentTrade.stopLossPrice?.toFixed(2)} • Target: ₹{currentTrade.targetPrice?.toFixed(2)}
                        </Typography>
                        
                        {currentTrade.currentPrice && (
                          <Box sx={{ mt: 1, borderTop: '1px dashed #1E1E1E', pt: 1 }}>
                            <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold">
                              Current: ₹{currentTrade.currentPrice.toFixed(2)}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color={currentTrade.unrealizedPnl >= 0 ? 'success.main' : 'error.main'}
                              fontFamily="Fredoka"
                              fontWeight="bold"
                            >
                              Unrealized PnL: ₹{currentTrade.unrealizedPnl?.toFixed(2)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 1 }}>
                        <CaptainMascot pose="empty" size={80} />
                        <Typography color="text.secondary" variant="body2" fontFamily="Fredoka" fontWeight="bold" sx={{ mt: 1 }}>
                          "Nothing to display right now!"
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ mt: 2.5 }}>
                    {currentTrade && (
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="error" 
                        size="small"
                        onClick={handleSell}
                        disabled={loading}
                        sx={{
                          backgroundColor: '#FF4D4D',
                          color: '#FFFFFF',
                          borderColor: '#1E1E1E',
                          '&:hover': {
                            backgroundColor: '#E63939'
                          }
                        }}
                      >
                        Manual Sell Now
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Controls (Sticker Style Console) */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', border: '3px solid #1E1E1E' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h5" fontFamily="Bangers" gutterBottom>Quick Controls</Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField 
                        label="Manual Buy Symbol" 
                        value={manualSymbol} 
                        onChange={e => setManualSymbol(e.target.value.toUpperCase())}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <Button 
                        variant="contained" 
                        onClick={handleManualBuy}
                        disabled={!manualSymbol || loading || !kiteConnected}
                        size="small"
                        sx={{
                          backgroundColor: '#FFD93D',
                          color: '#1E1E1E',
                          borderColor: '#1E1E1E',
                          borderWidth: '2.5px !important',
                          '&:hover': {
                            backgroundColor: '#FF6B35',
                            color: '#FFFFFF'
                          }
                        }}
                      >
                        BUY
                      </Button>
                    </Box>
                    
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="error" 
                      onClick={handleEmergency}
                      disabled={loading || !currentTrade}
                      startIcon={<Warning />}
                      size="small"
                      sx={{
                        backgroundColor: '#FF4D4D',
                        color: '#FFFFFF',
                        borderColor: '#1E1E1E',
                        boxShadow: '3px 3px 0px #1E1E1E',
                        '&:hover': {
                          backgroundColor: '#E63939'
                        }
                      }}
                    >
                      EMERGENCY
                    </Button>
                    
                    <Button 
                      fullWidth 
                      variant="text" 
                      onClick={() => setShowStockDialog(true)}
                      size="small"
                      sx={{
                        border: '2px dashed #1E1E1E',
                        boxShadow: 'none',
                        color: '#1E1E1E',
                        fontFamily: 'Fredoka',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        '&:hover': {
                          backgroundColor: '#FFF8E7',
                          border: '2.5px solid #1E1E1E'
                        }
                      }}
                    >
                      Edit Stock Universe
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Watchlist Section / Top Ranking Table + Chart */}
            <Grid item xs={12} lg={7}>
              <Paper sx={{ p: 3, border: '3px solid #1E1E1E', boxShadow: '6px 6px 0px #1E1E1E' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h5" fontFamily="Bangers" sx={{ letterSpacing: '1px' }}>
                    Top 10 Stock Ranking (Watchlist)
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={handleScanStocks} 
                    disabled={loading}
                    sx={{
                      borderColor: '#1E1E1E',
                      backgroundColor: '#FFD93D',
                      px: 2,
                      '&:hover': {
                        backgroundColor: '#FF6B35',
                        color: '#FFFFFF'
                      }
                    }}
                  >
                    Rescan
                  </Button>
                </Box>
                
                {rankedStocks.length > 0 ? (
                  <>
                    <TableContainer sx={{ 
                      maxHeight: 320, 
                      border: '3.5px solid #1E1E1E',
                      borderRadius: '16px',
                      boxShadow: '3px 3px 0px #1E1E1E',
                      overflowX: 'auto',
                      overflowY: 'auto',
                      mb: 3
                    }}>
                      <Table size="small" sx={{ minWidth: 600 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Rank</TableCell>
                            <TableCell>Stock</TableCell>
                            <TableCell align="right">Gap %</TableCell>
                            <TableCell align="right">Momentum %</TableCell>
                            <TableCell align="right">Volume Score</TableCell>
                            <TableCell align="right"><b>Final Score</b></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rankedStocks.slice(0, 10).map((stock, index) => (
                            <TableRow key={stock.symbol} hover sx={{ '&:hover': { backgroundColor: '#FFF8E7 !important' } }}>
                              <TableCell>#{index + 1}</TableCell>
                              <TableCell><b>{stock.symbol}</b></TableCell>
                              <TableCell align="right" sx={{ 
                                color: stock.gapPercent > 0 ? '#6BCB77 !important' : '#FF4D4D !important',
                                fontWeight: 'bold' 
                              }}>
                                {stock.gapPercent?.toFixed(2)}%
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: '600' }}>{stock.momentumPercent?.toFixed(2)}%</TableCell>
                              <TableCell align="right" sx={{ fontWeight: '600' }}>{stock.volumeScore?.toFixed(0)}</TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={stock.finalScore?.toFixed(1)} 
                                  color={stock.finalScore > 70 ? 'success' : 'default'} 
                                  size="small" 
                                  sx={{ border: '1.5px solid #1E1E1E' }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Score Bar Chart (Styled hand-drawn container) */}
                    <Box sx={{ 
                      height: 240, 
                      mt: 3, 
                      p: 2, 
                      bgcolor: '#FFFFFF', 
                      border: '3px solid #1E1E1E', 
                      borderRadius: '16px',
                      boxShadow: '3px 3px 0px #1E1E1E'
                    }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rankedStocks.slice(0, 8)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#CCCCCC" />
                          <XAxis dataKey="symbol" tick={{ fill: '#1E1E1E', fontWeight: 'bold', fontFamily: 'Fredoka' }} />
                          <YAxis tick={{ fill: '#1E1E1E', fontWeight: 'bold', fontFamily: 'Fredoka' }} />
                          <Tooltip contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '3px solid #1E1E1E', 
                            borderRadius: '12px',
                            boxShadow: '3px 3px 0px #1E1E1E',
                            fontFamily: 'Fredoka',
                            fontWeight: 'bold'
                          }} />
                          <Bar 
                            dataKey="finalScore" 
                            fill="#FF6B35" 
                            name="Final Score" 
                            stroke="#1E1E1E"
                            strokeWidth={3}
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <CaptainMascot pose="empty" size={120} />
                    <Typography color="text.secondary" align="center" sx={{ mt: 2, fontFamily: 'Fredoka', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      "Looks like this list is waiting for action!"
                    </Typography>
                    <Typography color="text.secondary" align="center" sx={{ fontFamily: 'Fredoka', fontSize: '0.9rem' }}>
                      Click "Rescan" or "Manual Scan Now" to see live ranking
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Live Logs Panel (CRT Screen Style) */}
            <Grid item xs={12} lg={5}>
              <Paper sx={{ 
                p: 3, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                border: '3px solid #1E1E1E', 
                boxShadow: '6px 6px 0px #1E1E1E',
                background: '#FFFFFF'
              }}>
                <Typography variant="h5" fontFamily="Bangers" gutterBottom sx={{ letterSpacing: '1px' }}>
                  Live Activity Logs
                </Typography>
                <Box 
                  sx={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    bgcolor: '#1E1E1E', 
                    p: 2.5, 
                    borderRadius: '16px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    maxHeight: 380,
                    border: '4px solid #4A4A4A',
                    boxShadow: 'inset 0 0 10px #000000',
                    color: '#6BCB77',
                    position: 'relative'
                  }}
                >
                  {/* CRT Screen Scan Line Effect */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                    backgroundSize: '100% 4px, 6px 100%',
                    pointerEvents: 'none'
                  }} />

                  {liveLogs.length > 0 ? liveLogs.map((log, idx) => (
                    <Box key={idx} sx={{ mb: 1, color: log.level === 'error' ? '#FF4D4D' : '#6BCB77', textShadow: '0 0 2px currentColor' }}>
                      [{format(new Date(log.time), 'HH:mm:ss')}] {log.message}
                    </Box>
                  )) : (
                    <Typography variant="body2" color="text.secondary" fontFamily="monospace" sx={{ textShadow: '0 0 2px currentColor' }}>
                      Waiting for activity...
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* TAB 1: HISTORY (Orders page style) */}
        {activeTab === 1 && (
          <Paper sx={{ p: 3, border: '3px solid #1E1E1E', boxShadow: '6px 6px 0px #1E1E1E' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h4" fontFamily="Bangers" sx={{ letterSpacing: '1px' }}>
                Trade History & Positions
              </Typography>
              <Box sx={{
                bgcolor: '#FFF8E7',
                border: '2.5px solid #1E1E1E',
                borderRadius: '12px',
                px: 2.5,
                py: 1,
                boxShadow: '3px 3px 0px #1E1E1E'
              }}>
                <Typography variant="h6" fontFamily="Fredoka" fontWeight="bold" sx={{ color: dailyPnL >= 0 ? '#6BCB77' : '#FF4D4D' }}>
                  Today's P&L: ₹{dailyPnL.toFixed(2)}
                </Typography>
              </Box>
            </Box>
            
            {tradeHistory.length > 0 ? (
              <TableContainer sx={{
                border: '3.5px solid #1E1E1E',
                borderRadius: '16px',
                boxShadow: '4px 4px 0px #1E1E1E',
                overflowX: 'auto'
              }}>
                <Table sx={{ minWidth: 750 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>Buy Price</TableCell>
                      <TableCell>Sell Price</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>PnL (₹)</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Mode</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tradeHistory.map((trade, index) => (
                      <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#FFF8E7 !important' } }}>
                        <TableCell sx={{ fontFamily: 'Fredoka', fontWeight: '600' }}>{format(new Date(trade.buyTime), 'dd MMM HH:mm')}</TableCell>
                        <TableCell><b>{trade.symbol}</b></TableCell>
                        <TableCell sx={{ fontWeight: '600' }}>₹{trade.entryPrice?.toFixed(2)}</TableCell>
                        <TableCell sx={{ fontWeight: '600' }}>₹{trade.exitPrice?.toFixed(2)}</TableCell>
                        <TableCell sx={{ fontWeight: '700' }}>{trade.quantity}</TableCell>
                        <TableCell sx={{ 
                          color: trade.pnl >= 0 ? '#6BCB77 !important' : '#FF4D4D !important', 
                          fontWeight: '800' 
                        }}>
                          {trade.pnl?.toFixed(2)} ({trade.pnlPercent?.toFixed(1)}%)
                        </TableCell>
                        <TableCell>
                          <Chip label={trade.exitReason} size="small" sx={{ border: '1.5px solid #1E1E1E', fontWeight: 'bold' }} />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={trade.isPaper ? 'PAPER' : 'REAL'} 
                            color={trade.isPaper ? 'success' : 'error'} 
                            size="small" 
                            sx={{ border: '1.5px solid #1E1E1E' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CaptainMascot pose="empty" size={130} />
                <Typography color="text.secondary" align="center" sx={{ mt: 2, fontFamily: 'Fredoka', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  "No stocks here yet!"
                </Typography>
                <Typography color="text.secondary" align="center" sx={{ fontFamily: 'Fredoka', fontSize: '0.9rem' }}>
                  Your completed transactions for today will show up here.
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* TAB 2: SETTINGS */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Zerodha Connection Settings Card */}
            <ZerodhaSettings auth={auth} setAuth={setAuth} onRefresh={checkKiteStatus} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%', border: '3px solid #1E1E1E', boxShadow: '5px 5px 0px #1E1E1E' }}>
                  <Typography variant="h5" fontFamily="Bangers" gutterBottom sx={{ letterSpacing: '1px' }}>
                    Risk Parameters (from .env)
                  </Typography>
                  
                  <Box sx={{
                    bgcolor: '#FFF8E7',
                    p: 2.5,
                    borderRadius: '12px',
                    border: '2px dashed #1E1E1E',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    mt: 2
                  }}>
                    <Typography fontFamily="Fredoka" fontWeight="bold">🛡️ Stop Loss: 0.75%</Typography>
                    <Typography fontFamily="Fredoka" fontWeight="bold">🎯 Target: 1.5%</Typography>
                    <Typography fontFamily="Fredoka" fontWeight="bold">📈 Score Threshold: 65</Typography>
                  </Box>

                  <Typography sx={{ mt: 3, color: '#FF6B35', fontFamily: 'Fredoka', fontWeight: 'bold' }}>
                    To change these parameters, edit backend/.env and restart server.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%', border: '3px solid #1E1E1E', boxShadow: '5px 5px 0px #1E1E1E' }}>
                  <Typography variant="h5" fontFamily="Bangers" gutterBottom sx={{ letterSpacing: '1px' }}>
                    Current Stock Universe
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, p: 2, bgcolor: '#FFF8E7', borderRadius: '12px', border: '2px dashed #1E1E1E' }}>
                    {stocksList.map(stock => (
                      <Chip 
                        key={stock} 
                        label={stock} 
                        sx={{ 
                          fontWeight: 'bold', 
                          border: '2px solid #1E1E1E',
                          backgroundColor: '#FFFFFF',
                          boxShadow: '1.5px 1.5px 0px #1E1E1E'
                        }} 
                      />
                    ))}
                  </Box>
                  <Button 
                    sx={{ 
                      mt: 3,
                      borderColor: '#1E1E1E',
                      backgroundColor: '#FFD93D',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: '#FF6B35',
                        color: '#FFFFFF'
                      }
                    }} 
                    onClick={() => setShowStockDialog(true)}
                  >
                    Edit 10 Stocks
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 3: SAFETY & COMPLIANCE PAGE */}
        {activeTab === 3 && (
          <ComplianceCenter />
        )}

        {/* Stock Edit Dialog */}
        <Dialog open={showStockDialog} onClose={() => setShowStockDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontFamily: 'Bangers', fontSize: '1.5rem', letterSpacing: '0.5px' }}>
            Configure Stock Universe (exactly 10 NSE stocks)
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comma separated stocks"
              placeholder="RELIANCE,TCS,INFY,HDFCBANK,ICICIBANK,SBIN,LT,AXISBANK,ITC,BHARTIARTL"
              value={newStocksInput}
              onChange={(e) => setNewStocksInput(e.target.value)}
              sx={{ mt: 2 }}
            />
            <Typography variant="caption" fontFamily="Fredoka" fontWeight="bold" display="block" sx={{ mt: 1.5, color: '#FF6B35' }}>
              Current: {stocksList.join(', ')}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setShowStockDialog(false)} sx={{ borderColor: '#1E1E1E' }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStocks} 
              variant="contained" 
              disabled={loading}
              sx={{
                backgroundColor: '#FF6B35',
                color: '#1E1E1E',
                borderColor: '#1E1E1E',
                '&:hover': {
                  backgroundColor: '#FFD93D'
                }
              }}
            >
              Save & Update
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* Permanent Footer Disclaimer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          bgcolor: '#FFFFFF', 
          borderTop: '3.5px solid #1E1E1E',
          textAlign: 'center',
          boxShadow: '0px -4px 0px rgba(0, 0, 0, 0.05)',
          mt: 5
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold" color="#1E1E1E" sx={{ mb: 1, fontSize: '0.85rem', lineHeight: 1.6 }}>
            Investments in securities markets are subject to market risks. Read all related documents carefully before investing.
          </Typography>
          <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold" color="#1E1E1E" sx={{ fontSize: '0.85rem' }}>
            Past performance is not indicative of future results.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
