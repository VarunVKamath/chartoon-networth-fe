import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const cartoonTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF6B35', // blast-off orange
      contrastText: '#1E1E1E',
    },
    secondary: {
      main: '#FFD93D', // lightning yellow
      contrastText: '#1E1E1E',
    },
    success: {
      main: '#6BCB77', // green lantern
      contrastText: '#1E1E1E',
    },
    error: {
      main: '#FF4D4D', // cherry bomb red
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#4D96FF', // action blue
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FFD93D',
      contrastText: '#1E1E1E',
    },
    background: {
      default: '#FFF8E7', // creamy nostalgia paper
      paper: '#FFFFFF', // solid white card panels
    },
    text: {
      primary: '#1E1E1E',
      secondary: '#4A4A4A',
    },
  },
  typography: {
    fontFamily: '"Fredoka", "Comic Neue", "Inter", sans-serif',
    h1: { fontFamily: 'Bangers, sans-serif', letterSpacing: '2px', color: '#1E1E1E' },
    h2: { fontFamily: 'Bangers, sans-serif', letterSpacing: '1.5px', color: '#1E1E1E' },
    h3: { fontFamily: 'Bangers, sans-serif', letterSpacing: '1.5px', color: '#1E1E1E' },
    h4: { fontFamily: 'Bangers, sans-serif', letterSpacing: '1px', color: '#1E1E1E' },
    h5: { fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: '#1E1E1E' },
    h6: { fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: '#1E1E1E' },
    body1: { fontFamily: 'Fredoka, sans-serif', color: '#1E1E1E' },
    body2: { fontFamily: 'Fredoka, sans-serif', color: '#4A4A4A' },
    button: { fontFamily: 'Fredoka, sans-serif', fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FFF8E7',
          color: '#1E1E1E',
          backgroundImage: 'radial-gradient(#e6ddc5 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          fontFamily: '"Fredoka", sans-serif',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          border: '3px solid #1E1E1E',
          boxShadow: '4px 4px 0px 0px #1E1E1E',
          borderRadius: '16px',
          color: '#1E1E1E',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          border: '3px solid #1E1E1E',
          boxShadow: '5px 5px 0px 0px #1E1E1E',
          borderRadius: '16px',
          color: '#1E1E1E',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          border: '3px solid #1E1E1E',
          boxShadow: '3px 3px 0px 0px #1E1E1E',
          borderRadius: '12px',
          fontWeight: 700,
          textTransform: 'none',
          color: '#1E1E1E',
          backgroundColor: '#FFFFFF',
          transition: 'transform 0.1s, box-shadow 0.1s',
          '&:hover': {
            backgroundColor: '#FFD93D',
            transform: 'translate(-2px, -2px)',
            boxShadow: '5px 5px 0px 0px #1E1E1E',
          },
          '&:active': {
            transform: 'translate(1px, 1px)',
            boxShadow: '2px 2px 0px 0px #1E1E1E',
          },
          '&.Mui-disabled': {
            opacity: 0.6,
            border: '3px solid #7F7F7F',
            boxShadow: '2px 2px 0px 0px #7F7F7F',
            color: '#7F7F7F',
          },
        },
        containedPrimary: {
          backgroundColor: '#FF6B35',
          '&:hover': {
            backgroundColor: '#E85B28',
          },
        },
        containedSecondary: {
          backgroundColor: '#FFD93D',
          '&:hover': {
            backgroundColor: '#E8C52E',
          },
        },
        outlined: {
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          border: '2px solid #1E1E1E',
          boxShadow: '2px 2px 0px 0px #1E1E1E',
          borderRadius: '8px',
          fontWeight: 700,
          backgroundColor: '#FFFFFF',
          color: '#1E1E1E',
        },
        colorSuccess: {
          backgroundColor: '#6BCB77',
        },
        colorError: {
          backgroundColor: '#FF4D4D',
          color: '#FFFFFF',
        },
        colorWarning: {
          backgroundColor: '#FFD93D',
        },
        colorInfo: {
          backgroundColor: '#4D96FF',
          color: '#FFFFFF',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: '4px solid #1E1E1E',
          boxShadow: '8px 8px 0px 0px #1E1E1E',
          borderRadius: '24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            border: '2.5px solid #1E1E1E',
            backgroundColor: '#FFFFFF',
            boxShadow: '2px 2px 0px 0px #1E1E1E',
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#1E1E1E',
            fontWeight: 700,
            transform: 'translate(14px, 10px) scale(1)',
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -10px) scale(0.75)',
              backgroundColor: '#FFF8E7',
              padding: '0 6px',
              borderRadius: '4px',
              border: '1.5px solid #1E1E1E',
              fontWeight: 800,
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '2.5px solid #1E1E1E',
          fontWeight: 500,
          padding: '12px 16px',
          color: '#1E1E1E',
        },
        head: {
          fontWeight: 800,
          backgroundColor: '#FFD93D',
          color: '#1E1E1E',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          borderBottom: '3.5px solid #1E1E1E',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={cartoonTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
