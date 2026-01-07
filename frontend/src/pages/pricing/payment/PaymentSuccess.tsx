import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface PaymentSuccessProps {
  message: string;
}

const PaymentSuccess = ({ message }: PaymentSuccessProps) => {
  return (
    <Box sx={{ py: 5, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 10 }}>
        <Box sx={{
          bgcolor: 'transparent',
          borderRadius: 4,
          p: 5,
          textAlign: 'center'
        }}>
          <CheckCircleIcon sx={{ 
            fontSize: '100px', 
            color: '#10b981', 
            mb: 3
          }} />
          <Typography variant="h3" component="h2" gutterBottom sx={{ 
            fontWeight: '700', 
            color: '#000000',
            fontFamily: "'Inter', sans-serif",
            mb: 2,
            fontSize: '2rem'
          }}>
            Payment Successful!
          </Typography>
          <Typography variant="h6" sx={{ 
            color: '#6b7280', 
            mb: 3,
            fontSize: '1rem'
          }}>
            {message}
          </Typography>
          <Typography variant="h6" sx={{ 
            color: '#6b7280',
            fontSize: '1rem',
            mb: 5
          }}>
            You can now start using your subscription.
          </Typography>
          <Button
            component={RouterLink}
            to="/dashboard"
            variant="contained"
            sx={{
              py: 1.5,
              px: 6,
              bgcolor: '#000000',
              color: 'white',
              borderRadius: 16,
              textTransform: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#1a1a1a',
                boxShadow: 'none'
              },
              '&:focus': {
                boxShadow: 'none'
              }
            }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentSuccess; 