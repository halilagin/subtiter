import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress
} from '@mui/material';
import { 
  VideoLibrary,
  Storage,
  Speed,
  TrendingUp
} from '@mui/icons-material';

const UsageStats = () => {
  const stats = [
    {
      icon: <VideoLibrary sx={{ fontSize: 32, color: '#e2f4a6' }} />,
      title: 'Videos Processed',
      value: '47',
      total: '100',
      percentage: 47,
      color: '#e2f4a6'
    },
    {
      icon: <Storage sx={{ fontSize: 32, color: '#eea0ff' }} />,
      title: 'Storage Used',
      value: '2.3 GB',
      total: '10 GB',
      percentage: 23,
      color: '#eea0ff'
    },
    {
      icon: <Speed sx={{ fontSize: 32, color: '#5a4eff' }} />,
      title: 'Processing Time',
      value: '12.5 hrs',
      total: '50 hrs',
      percentage: 25,
      color: '#5a4eff'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 32, color: '#e2f4a6' }} />,
      title: 'Success Rate',
      value: '94%',
      total: '100%',
      percentage: 94,
      color: '#e2f4a6'
    }
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper sx={{ 
            borderRadius: 16, 
            overflow: 'hidden',
            boxShadow: 'none',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            bgcolor: 'white',
            p: 3,
            height: '100%'
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 2 }}>
                {stat.icon}
              </Box>
              
              <Typography variant="h6" sx={{ 
                fontWeight: '600', 
                color: '#2f2e2c',
                mb: 1,
                fontSize: '1rem',
                fontFamily: "'Inter', sans-serif"
              }}>
                {stat.title}
              </Typography>
              
              <Typography variant="h4" sx={{ 
                fontWeight: '700', 
                color: '#2f2e2c',
                mb: 1,
                fontSize: '1.5rem',
                fontFamily: "'Inter', sans-serif"
              }}>
                {stat.value}
              </Typography>
              
              <Typography variant="body2" sx={{ 
                color: '#6b7280',
                mb: 2,
                fontFamily: "'Inter', sans-serif"
              }}>
                of {stat.total}
              </Typography>
              
              <LinearProgress
                variant="determinate"
                value={stat.percentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#f3f4f6',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: stat.color,
                    borderRadius: 4
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default UsageStats; 