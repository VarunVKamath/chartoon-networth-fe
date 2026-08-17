import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Paper, Typography, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Alert, LinearProgress, Switch, FormControlLabel, Slider, IconButton,
  Card, CardContent, Divider, Tooltip as MuiTooltip
} from '@mui/material';
import {
  AccessTime, Refresh, AddCircle, CheckCircle, Warning, HighlightOff, ShowChart
} from '@mui/icons-material';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { format } from 'date-fns';

export default function EarlyEdgeScanner({ api, apiBase, successMsg, errorMsg }) {
  // Watchlist & Stocks
  const [watchlist, setWatchlist] = useState([]);
  const [scannerResults, setScannerResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  // Controls
  const [simMode, setSimMode] = useState(true);
  const [simMinutes, setSimMinutes] = useState(20); // 20 mins since 9:15 = 9:35 AM
  const [interval, setInterval] = useState('1m'); // '1m' or '3m'
  const [filterMinScore, setFilterMinScore] = useState(false); // Only show >= 65
  
  // UI State
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState('');

  // Convert slider minutes (0 to 45) to time string "HH:MM"
  const getSimulatedTimeStr = (mins) => {
    const baseHour = 9;
    const baseMin = 15;
    let targetMin = baseMin + mins;
    let targetHour = baseHour;
    if (targetMin >= 60) {
      targetHour += 1;
      targetMin -= 60;
    }
    const hh = String(targetHour).padStart(2, '0');
    const mm = String(targetMin).padStart(2, '0');
    return `${hh}:${mm}:00`;
  };

  const getSimulatedTimeLabel = (mins) => {
    const timeStr = getSimulatedTimeStr(mins);
    return timeStr.substring(0, 5) + ' AM';
  };

  // Fetch Watchlist
  const fetchWatchlist = async () => {
    try {
      const res = await api.get('/early-edge/watchlist');
      if (res.data && res.data.watchlist) {
        setWatchlist(res.data.watchlist);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch watchlist');
    }
  };

  // Run Scanner
  const runScannerFetch = async () => {
    setLoading(true);
    setError('');
    try {
      const timeParam = simMode ? getSimulatedTimeStr(simMinutes) : '';
      const res = await api.get(`/early-edge/scanner`, {
        params: { simulatedTime: timeParam }
      });
      
      if (res.data && res.data.scannerResults) {
        const results = res.data.scannerResults;
        setScannerResults(results);
        setLastRefreshed(format(new Date(res.data.timestamp), 'HH:mm:ss'));
        
        // If a stock was selected, refresh its details from the list
        if (selectedStock) {
          const updatedSelected = results.find(r => r.symbol === selectedStock.symbol);
          if (updatedSelected) {
            setSelectedStock(updatedSelected);
          }
        } else if (results.length > 0) {
          setSelectedStock(results[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Scanner failed to retrieve calculations.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Chart Data
  const fetchChartData = async (symbol) => {
    if (!symbol) return;
    try {
      const timeParam = simMode ? getSimulatedTimeStr(simMinutes) : '';
      const res = await api.get('/early-edge/chart', {
        params: {
          symbol: symbol,
          simulatedTime: timeParam,
          interval: interval
        }
      });
      if (res.data && res.data.candles) {
        const candles = res.data.candles.map(c => ({
          ...c,
          timeLabel: format(new Date(c.date), 'HH:mm'),
          rawTime: new Date(c.date)
        }));
        setChartData(candles);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Initialize
  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Run scanner when watchlist, mode, time, or interval changes
  useEffect(() => {
    runScannerFetch();
  }, [watchlist, simMode, simMinutes]);

  // Fetch chart when selected stock, interval, mode, or time changes
  useEffect(() => {
    if (selectedStock) {
      fetchChartData(selectedStock.symbol);
    }
  }, [selectedStock, interval, simMode, simMinutes]);

  // Listen to WebSocket broadcasts
  useEffect(() => {
    // If Socket.io is connected in the host, it can push events.
    // We will hook into standard socket.io if initialized globally on window.
    if (window.socket) {
      window.socket.on('scanner_update', (results) => {
        if (!simMode) { // Only update live when not simulating
          setScannerResults(results);
          if (selectedStock) {
            const updatedSelected = results.find(r => r.symbol === selectedStock.symbol);
            if (updatedSelected) setSelectedStock(updatedSelected);
          }
          setLastRefreshed(format(new Date(), 'HH:mm:ss'));
        }
      });

      window.socket.on('opening_range_ready', (data) => {
        setSuccess(`Opening Range Locked for ${data.symbol}: High: ₹${data.range.high}, Low: ₹${data.range.low}`);
      });
    }

    return () => {
      if (window.socket) {
        window.socket.off('scanner_update');
        window.socket.off('opening_range_ready');
      }
    };
  }, [simMode, selectedStock]);

  // Watchlist Editing
  const handleAddStock = async () => {
    const symbol = newStockSymbol.trim().toUpperCase();
    if (!symbol) return;
    if (watchlist.includes(symbol)) {
      setError('Stock is already in watchlist');
      return;
    }
    const updated = [...watchlist, symbol];
    setLoading(true);
    try {
      const res = await api.post('/early-edge/watchlist', { watchlist: updated });
      if (res.data.success) {
        setWatchlist(res.data.watchlist);
        setNewStockSymbol('');
        setSuccess(`Added ${symbol} to Early Watchlist`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStock = async (symbolToRemove) => {
    const updated = watchlist.filter(s => s !== symbolToRemove);
    setLoading(true);
    try {
      const res = await api.post('/early-edge/watchlist', { watchlist: updated });
      if (res.data.success) {
        setWatchlist(res.data.watchlist);
        if (selectedStock?.symbol === symbolToRemove) {
          setSelectedStock(null);
          setChartData([]);
        }
        setSuccess(`Removed ${symbolToRemove} from Watchlist`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update watchlist');
    } finally {
      setLoading(false);
    }
  };

  // Score styling
  const getScoreColor = (score) => {
    if (score >= 70) return '#6BCB77'; // Green
    if (score >= 50) return '#FFD93D'; // Yellow
    return '#FF4D4D'; // Red
  };

  const getSignalChipColor = (signal) => {
    if (signal === 'Strong Continuation') return 'success';
    if (signal === 'Moderate') return 'warning';
    return 'error';
  };

  const filteredResults = filterMinScore
    ? scannerResults.filter(r => r.score >= 65)
    : scannerResults;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Simulation & Mode Config Control Banner */}
      <Paper
        sx={{
          p: 3,
          border: '3px solid #1E1E1E',
          borderRadius: '20px',
          boxShadow: '5px 5px 0px #1E1E1E',
          background: 'linear-gradient(135deg, #4D96FF 0%, #FFF8E7 100%)',
          color: '#1E1E1E'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="h5" fontFamily="Bangers" sx={{ letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime sx={{ color: '#1E1E1E' }} /> Time Machine Simulator
            </Typography>
            <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold" sx={{ mt: 0.5 }}>
              Test morning breakout momentum logic (9:15 - 10:00 AM IST) deterministic random candles.
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={simMode}
                    onChange={(e) => setSimMode(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#FF6B35' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#FF6B35' }
                    }}
                  />
                }
                label={
                  <Typography fontFamily="Fredoka" fontWeight="bold">
                    {simMode ? `Simulation Active: ${getSimulatedTimeLabel(simMinutes)}` : 'Live Time Mode (IST)'}
                  </Typography>
                }
              />
              {simMode && (
                <Box sx={{ flex: 1, width: '100%', px: 2 }}>
                  <Typography variant="caption" fontFamily="Fredoka" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
                    Adjust simulated time slider (9:15 AM to 10:00 AM):
                  </Typography>
                  <Slider
                    value={simMinutes}
                    min={0}
                    max={45}
                    step={1}
                    onChange={(e, val) => setSimMinutes(val)}
                    valueLabelFormat={getSimulatedTimeLabel}
                    valueLabelDisplay="auto"
                    sx={{
                      color: '#FF6B35',
                      height: 8,
                      '& .MuiSlider-thumb': {
                        width: 20,
                        height: 20,
                        backgroundColor: '#FFFFFF',
                        border: '3px solid #1E1E1E',
                        boxShadow: '1.5px 1.5px 0px #1E1E1E',
                        '&:hover, &.Mui-focusVisible': { boxShadow: '2px 2px 0px #1E1E1E' }
                      },
                      '& .MuiSlider-track': { border: 'none' },
                      '& .MuiSlider-rail': { opacity: 0.5, backgroundColor: '#bfbfbf' }
                    }}
                  />
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Message Notifications */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ border: '2.5px solid #1E1E1E', borderRadius: '12px', boxShadow: '3px 3px 0px #1E1E1E', fontFamily: 'Fredoka', fontWeight: 'bold' }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ border: '2.5px solid #1E1E1E', borderRadius: '12px', boxShadow: '3px 3px 0px #1E1E1E', fontFamily: 'Fredoka', fontWeight: 'bold' }}>
          {success}
        </Alert>
      )}

      {/* Main Layout Grid */}
      <Grid container spacing={3}>
        
        {/* Watchlist and Scanner Results (Left side) */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, border: '3px solid #1E1E1E', boxShadow: '5px 5px 0px #1E1E1E', height: '100%' }}>
            
            {/* Watchlist Setup */}
            <Typography variant="h5" fontFamily="Bangers" gutterBottom>
              Early Momentum Watchlist
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
              <TextField
                placeholder="E.g. RELIANCE"
                value={newStockSymbol}
                onChange={(e) => setNewStockSymbol(e.target.value.toUpperCase())}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleAddStock}
                disabled={loading || !newStockSymbol}
                startIcon={<AddCircle />}
                sx={{
                  backgroundColor: '#FFD93D',
                  color: '#1E1E1E',
                  border: '2.5px solid #1E1E1E',
                  boxShadow: '2px 2px 0px #1E1E1E',
                  fontWeight: 'bold',
                  fontFamily: 'Fredoka',
                  '&:hover': { backgroundColor: '#FF6B35', color: '#FFFFFF' }
                }}
              >
                Add
              </Button>
            </Box>

            <Divider sx={{ my: 2, borderBottomWidth: '2px', borderColor: '#1E1E1E' }} />

            {/* Scanner Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h5" fontFamily="Bangers">
                Active Scanner Results
              </Typography>
              <IconButton onClick={runScannerFetch} disabled={loading} size="small" sx={{ border: '2px solid #1E1E1E', borderRadius: '8px', bgcolor: '#FFF8E7', '&:hover': { bgcolor: '#FFD93D' } }}>
                <Refresh />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filterMinScore}
                    onChange={(e) => setFilterMinScore(e.target.checked)}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#FF6B35' }
                    }}
                  />
                }
                label={
                  <Typography fontFamily="Fredoka" fontWeight="bold" fontSize="0.85rem">
                    Show only high probability setup (Score &ge; 65)
                  </Typography>
                }
              />
            </Box>

            {/* Scanner Table */}
            {filteredResults.length > 0 ? (
              <TableContainer sx={{ border: '3.5px solid #1E1E1E', borderRadius: '16px', maxHeight: 420 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#FFF8E7' }}>
                    <TableRow>
                      <TableCell><b>Stock</b></TableCell>
                      <TableCell align="right"><b>Score</b></TableCell>
                      <TableCell align="right"><b>Signal</b></TableCell>
                      <TableCell align="center"><b>Action</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredResults.map((stock) => {
                      const isSelected = selectedStock?.symbol === stock.symbol;
                      return (
                        <TableRow
                          key={stock.symbol}
                          hover
                          onClick={() => setSelectedStock(stock)}
                          sx={{
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#FFF8E7 !important' : 'inherit',
                            '&:hover': { backgroundColor: '#F9F9F9' }
                          }}
                        >
                          <TableCell>
                            <Typography fontFamily="Fredoka" fontWeight="bold">
                              {stock.symbol}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={stock.score}
                              sx={{
                                fontWeight: 'bold',
                                backgroundColor: getScoreColor(stock.score),
                                color: '#1E1E1E',
                                border: '1.5px solid #1E1E1E'
                              }}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={stock.signal}
                              color={getSignalChipColor(stock.signal)}
                              size="small"
                              sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                            />
                          </TableCell>
                          <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="small"
                              color="error"
                              variant="text"
                              onClick={() => handleRemoveStock(stock.symbol)}
                              sx={{ fontFamily: 'Fredoka', fontWeight: 'bold', textTransform: 'none' }}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6, border: '2px dashed #1E1E1E', borderRadius: '16px', bgcolor: '#FAFAFA' }}>
                <Typography color="text.secondary" fontFamily="Fredoka" fontWeight="bold">
                  No stocks match the filter criteria.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Add more tickers or decrease filters.
                </Typography>
              </Box>
            )}

            <Typography variant="caption" fontFamily="Fredoka" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'right' }}>
              Last Calculated: {lastRefreshed || 'N/A'}
            </Typography>
          </Paper>
        </Grid>

        {/* Detailed Breakdown & Recharts Visual Chart (Right side) */}
        <Grid item xs={12} lg={7}>
          {selectedStock ? (
            <Paper sx={{ p: 3, border: '3px solid #1E1E1E', boxShadow: '5px 5px 0px #1E1E1E', display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Score card & Target/Stop Loss info */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h4" fontFamily="Bangers" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {selectedStock.symbol} Intraday Analytics
                  </Typography>
                  <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold" color="text.secondary">
                    LTP: ₹{selectedStock.price?.toFixed(2)} • OR High: ₹{selectedStock.openingRange?.high || '-'} • OR Low: ₹{selectedStock.openingRange?.low || '-'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Chip
                    label={`Score: ${selectedStock.score}`}
                    sx={{
                      fontFamily: 'Fredoka',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      backgroundColor: getScoreColor(selectedStock.score),
                      color: '#1E1E1E',
                      height: 38,
                      border: '2px solid #1E1E1E',
                      px: 1
                    }}
                  />
                  <Chip
                    label={selectedStock.signal}
                    color={getSignalChipColor(selectedStock.signal)}
                    sx={{ fontFamily: 'Fredoka', fontWeight: 'bold', fontSize: '0.9rem', height: 38, border: '2.5px solid #1E1E1E' }}
                  />
                </Box>
              </Box>

              {/* Progress visualizer */}
              <Box sx={{ width: '100%' }}>
                <LinearProgress
                  variant="determinate"
                  value={selectedStock.score}
                  sx={{
                    height: 14,
                    borderRadius: 7,
                    border: '2px solid #1E1E1E',
                    backgroundColor: '#EBEBEB',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(selectedStock.score),
                      borderRadius: 5
                    }
                  }}
                />
              </Box>

              {/* Suggested Targets */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ border: '2px solid #1E1E1E', bgcolor: '#E2F0D9' }}>
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="caption" fontFamily="Fredoka" color="success.main" fontWeight="bold" display="block">
                        🎯 SUGGESTED TARGET PRICE
                      </Typography>
                      <Typography variant="h5" fontFamily="Bangers" color="success.main" sx={{ mt: 0.5 }}>
                        ₹{selectedStock.target?.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ border: '2px solid #1E1E1E', bgcolor: '#FCE4D6' }}>
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="caption" fontFamily="Fredoka" color="error.main" fontWeight="bold" display="block">
                        🛡️ SUGGESTED STOP LOSS
                      </Typography>
                      <Typography variant="h5" fontFamily="Bangers" color="error.main" sx={{ mt: 0.5 }}>
                        ₹{selectedStock.stopLoss?.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Checklist details */}
              <Box sx={{ border: '2.5px solid #1E1E1E', borderRadius: '16px', p: 2, bgcolor: '#FFFFFF' }}>
                <Typography variant="h6" fontFamily="Bangers" gutterBottom>
                  Momentum Scoring Factors (Detailed Weight)
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      
                      {/* Factor 1 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedStock.factors?.breakout?.score > 0 ? (
                          <CheckCircle sx={{ color: '#6BCB77' }} />
                        ) : (
                          <HighlightOff sx={{ color: '#FF4D4D' }} />
                        )}
                        <Box>
                          <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold">
                            Opening Range Breakout (30%): +{selectedStock.factors?.breakout?.score} pts
                          </Typography>
                          <Typography variant="caption" fontFamily="Fredoka" color="text.secondary">
                            Status: {selectedStock.factors?.breakout?.status}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Factor 2 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedStock.factors?.volume?.score > 0 ? (
                          <CheckCircle sx={{ color: '#6BCB77' }} />
                        ) : (
                          <HighlightOff sx={{ color: '#FF4D4D' }} />
                        )}
                        <Box>
                          <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold">
                            Volume Surge (20%): +{selectedStock.factors?.volume?.score} pts
                          </Typography>
                          <Typography variant="caption" fontFamily="Fredoka" color="text.secondary">
                            Status: {selectedStock.factors?.volume?.status}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Factor 3 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedStock.factors?.vwap?.score > 0 ? (
                          <CheckCircle sx={{ color: '#6BCB77' }} />
                        ) : (
                          <HighlightOff sx={{ color: '#FF4D4D' }} />
                        )}
                        <Box>
                          <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold">
                            Price vs VWAP (15%): +{selectedStock.factors?.vwap?.score} pts
                          </Typography>
                          <Typography variant="caption" fontFamily="Fredoka" color="text.secondary">
                            Status: {selectedStock.factors?.vwap?.status}
                          </Typography>
                        </Box>
                      </Box>

                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      
                      {/* Factor 4 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedStock.factors?.relativeStrength?.score > 0 ? (
                          <CheckCircle sx={{ color: '#6BCB77' }} />
                        ) : (
                          <HighlightOff sx={{ color: '#FF4D4D' }} />
                        )}
                        <Box>
                          <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold">
                            Nifty Relative Strength (20%): +{selectedStock.factors?.relativeStrength?.score} pts
                          </Typography>
                          <Typography variant="caption" fontFamily="Fredoka" color="text.secondary">
                            Status: {selectedStock.factors?.relativeStrength?.status}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Factor 5 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedStock.factors?.candleStrength?.score > 0 ? (
                          <CheckCircle sx={{ color: '#6BCB77' }} />
                        ) : (
                          <HighlightOff sx={{ color: '#FF4D4D' }} />
                        )}
                        <Box>
                          <Typography variant="body2" fontFamily="Fredoka" fontWeight="bold">
                            Candle Strength (15%): +{selectedStock.factors?.candleStrength?.score} pts
                          </Typography>
                          <Typography variant="caption" fontFamily="Fredoka" color="text.secondary">
                            Status: {selectedStock.factors?.candleStrength?.status}
                          </Typography>
                        </Box>
                      </Box>

                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Chart section */}
              <Box sx={{ border: '3.5px solid #1E1E1E', borderRadius: '20px', p: 2, bgcolor: '#FFFFFF', boxShadow: '2px 2px 0px #1E1E1E' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" fontFamily="Bangers">
                    {selectedStock.symbol} Price & VWAP Overlay
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant={interval === '1m' ? 'contained' : 'outlined'}
                      onClick={() => setInterval('1m')}
                      sx={{ fontFamily: 'Fredoka', fontWeight: 'bold', minWidth: 42 }}
                    >
                      1m
                    </Button>
                    <Button
                      size="small"
                      variant={interval === '3m' ? 'contained' : 'outlined'}
                      onClick={() => setInterval('3m')}
                      sx={{ fontFamily: 'Fredoka', fontWeight: 'bold', minWidth: 42 }}
                    >
                      3m
                    </Button>
                  </Box>
                </Box>

                {chartData.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Recharts Price & VWAP area */}
                    <Box sx={{ height: 280, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                          <XAxis dataKey="timeLabel" tick={{ fill: '#1E1E1E', fontWeight: 'bold', fontSize: 10 }} />
                          <YAxis domain={['auto', 'auto']} tick={{ fill: '#1E1E1E', fontWeight: 'bold', fontSize: 10 }} />
                          
                          <ChartTooltip
                            contentStyle={{
                              backgroundColor: '#FFFFFF',
                              border: '3.5px solid #1E1E1E',
                              borderRadius: '12px',
                              boxShadow: '3px 3px 0px #1E1E1E',
                              fontFamily: 'Fredoka',
                              fontWeight: 'bold'
                            }}
                          />
                          
                          {/* Reference lines for OR High and Low */}
                          {selectedStock.openingRange?.high && (
                            <ReferenceLine
                              y={selectedStock.openingRange.high}
                              stroke="#6BCB77"
                              strokeWidth={2}
                              strokeDasharray="4 4"
                              label={{
                                value: `OR High (₹${selectedStock.openingRange.high})`,
                                fill: '#6BCB77',
                                fontSize: 9,
                                fontWeight: 'bold',
                                position: 'top'
                              }}
                            />
                          )}
                          {selectedStock.openingRange?.low && (
                            <ReferenceLine
                              y={selectedStock.openingRange.low}
                              stroke="#FF4D4D"
                              strokeWidth={2}
                              strokeDasharray="4 4"
                              label={{
                                value: `OR Low (₹${selectedStock.openingRange.low})`,
                                fill: '#FF4D4D',
                                fontSize: 9,
                                fontWeight: 'bold',
                                position: 'bottom'
                              }}
                            />
                          )}

                          {/* Vertical lines at 9:30 and 9:45 */}
                          <ReferenceLine
                            x={chartData.find(c => {
                              const hrs = c.rawTime.getHours();
                              const mns = c.rawTime.getMinutes();
                              return hrs === 9 && mns === 30;
                            })?.timeLabel}
                            stroke="#1E1E1E"
                            strokeWidth={2.5}
                            strokeDasharray="2 2"
                            label={{
                              value: '9:30 AM',
                              fill: '#1E1E1E',
                              fontSize: 9,
                              fontWeight: 'bold',
                              position: 'insideTopLeft'
                            }}
                          />
                          
                          <ReferenceLine
                            x={chartData.find(c => {
                              const hrs = c.rawTime.getHours();
                              const mns = c.rawTime.getMinutes();
                              return hrs === 9 && mns === 45;
                            })?.timeLabel}
                            stroke="#1E1E1E"
                            strokeWidth={2.5}
                            strokeDasharray="2 2"
                            label={{
                              value: '9:45 AM',
                              fill: '#1E1E1E',
                              fontSize: 9,
                              fontWeight: 'bold',
                              position: 'insideTopLeft'
                            }}
                          />

                          {/* Price Area Chart */}
                          <Line
                            type="monotone"
                            dataKey="close"
                            name="Price"
                            stroke="#FF6B35"
                            strokeWidth={3}
                            dot={false}
                          />

                          {/* VWAP Line Overlay */}
                          <Line
                            type="monotone"
                            dataKey="vwap"
                            name="VWAP"
                            stroke="#4D96FF"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Recharts Volume Chart */}
                    <Box sx={{ height: 100, width: '100%', borderTop: '2px dashed #1E1E1E', pt: 1.5 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 0, right: 10, left: 10, bottom: 5 }}>
                          <XAxis dataKey="timeLabel" tick={{ fill: '#1E1E1E', fontWeight: 'bold', fontSize: 10 }} />
                          <YAxis tick={{ fill: '#1E1E1E', fontWeight: 'bold', fontSize: 10 }} />
                          <ChartTooltip
                            contentStyle={{
                              backgroundColor: '#FFFFFF',
                              border: '2px solid #1E1E1E',
                              borderRadius: '8px',
                              fontFamily: 'Fredoka',
                              fontWeight: 'bold'
                            }}
                          />
                          <Bar
                            dataKey="volume"
                            name="Volume"
                            fill="#FFD93D"
                            stroke="#1E1E1E"
                            strokeWidth={1.5}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary" fontFamily="Fredoka" fontWeight="bold">
                      No candle data loaded for this time.
                    </Typography>
                  </Box>
                )}
              </Box>

            </Paper>
          ) : (
            <Paper sx={{ p: 4, border: '3px solid #1E1E1E', boxShadow: '5px 5px 0px #1E1E1E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
              <ShowChart sx={{ fontSize: 72, color: '#CCCCCC' }} />
              <Typography variant="h5" fontFamily="Bangers" color="text.secondary" sx={{ mt: 2 }}>
                No Ticker Selected
              </Typography>
              <Typography color="text.secondary" fontFamily="Fredoka" fontWeight="bold">
                Select a stock from the scanner table to inspect scores, levels, and overlays.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
