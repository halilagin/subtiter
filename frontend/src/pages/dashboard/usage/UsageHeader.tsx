import React from 'react';
import { Box, Typography } from '@mui/material';

const UsageHeader = () => {
  return (
    <Box sx={{ mb: 6 }}>
      {/* Page Title */}
      <Typography variant="body1" sx={{ 
        fontWeight: '300', 
        color: '#808080',
        mb: 3,
        textAlign: 'left',
        fontSize: '0.875rem',
        letterSpacing: '0.05em'
      }}>
        Usage
      </Typography>
      
      {/* Main Title */}
      <Typography variant="h4" sx={{ 
        fontWeight: '700', 
        color: '#2f2e2c',
        textAlign: 'left',
        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
        lineHeight: { xs: 1.1, md: 1.05 },
        letterSpacing: { xs: '-0.02em', md: '-0.03em' },
        fontFamily: "'Inter', sans-serif"
      }}>
        Usage Analytics
      </Typography>
    </Box>
  );
};

export default UsageHeader; 