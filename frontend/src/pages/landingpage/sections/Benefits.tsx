import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import { 
  FlashOn, 
  Movie, 
  AutoAwesome, 
  Cloud, 
  SmartToy, 
  PlayArrow, 
  Share, 
  Star 
} from '@mui/icons-material';

const Benefits = () => {
  const benefits = [
    {
      icon: <FlashOn sx={{ fontSize: 40, color: '#9ca3af' }} />,
      title: "Fast results"
    },
    {
      icon: <Movie sx={{ fontSize: 40, color: '#9ca3af' }} />,
      title: "Cinematic cuts"
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 40, color: '#9ca3af' }} />,
      title: "Minimal effort"
    },
    {
      icon: <Cloud sx={{ fontSize: 40, color: '#9ca3af' }} />,
      title: "Cloud-based"
    },
    {
      icon: <SmartToy sx={{ fontSize: 40, color: '#9ca3af' }} />,
      title: "Smart AI"
    },
    {
      icon: <PlayArrow sx={{ fontSize: 40, color: '#9ca3af' }} />,
      title: "Instant preview"
    },
    {
      icon: <Share sx={{ fontSize: 40, color: '#9ca3af' }} />,
      title: "Easy sharing"
    },
    {
      icon: <Star sx={{ fontSize: 40, color: '#9ca3af' }} />,
      title: "Viral ready"
    }
  ];

  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5', 
      py: 16
    }}>
      <Container maxWidth="xl">
        {/* Benefits Grid - 1x8 Layout */}
        <Grid container spacing={6} justifyContent="center">
          {benefits.map((benefit, index) => (
            <Grid item xs={6} sm={4} md={3} lg={1.5} key={index}>
              <Box sx={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}>
                {/* Icon */}
                <Box>
                  {benefit.icon}
                </Box>

                {/* Title */}
                <Typography variant="body1" sx={{
                  fontWeight: '400',
                  color: '#000000',
                  fontSize: '1rem',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {benefit.title}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Benefits;
