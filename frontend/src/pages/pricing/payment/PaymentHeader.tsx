import React from 'react';
import { Box, Container, Typography, Chip } from '@mui/material';

interface PaymentHeaderProps {
  planDetails: any;
}

const PaymentHeader = ({ planDetails }: PaymentHeaderProps) => {
  return (
    <Box sx={{ py: 2, bgcolor: '#f5f5f5' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h1" sx={{ 
            fontWeight: '900', 
            mb: 1, 
            color: '#000000',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
            lineHeight: { xs: 1.1, md: 1.05 },
            letterSpacing: { xs: '-0.02em', md: '-0.03em' },
            fontFamily: "'Inter', sans-serif",
            whiteSpace: 'nowrap',
            textAlign: 'center'
          }}>
            Complete Your Subscription
          </Typography>
          <Typography variant="h2" sx={{ 
            fontWeight: '300', 
            mb: 2, 
            color: '#000000',
            fontSize: { xs: '1rem', md: '1.25rem' }
          }}>
            Secure payment for your selected plan
          </Typography>
          
          {/* Selected Plan Display */}
          {planDetails && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 2, 
              gap: 2
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: '600',
                bgcolor: '#000000',
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 12,
                fontSize: '0.9rem'
              }}>
                {planDetails.name}
              </Typography>
              <Typography variant="h5" sx={{ 
                color: '#5a4eff', 
                fontWeight: '800',
                fontSize: '1.2rem'
              }}>
                ${planDetails.price}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#6b7280',
                fontSize: '0.9rem'
              }}>
                {planDetails.priceDetail}
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default PaymentHeader; 