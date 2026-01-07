import React from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Close,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface SubscribeModalProps {
  open: boolean;
  onClose: () => void;
}

const SubscribeModal: React.FC<SubscribeModalProps> = ({ 
  open, 
  onClose
}) => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate('/in/subscription');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px'
        }
      }}
    >
      <DialogTitle sx={{ 
        position: 'relative',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        pb: 1,
        pt: 2.5
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: '600', 
          color: '#2f2e2c',
          fontFamily: "'Inter', sans-serif",
          fontSize: '1.1rem',
          textAlign: 'center'
        }}>
          Subscribe to Download
        </Typography>
        <IconButton 
          onClick={onClose} 
          size="small" 
          sx={{ 
            color: '#6B7280',
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 3, px: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ 
            color: '#6B7280',
            mb: 3,
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.9rem',
            lineHeight: 1.6
          }}>
            Choose a plan that fits your needs and start downloading your videos in high quality today!
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleSubscribe}
            startIcon={<Star sx={{ fontSize: 20 }} />}
            sx={{
              bgcolor: '#5a4eff',
              color: 'white',
              borderRadius: 12,
              py: 1.2,
              px: 3.5,
              textTransform: 'none',
              fontWeight: '700',
              fontSize: '1rem',
              minWidth: 200,
              boxShadow: '0 4px 20px rgba(90, 78, 255, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#4a3eef',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(90, 78, 255, 0.5)',
              },
              '&:active': {
                transform: 'translateY(0)',
              }
            }}
          >
            Subscribe Now
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeModal;

