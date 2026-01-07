import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { PricingCard } from "..";
import {plans } from "../plans/PlanDescriptions";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import AppConfig from '@/AppConfig';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Grid,
  } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { AuthApi, SubscriptionApi } from '@/api';
import { createApiConfiguration, getAuthenticatedUser } from '@/apiConfig';
import { Plan } from '../plans/PlanDescriptions';


interface PaymentFormProps {
  planId: string | null;
  planDetails: any;
  onSuccess: (message: string) => void;
}

// Style options for Stripe CardElement to match Subtiter theme
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      iconColor: '#6b7280',
      color: '#000000',
      fontWeight: '400',
      fontFamily: '"Inter", sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#9ca3af' },
      backgroundColor: 'transparent',
    },
    invalid: {
      iconColor: '#ef4444',
      color: '#ef4444',
    },
  },
};

const PaymentFormComponent: React.FC<PaymentFormProps> = ({ planId, planDetails, onSuccess }) => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardHolderName, setCardHolderName] = useState('');

  useEffect(() => {
    const authenticatedUser = getAuthenticatedUser();
    if (authenticatedUser?.name) {
      setCardHolderName(authenticatedUser.name);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const authenticatedUser = getAuthenticatedUser();
    if (!authenticatedUser) {
      navigate('/login');
      return;
    }
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);
    setPaymentMessage('');
    
    try {
      const authApi = new AuthApi(createApiConfiguration());
      const subscriptionApi = new SubscriptionApi(createApiConfiguration());
      
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      throw new Error('Card element not found');
    }

    // Check if card holder name is provided
    if (!cardHolderName || cardHolderName.trim() === '') {
      alert('Please enter the card holder name');
      setIsProcessing(false);
      return;
    }
    
    // Create payment intent
    const paymentIntentResponse = await subscriptionApi.createPaymentIntentApiV1SubscriptionCreatePaymentIntentPost({
      bodyCreatePaymentIntentApiV1SubscriptionCreatePaymentIntentPost: {
        planId: planId || '',
        email: authenticatedUser.email,
        name: cardHolderName
      }
    });
    
    const result = await stripe.confirmCardPayment(paymentIntentResponse.clientSecret, {
      payment_method: { 
        card: cardElement, 
        billing_details: { 
          name: cardHolderName, 
          email: authenticatedUser.email 
        } 
      }
    });
      
      if (result.error) {
        setPaymentMessage(result.error.message || 'Payment failed.');
        setPaymentSuccess(false);
      } else if (result.paymentIntent?.status === 'succeeded') {
        // Update subscription ID
        await authApi.updateSubscriptionIdApiV1AuthUpdateSubscriptionIdPost({
          requestBody: { email: authenticatedUser.email }
        });
        
        setPaymentSuccess(true);
        setPaymentMessage('Payment successful! Your subscription is now active.');
        onSuccess('Payment successful! Your subscription is now active.');
        
        // Redirect to subscription page
        navigate('/in/subscription');
      } else {
        setPaymentMessage(`Payment status: ${result.paymentIntent?.status}`);
        setPaymentSuccess(false);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentMessage(error.message || 'Payment failed. Please try again.');
      setPaymentSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    alert(paymentMessage);
  }

  return (
    <Paper 
        component="form"
        onSubmit={handleSubmit} 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          bgcolor: 'white',
          border: '1px solid #e5e7eb',
          boxShadow: 'none',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography variant="h4" component="h2" sx={{ 
          mb: 2, 
          fontWeight: '800', 
          textAlign: 'center', 
          color: '#000000',
          fontFamily: "'Inter', sans-serif"
        }}>
          Payment Details
        </Typography>
        
        {/* Form Fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}> 
          <Box 
            sx={{ 
              p: '16px', 
              borderRadius: '32px',
              border: '1px solid #d1d5db',
              '&:hover': {
                border: '1px solid #9ca3af'
              },
              '& input': {
                padding: 0,
                fontFamily: '"Inter", sans-serif',
                fontSize: '16px',
                color: '#000000',
                fontWeight: '400',
              },
            }}
          >
            <TextField
              placeholder="Card Holder Name"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              fullWidth
              required
              variant="standard"
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                '& .MuiInput-root': {
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '16px',
                  color: '#000000 !important',
                  fontWeight: '400',
                  minHeight: 'auto',
                  height: 'auto',
                  lineHeight: '1.5',
                  '&::placeholder': {
                    color: '#9ca3af',
                    opacity: 1,
                  },
                  '&:hover': {
                    '&::before': {
                      display: 'none',
                    },
                  },
                  '&.Mui-focused': {
                    color: '#000000 !important',
                    '&::before': {
                      display: 'none',
                    },
                    '&::after': {
                      display: 'none',
                    },
                  },
                },
                '& .MuiInput-input': {
                  padding: 0,
                  color: '#000000 !important',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  '&:focus': {
                    color: '#000000 !important',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                  },
                },
                '&:hover': {
                  '& .MuiInput-root': {
                    '&::before': {
                      display: 'none',
                    },
                  },
                },
                '&.Mui-focused': {
                  '& .MuiInput-root': {
                    color: '#000000 !important',
                    '&::before': {
                      display: 'none',
                    },
                    '&::after': {
                      display: 'none',
                    },
                  },
                  '& .MuiInput-input': {
                    color: '#000000 !important',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                  },
                },
              }}
            />
          </Box>
          <Box 
            id="card-element-wrapper" 
            sx={{ 
              p: '16px', 
              borderRadius: '32px',
              border: '1px solid #d1d5db',
              '&:hover': {
                border: '1px solid #9ca3af'
              },
              '&:focus-within': {
                border: '2px solid #000000'
              },
              '& .StripeElement': {
                padding: 0,
                minHeight: 'auto',
                height: 'auto',
              },
              '& iframe': {
                padding: 0,
              },
              '& input': {
                padding: 0,
                fontFamily: '"Inter", sans-serif',
                fontSize: '16px',
                color: '#000000',
                fontWeight: '400',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                lineHeight: '1.5',
                minHeight: 'auto',
                height: 'auto',
                '&::placeholder': {
                  color: '#9ca3af',
                  opacity: 1,
                },
              },
            }}
          >
            <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
          </Box>
        </Box>
        
        {paymentMessage && (
          <Alert 
            severity={paymentSuccess ? 'success' : 'error'} 
            sx={{ mt: 3, mb: 3 }} 
          >
            {paymentMessage}
          </Alert>
        )}
        
        <Box sx={{ mt: 'auto' }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!stripe || isProcessing}
            sx={{
              mt: 2,
              py: 2,
              bgcolor: '#000000',
              color: 'white',
              borderRadius: '32px',
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: '600',
              fontFamily: "'Inter', sans-serif",
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#1a1a1a',
                boxShadow: 'none'
              },
              '&:disabled': {
                bgcolor: '#9ca3af',
                boxShadow: 'none'
              }
            }}
          >
            {isProcessing ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Processing Payment...
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockOutlined sx={{ fontSize: 18 }} />
                Complete Payment
              </Box>
            )}
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
            <LockOutlined fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Payments are secure and encrypted. By subscribing, you agree to our Terms of Service.
            </Typography>
          </Box>
        </Box>
      </Paper>
  );
};

// Export the component wrapped with Stripe Elements
function PaymentForm(props: PaymentFormProps) {
    // Initialize Stripe with the publishable key
    const stripePromise = loadStripe(AppConfig.stripePublishableKey);

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormComponent {...props} />
    </Elements>
  );
}




const PayForUpgrade = () => {
    const location = useLocation();
    const [planId, setPlanId] = useState<string>("no_plan");
    const [isYearly, setIsYearly] = useState<boolean >(false);
    const [plan, setPlan] = useState<Plan>(plans.find(p => p.id === "subtiter_level1")!);
    useEffect(() => {
        if (location.state) {
            const currentPlanId = location.state.planId;
            setPlanId(currentPlanId);
            setIsYearly(location.state.isYearly);
            setPlan(plans.find(p => p.id === currentPlanId)!);
        }
    }, [location.state]);

    return (
        <Box sx={{ py: 4, bgcolor: '#f5f5f5' }}>
            <Container maxWidth="xl">
              
                
                <Grid container spacing={3} justifyContent="center" alignItems="stretch">
                    <Grid item xs={12} sm={10} md={4}>
                        <PricingCard viewOnly={false} isYearly={isYearly} plan={plan } />
                    </Grid>
                    <Grid item xs={12} sm={10} md={5}>
                        <PaymentForm planId={planId} planDetails={plan} onSuccess={(message) => {
                            console.log(message);
                        }} />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default PayForUpgrade;