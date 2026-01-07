import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const PricingHeader = () => {
  return (
    <Box sx={{ py: 4, bgcolor: '#f5f5f5' }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h1" sx={{ 
            fontWeight: '900', 
            mb: 1, 
            color: '#000000',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
            lineHeight: { xs: 1.1, md: 1.05 },
            letterSpacing: { xs: '-0.02em', md: '-0.03em' },
            fontFamily: "'Inter', sans-serif"
          }}>
            Simple, transparent pricing
          </Typography>
          <Typography variant="h2" sx={{ 
            fontWeight: '300', 
            mb: 2, 
            color: '#000000',
            fontSize: { xs: '1rem', md: '1.25rem' }
          }}>
            Choose the plan that fits your needs. No hidden fees, no surprises.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PricingHeader; 