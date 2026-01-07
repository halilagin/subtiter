import React from 'react';
import { Box, Container } from '@mui/material';
import UsageHeader from './UsageHeader';
import UsageStats from './UsageStats';

const Usage = () => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: '#f5f5f5'
    }}>
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 8, flex: 1 }}>
        <Box sx={{ 
          maxWidth: '1000px', 
          mx: 'auto'
        }}>
          <UsageHeader />
          <UsageStats />
        </Box>
      </Container>
    </Box>
  );
};

export default Usage; 