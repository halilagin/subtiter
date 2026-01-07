import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Button
} from '@mui/material';
import { 
  CreditCard,
  CalendarToday,
  Receipt
} from '@mui/icons-material';

const BillingDetails = () => {
  const billingInfo = [
    {
      icon: <CreditCard sx={{ fontSize: 24, color: '#6b7280' }} />,
      title: 'Payment Method',
      value: '•••• •••• •••• 4242',
      action: 'Update'
    },
    {
      icon: <CalendarToday sx={{ fontSize: 24, color: '#6b7280' }} />,
      title: 'Payment Cycle',
      value: 'Monthly',
      action: 'Change'
    }
  ];

  return (
    <Box sx={{ mt: 4 }}>
      {/* Single Billing Section */}
      <Box sx={{ 
        p: 4,
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: 8,
        bgcolor: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h5" sx={{ 
            fontWeight: '700', 
            color: '#000000',
            fontSize: '1.5rem',
            fontFamily: "'Inter', sans-serif"
          }}>
            Billing Information
          </Typography>
          
          <Typography variant="body2" sx={{ 
            color: '#6b7280',
            fontSize: '0.9rem',
            fontFamily: "'Inter', sans-serif"
          }}>
            Next Payment Date: March 15, 2024
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {billingInfo.map((info, index) => (
            <Grid item xs={12} key={index}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2.5,
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 12,
                bgcolor: '#f8f9fa',
                height: '100%'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    bgcolor: 'white',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    {info.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ 
                      fontWeight: '600', 
                      color: '#000000',
                      mb: 0.5,
                      fontSize: '0.875rem',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {info.title}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6b7280',
                      fontSize: '0.8rem',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {info.value}
                    </Typography>
                  </Box>
                </Box>
                
                {info.action && (
                  <Button
                    variant="contained"
                    onClick={() => console.log(`${info.title} clicked`)}
                    sx={{ 
                      borderRadius: 8,
                      px: 2,
                      py: 1,
                      bgcolor: '#000000',
                      color: 'white',
                      fontWeight: '600',
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      boxShadow: 'none',
                      minWidth: 80,
                      '&:hover': {
                        bgcolor: '#000000',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    {info.action}
                  </Button>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default BillingDetails; 