import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';

const AIReframe2 = () => {
  return (
    <Box sx={{ 
      bgcolor: '#1a1a1a', 
      py: 10, 
      color: 'white',
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h1" sx={{ 
            fontWeight: '900', 
            mb: 2, 
            color: 'white',
            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem', lg: '4rem' },
            lineHeight: { xs: 1.1, md: 1.05 },
            letterSpacing: { xs: '-0.02em', md: '-0.03em' },
            fontFamily: "'Inter', sans-serif"
          }}>
            Introducing{' '} new AI Reframe
         
          </Typography>
          
          <Typography variant="h2" sx={{ 
            fontWeight: '300', 
            mb: 4, 
            color: '#9ca3af',
            fontSize: { xs: '1rem', md: '1.25rem' },
            maxWidth: '800px',
            mx: 'auto',
            lineHeight: 1.6
          }}>
            Resize your videos for any platform with our most advanced AI yet. It analyzes your
            scenes and applies the perfect layout Split Screen, Screencasts, Gaming, and more
            turning long videos into pro-quality clips in just one click.
          </Typography>
        </Box>

        {/* Before/After Video Containers */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1e40af, #3b82f6, #06b6d4, #8b5cf6)',
          borderRadius: 4, 
          p: 6,
          maxWidth: '2000px',
          mx: 'auto',
          width: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Grid container spacing={6} alignItems="center" justifyContent="center">
            {/* Before Video */}
            <Grid item xs={12} md={5}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: '#000',
                  border: '3px solid white',
                  aspectRatio: '16/9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                  {/* Placeholder for video */}
                  <Typography sx={{ 
                    color: '#6b7280', 
                    fontSize: '1rem',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Before Video Preview
                  </Typography>
                </Box>
                <Box sx={{
                  bgcolor: 'white',
                  color: '#000000',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  display: 'inline-block',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  Before
                </Box>
              </Box>
            </Grid>

            {/* After Video */}
            <Grid item xs={12} md={5}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: '#000',
                  border: '3px solid white',
                  aspectRatio: '9/16',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  mx: 'auto',
                  maxWidth: '300px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                  {/* Placeholder for video */}
                  <Typography sx={{ 
                    color: '#6b7280', 
                    fontSize: '1rem',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    After Video Preview
                  </Typography>
                </Box>
                <Box sx={{
                  bgcolor: 'white',
                  color: '#000000',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  display: 'inline-block',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  After
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AIReframe2;
