import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid
} from '@mui/material';
import { 
  Security,
  Notifications,
  Language,
  Download
} from '@mui/icons-material';

const QuickActions = () => {
  const actions = [
    {
      icon: <Security sx={{ fontSize: 24, color: '#e2f4a6' }} />,
      title: 'Security Settings',
      description: 'Manage your password and 2FA',
      action: 'Configure'
    },
    {
      icon: <Notifications sx={{ fontSize: 24, color: '#e2f4a6' }} />,
      title: 'Notification Preferences',
      description: 'Control email and push notifications',
      action: 'Manage'
    },
    {
      icon: <Language sx={{ fontSize: 24, color: '#e2f4a6' }} />,
      title: 'Language & Region',
      description: 'Set your preferred language',
      action: 'Change'
    },
    {
      icon: <Download sx={{ fontSize: 24, color: '#e2f4a6' }} />,
      title: 'Export Data',
      description: 'Download your account data',
      action: 'Export'
    }
  ];

  return (
    <Paper sx={{ 
      borderRadius: 16, 
      overflow: 'hidden',
      boxShadow: 'none',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      bgcolor: 'white'
    }}>
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: '600', 
          color: '#2f2e2c',
          mb: 3,
          fontFamily: "'Inter', sans-serif"
        }}>
          Quick Actions
        </Typography>

        <Grid container spacing={3}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ 
                p: 3, 
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: 12,
                bgcolor: '#f8f9fa',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Box sx={{ mb: 2 }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: '600', 
                    color: '#2f2e2c',
                    mb: 1,
                    fontSize: '1rem',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#6b7280',
                    mb: 2,
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {action.description}
                  </Typography>
                </Box>
                
                <Button
                  variant="outlined"
                  onClick={() => console.log(`${action.title} clicked`)}
                  sx={{ 
                    borderRadius: 12,
                    px: 2,
                    py: 1,
                    borderColor: '#e2f4a6',
                    color: '#2f2e2c',
                    fontWeight: '600',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#e2f4a6',
                      borderColor: '#e2f4a6',
                      boxShadow: 'none',
                    }
                  }}
                >
                  {action.action}
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

export default QuickActions; 