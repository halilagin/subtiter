import React from 'react';
import { Box, Typography } from '@mui/material';

export const NavBar: React.FC = () => {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Lobster&display=swap"
        rel="stylesheet"
      />
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          bgcolor: '#001111',
          borderBottom: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Lobster', cursive",
            fontSize: '1.75rem',
            fontWeight: 400,
            color: '#ffffff',
            letterSpacing: '0.02em',
          }}
        >
          Subtiter
        </Typography>
      </Box>
    </>
  );
};

