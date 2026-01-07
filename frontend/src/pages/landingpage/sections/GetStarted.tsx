import React, { useState } from 'react';
import { Box, Container, Typography, Button, TextField } from '@mui/material';
import { InsertLink, Bolt } from '@mui/icons-material';

const GetStarted = () => {
  const [videoLink, setVideoLink] = useState('');

  const handleGetFreeClips = () => {
    // Navigate to create account or dashboard
    window.location.href = '/create-account';
  };

  return (
    <Box id="get-started-section" sx={{ 
      py: 16,
      pb: 12,
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        {/* Title */}
        <Typography variant="h2" sx={{
          fontWeight: '700',
          color: '#000000',
          mb: 4,
          fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
          lineHeight: 1.1,
          fontFamily: "'Kelson Sans', 'Inter', sans-serif"
        }}>
          Start cutting like a pro.
        </Typography>

        {/* Input Bar - Glassmorphism */}
        <Box sx={{ 
          maxWidth: '500px', 
          mx: 'auto',
          mb: 4,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1))',
          borderRadius: 24,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            border: '1px solid rgba(255, 255, 255, 0.4)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.15))',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          }
        }}>
          <InsertLink sx={{ fontSize: 18, color: '#000000', ml: 1 }} />
          <TextField
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            placeholder="Drop a video link"
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                color: '#000000',
                fontFamily: "'Kelson', 'Inter', sans-serif",
                fontWeight: 300,
                fontSize: '1rem',
                '&::placeholder': {
                  color: '#000000',
                  opacity: 0.8
                }
              }
            }}
            sx={{
              flex: 1,
              '& .MuiInputBase-root': {
                padding: 0
              }
            }}
          />
          <Button 
            variant="contained"
            startIcon={<Bolt sx={{ fontSize: 10, color: '#dafe52' }} />}
            onClick={handleGetFreeClips}
            className="button-hover-effect"
            sx={{ 
              borderRadius: 12,
              px: 3,
              py: 1,
              bgcolor: '#000000',
              color: 'white',
              fontWeight: '700',
              fontSize: '0.9rem',
              fontFamily: "'Inter', sans-serif",
              textTransform: 'none',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#000000',
                boxShadow: 'none',
              },
              '&:focus': {
                bgcolor: '#000000',
                outline: 'none !important',
                boxShadow: 'none !important',
              },
              '&:focus-visible': {
                outline: 'none !important',
                boxShadow: 'none !important',
              },
              '&.Mui-focusVisible': {
                outline: 'none !important',
                boxShadow: 'none !important',
              },
              '&:focus-visible .MuiButton-focusVisible': {
                outline: 'none !important',
                boxShadow: 'none !important',
              }
            }}
          >
            Go Viral
          </Button>
        </Box>

        {/* Subtitle */}
        <Typography variant="body1" sx={{
          color: '#666666',
          fontSize: '1.1rem',
          fontWeight: '400',
          maxWidth: '500px',
          mx: 'auto',
          lineHeight: 1.4,
          mb: 4
        }}>
          Join Klippers today and turn every video into a hit.
        </Typography>
      </Container>
    </Box>
  );
};

export default GetStarted;
