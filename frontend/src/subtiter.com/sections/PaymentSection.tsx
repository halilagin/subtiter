import React, { useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface PaymentSectionProps {
  onPrevious: () => void;
  summaryData: any;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  onPrevious,
  summaryData,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: '500px',
          px: 3,
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 64, color: '#1a1a1a' }} />
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          Payment Successful
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.875rem',
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          Your video is being processed. You will receive a notification when it's ready.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '500px',
        px: 3,
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        overflow: 'hidden',
        overflowX: 'hidden',
        overflowY: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          Payment
        </Typography>
      </Box>

      <Box
        sx={{
          bgcolor: '#fafafa',
          borderRadius: 1,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.95rem',
            fontWeight: 400,
            color: '#1a1a1a',
            mb: 1,
          }}
        >
          Card Information
        </Typography>

        <TextField
          fullWidth
          label="Cardholder Name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#ffffff',
              '& fieldset': {
                borderColor: '#e5e5e5',
              },
              '&:hover fieldset': {
                borderColor: '#1a1a1a',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1a1a1a',
                borderWidth: '1px',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#999999',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#1a1a1a',
            },
          }}
        />

        <TextField
          fullWidth
          label="Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="1234 5678 9012 3456"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#ffffff',
              '& fieldset': {
                borderColor: '#e5e5e5',
              },
              '&:hover fieldset': {
                borderColor: '#1a1a1a',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1a1a1a',
                borderWidth: '1px',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#999999',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#1a1a1a',
            },
          }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Expiry Date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            placeholder="MM/YY"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#ffffff',
                '& fieldset': {
                  borderColor: '#e5e5e5',
                },
                '&:hover fieldset': {
                  borderColor: '#1a1a1a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a1a1a',
                  borderWidth: '1px',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#999999',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#1a1a1a',
              },
            }}
          />
          <TextField
            fullWidth
            label="CVV"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            placeholder="123"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#ffffff',
                '& fieldset': {
                  borderColor: '#e5e5e5',
                },
                '&:hover fieldset': {
                  borderColor: '#1a1a1a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a1a1a',
                  borderWidth: '1px',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#999999',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#1a1a1a',
              },
            }}
          />
        </Box>

        <Box
          sx={{
            pt: 2.5,
            borderTop: '1px solid #e5e5e5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 400,
              color: '#1a1a1a',
            }}
          >
            Total Amount
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.5rem',
              fontWeight: 400,
              color: '#1a1a1a',
            }}
          >
            $9.99
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={handlePayment}
          disabled={isProcessing || !cardNumber || !expiryDate || !cvv || !cardholderName}
          sx={{
            bgcolor: '#f16838',
            color: '#ffffff',
            borderRadius: 1,
            px: 4,
            py: 1,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: '0.875rem',
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#d95a30',
            },
            '&:disabled': {
              bgcolor: '#e0e0e0',
              color: '#999999',
            },
          }}
        >
          {isProcessing ? 'Processing...' : 'Pay $9.99'}
        </Button>
      </Box>
    </Box>
  );
};
