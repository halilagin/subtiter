import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
} from '@mui/material';
import subtiterLogoGif from '../../../public/logogif.gif';

interface WelcomeScreenProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const WelcomeScreen = ({ onLogin, onSignUp }: WelcomeScreenProps) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: '#000000',
        px: 3,
        py: 4,
      }}
    >
      {/* Title - Top */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          pt: 2,
          color: '#ffffff',
          fontFamily: "'Kelson Sans', 'Inter', sans-serif",
          fontSize: { xs: '2rem', sm: '2.5rem' },
          textAlign: 'center',
        }}
      >
        Subtiter
      </Typography>

      <Container 
        maxWidth="sm" 
        sx={{ 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            component="img"
            src={subtiterLogoGif}
            alt="Subtiter Logo"
            sx={{
              width: { xs: '80px', sm: '100px' },
              height: 'auto',
            }}
          />
        </Box>

        {/* Subtitle */}
        <Typography
          variant="h6"
          sx={{
            mb: 6,
            color: '#cccccc',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            lineHeight: 1.6,
          }}
        >
          Your AI-powered video assistant
        </Typography>
      </Container>

      {/* Buttons - Fixed at bottom */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={onSignUp}
          sx={{
            py: 1.25,
            px: 4,
            fontSize: '0.875rem',
            fontWeight: 600,
            bgcolor: '#ffffff',
            color: '#000000',
            borderRadius: 6,
            textTransform: 'none',
            fontFamily: "'Inter', sans-serif",
            minWidth: '200px',
            '&:hover': {
              bgcolor: '#e5e5e5',
            },
          }}
        >
          Sign Up
        </Button>

        <Button
          variant="outlined"
          onClick={onLogin}
          sx={{
            py: 1.25,
            px: 4,
            fontSize: '0.875rem',
            fontWeight: 600,
            borderColor: '#ffffff',
            color: '#ffffff',
            borderRadius: 6,
            textTransform: 'none',
            fontFamily: "'Inter', sans-serif",
            minWidth: '200px',
            '&:hover': {
              borderColor: '#cccccc',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Login
        </Button>
      </Box>
    </Box>
  );
};

export default WelcomeScreen;

