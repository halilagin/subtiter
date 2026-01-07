import React, { useState } from 'react';
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
  Grid,
  Container,
  Chip
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import PaymentSuccess from './PaymentSuccess';
import { AuthApi, SubscriptionApi } from '@/api';
import { createApiConfiguration } from '@/apiConfig';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(AppConfig.stripePublishableKey);

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
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    setPaymentMessage('');
    
    try {
      const authApi = new AuthApi(createApiConfiguration());
      const subscriptionApi = new SubscriptionApi(createApiConfiguration());
      
      // Register user
      try {
        await authApi.registerApiV1AuthRegisterPost({
          userRegister: {
            email,
            name,
            password,
            subscriptionPlan: planId || 'no_plan'
          }
        });
      } catch (error: any) {
        // Handle 422 - user already exists, continue with payment
        if (error?.response?.status === 422) {
          console.log('User already exists, proceeding with payment...');
        } else {
          throw new Error('User Registration failed!');
        }
      }
      
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');
      
      // Create payment intent
      const paymentIntentResponse = await subscriptionApi.createPaymentIntentApiV1SubscriptionCreatePaymentIntentPost({
        bodyCreatePaymentIntentApiV1SubscriptionCreatePaymentIntentPost: {
          planId: planId || '',
          email,
          name
        }
      });
      
      const result = await stripe.confirmCardPayment(paymentIntentResponse.clientSecret, {
        payment_method: { card: cardElement, billing_details: { name, email } }
      });
      
      if (result.error) {
        setPaymentMessage(result.error.message || 'Payment failed.');
        setPaymentSuccess(false);
      } else if (result.paymentIntent?.status === 'succeeded') {
        // Update subscription ID
        await authApi.updateSubscriptionIdApiV1AuthUpdateSubscriptionIdPost({
          requestBody: { email }
        });
        
        setPaymentSuccess(true);
        setPaymentMessage('Payment successful! Your subscription is now active.');
        onSuccess('Payment successful! Your subscription is now active.');
      } else {
        setPaymentMessage(`Payment status: ${result.paymentIntent?.status}`);
        setPaymentSuccess(false);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentMessage(error.message || 'Payment failed. Please try again.');
      setPaymentSuccess(false);
    }
    
    setIsProcessing(false);
  };

  if (paymentSuccess) {
    return <PaymentSuccess message={paymentMessage} />;
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
          boxShadow: 'none'
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
          <TextField
            placeholder="Full Name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '32px',
                fontSize: '0.875rem',
                fontWeight: '400',
                color: '#374151',
                border: '1px solid #d1d5db',
                '&:hover': {
                  border: '1px solid #9ca3af'
                },
                '&.Mui-focused': {
                  border: '2px solid #5a4eff'
                },
                '& fieldset': {
                  borderColor: 'transparent',
                  borderWidth: 0
                },
                '& input': {
                  paddingLeft: '12px',
                  textIndent: '8px'
                }
              },
              '& .MuiInputLabel-root': {
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: '400',
                left: '12px'
              }
            }}
          />
          
          <TextField
            placeholder="Email Address"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '32px',
                fontSize: '0.875rem',
                fontWeight: '400',
                color: '#374151',
                border: '1px solid #d1d5db',
                '&:hover': {
                  border: '1px solid #9ca3af'
                },
                '&.Mui-focused': {
                  border: '2px solid #5a4eff'
                },
                '& fieldset': {
                  borderColor: 'transparent',
                  borderWidth: 0
                },
                '& input': {
                  paddingLeft: '12px',
                  textIndent: '8px'
                }
              },
              '& .MuiInputLabel-root': {
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: '400',
                left: '12px'
              }
            }}
          />
          
          {planId !== 'PAY_AS_YOU_GO' && (
            <TextField
              placeholder="Create a password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '32px',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  '&:hover': {
                    border: '1px solid #9ca3af'
                  },
                  '&.Mui-focused': {
                    border: '2px solid #5a4eff'
                  },
                  '& fieldset': {
                    borderColor: 'transparent',
                    borderWidth: 0
                  },
                  '& input': {
                    paddingLeft: '12px',
                    textIndent: '8px'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  left: '12px'
                }
              }}
            />
          )}

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
                border: '2px solid #5a4eff'
              }
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
      </Paper>
  );
};

// Export the component wrapped with Stripe Elements
export default function PaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormComponent {...props} />
    </Elements>
  );
}