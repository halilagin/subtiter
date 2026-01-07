import React from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  CssBaseline,
  GlobalStyles,
  AppBar,
  Toolbar
} from '@mui/material';

import { Link as RouterLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    IconButton, 
    InputAdornment, 
    CircularProgress // For loading state
} from '@mui/material';
import AppConfig from '@/AppConfig';
import LoginComponent from '@/components/LoginComponent';
import NavBar from '@/components/NavBarOuter';


const LoginAppBar = () => {
  return (
    <>
    <AppBar 
        position="sticky" 
        sx={{ 
          bgcolor: 'rgba(245, 245, 245, 0.95)', 
          backdropFilter: 'blur(8px)', 
          boxShadow: 'none', 
          py: 0.4
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Box 
                component={RouterLink}
                to="/"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
              >
              
                <Typography variant="h6" sx={{ 
                  fontWeight: '800', 
                  color: '#000000',
                  outline: 'none',
                  '&:focus': {
                    outline: 'none',
                    boxShadow: 'none'
                  }
                }}>
                  Subtiter
                </Typography>
              </Box>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
                <Button 
                  component={RouterLink}
                  to="/pricing"
                  variant="text" 
                  className="button-hover-effect"
                  sx={{ 
                    borderRadius: 12,
                    px: 2.5,
                    py: 0.8,
                    fontSize: '0.875rem',
                    color: '#000000',
                    transition: 'all 0.3s ease',
                    textTransform: 'capitalize',
                    fontWeight: '600',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: 'rgba(90, 78, 255, 0.1)',
                      boxShadow: 'none',
                    },
                    '&:focus': {
                      bgcolor: 'rgba(90, 78, 255, 0.2)',
                      outline: '2px solid #5a4eff',
                      outlineOffset: '2px',
                      boxShadow: 'none',
                    }
                  }}
                >
                  Pricing
                </Button>
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

    </>
  );
};





const LoginPage = () => {
  // Fix background color for this page
  useEffect(() => {
    const originalBodyStyle = {
      backgroundColor: document.body.style.backgroundColor,
      margin: document.body.style.margin,
      padding: document.body.style.padding
    };

    document.body.style.backgroundColor = '#f5f5f5';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.backgroundColor = '#f5f5f5';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';

    return () => {
      document.body.style.backgroundColor = originalBodyStyle.backgroundColor;
      document.body.style.margin = originalBodyStyle.margin;
      document.body.style.padding = originalBodyStyle.padding;
      document.documentElement.style.backgroundColor = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
    };
  }, []);

  return (
    <>
      <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: '#f5f5f5',
      color: '#000000'
    }}>
      <CssBaseline />
      <GlobalStyles styles={{
        body: {
          fontFamily: "'Inter', sans-serif"
        }
      }} />

      
      <Container component="main" maxWidth="xs" sx={{ mt: 8, mb: 4, px: { xs: 3, md: 0 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" sx={{ 
            fontWeight: '800', 
            mb: 4, 
            color: '#000000',
            textAlign: 'center'
          }}>
            ✦
          </Typography>
          <Typography variant="h4" sx={{ 
            fontWeight: '800', 
            mb: 4, 
            color: '#000000',
            textAlign: 'center'
          }}>
            Welcome back!
          </Typography>
          <LoginComponent />

          </Box>
      </Container>
    </Box>
    </>
  );
};

export default LoginPage;
