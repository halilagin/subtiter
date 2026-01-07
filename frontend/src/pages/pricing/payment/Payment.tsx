import React, { useEffect } from 'react';
import { Box, Container, Grid, Typography, Stepper, Step, StepLabel } from '@mui/material';
import NavBar from '@/components/NavBarOuter';
import PaymentHeader from './PaymentHeader';
import PaymentForm from './PaymentForm';
import PaymentSuccess from './PaymentSuccess';
import CreateAccountStep from './CreateAccountStep';
import { useLocation } from 'react-router-dom';

const Payment = () => {
  const location = useLocation();
  let { planId, planDetails } = location.state || {};
  const [paymentSuccess, setPaymentSuccess] = React.useState(false);
  const [paymentMessage, setPaymentMessage] = React.useState('');
  const [currentStep, setCurrentStep] = React.useState(0);
  const [accountCreated, setAccountCreated] = React.useState(false);

  const steps = ['Create Account', 'Payment Details'];

  // Remove body margins/padding for this page
  useEffect(() => {
    const originalBodyStyle = {
      margin: document.body.style.margin,
      padding: document.body.style.padding,
      overflow: document.body.style.overflow
    };

    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';

    return () => {
      document.body.style.margin = originalBodyStyle.margin;
      document.body.style.padding = originalBodyStyle.padding;
      document.body.style.overflow = originalBodyStyle.overflow;
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
    };
  }, []);

  if (paymentSuccess) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#f5f5f5',
        margin: 0,
        padding: 0,
        width: '100%',
        overflow: 'hidden'
      }}>
        <Box sx={{ '& .MuiAppBar-root': { position: 'static !important' } }}>
          <NavBar />
        </Box>
        <Box sx={{ py: 2, pt: 4 }}>
          <PaymentSuccess message={paymentMessage} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f5f5f5',
      margin: 0,
      padding: 0,
      width: '100%',
      overflow: 'hidden'
    }}>
      <Box sx={{ '& .MuiAppBar-root': { position: 'static !important' } }}>
        <NavBar />
      </Box>
      <Container maxWidth="lg" sx={{ py: 2, pt: 2 }}>
        {/* Minimal Stepper */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', py: 2 }}>
          {steps.map((label, index) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Step Circle */}
              <Box sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: index <= currentStep ? '#e2f4a6' : 'transparent',
                color: index <= currentStep ? '#000000' : '#9ca3af',
                border: index <= currentStep ? 'none' : '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '0.8rem',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.3s ease',
                mr: 1
              }}>
                {index < currentStep ? '✓' : index + 1}
              </Box>
              
              {/* Step Label */}
              <Typography sx={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: index === currentStep ? '600' : '400',
                color: index <= currentStep ? '#000000' : '#9ca3af',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease'
              }}>
                {label}
              </Typography>
              
              {/* Spacer */}
              {index < steps.length - 1 && (
                <Box sx={{ mx: 2 }} />
              )}
            </Box>
          ))}
        </Box>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            {currentStep === 0 && (
              <Box>
                {/* Create Account Header */}
                <Box sx={{ textAlign: 'center', mb: 2, py: 2, bgcolor: '#f5f5f5', borderRadius: 3 }}>
                  <Typography variant="h1" sx={{ 
                    fontWeight: '900', 
                    mb: 1, 
                    color: '#000000',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                    lineHeight: { xs: 1.1, md: 1.05 },
                    letterSpacing: { xs: '-0.02em', md: '-0.03em' },
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Create Your Account
                  </Typography>
                  <Typography variant="h2" sx={{ 
                    fontWeight: '300', 
                    mb: 2, 
                    color: '#000000',
                    fontSize: { xs: '1rem', md: '1.25rem' }
                  }}>
                    Get started with your selected plan
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

                <CreateAccountStep 
                  onSuccess={() => {
                    setAccountCreated(true);
                    setCurrentStep(1);
                  }}
                  planDetails={planDetails}
                />
              </Box>
            )}

            {currentStep === 1 && (
              <Box>
                <PaymentHeader planDetails={planDetails} />
                <PaymentForm 
                  planId={planId} 
                  planDetails={planDetails}
                  onSuccess={(message) => {
                    setPaymentMessage(message);
                    setPaymentSuccess(true);
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Payment; 