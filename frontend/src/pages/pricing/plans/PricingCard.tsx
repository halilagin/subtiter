import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { Check } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Plan } from './PlanDescriptions';

interface PricingCardProps {
  plan: Plan;
  isYearly: boolean;
  children?: React.ReactNode;
  viewOnly: boolean;
}

const PricingCard = ({ plan, viewOnly, isYearly, children }: PricingCardProps) => {
  const navigate = useNavigate();
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const period = isYearly ? '/year' : '/month';

  const handleGetStarted = () => {
    navigate('/create-account', { 
      state: { 
        planId: plan.id,
        planDetails: {
          name: plan.name,
          price: price,
          priceDetail: period
        }
      } 
    });
  };

  return (
    <Box sx={{
      bgcolor: 'white',
      borderRadius: 4,
      p: { xs: 1.5, md: 2 },
      height: { xs: 380, md: 450 },
      border: '1px solid #e5e7eb',
      position: 'relative',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      '&:hover': {
        transform: 'none',
        boxShadow: 'none'
      }
    }}>
      <Box sx={{ textAlign: 'center', mb: 1.5, height: { xs: '140px', md: '170px' } }}>
        <Typography variant="h4" sx={{ 
          fontWeight: '700', 
          mb: 0.5, 
          color: '#000000',
          fontFamily: "'Inter', sans-serif",
          fontSize: { xs: '1.2rem', md: '1.4rem' }
        }}>
          {plan.name}
        </Typography>
        <Typography variant="body2" sx={{ 
          color: '#6b7280', 
          mb: 1.5,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: { xs: '0.85rem', md: '0.95rem' }
        }}>
          {plan.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 1.5 }}>
          <Typography variant="h1" sx={{ 
            fontWeight: '900', 
            color: '#000000',
            fontSize: { xs: '2rem', md: '2.8rem' },
            fontFamily: "'Inter', sans-serif"
          }}>
            ${price}
          </Typography>
          <Typography variant="h6" sx={{ 
            color: '#6b7280', 
            ml: 1 
          }}>
            {period}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 1, mt: { xs: 1.5, md: 2 } }}>
          {children}
        </Box>
      </Box>

      <Box sx={{ 
        textAlign: 'left', 
        height: { xs: '160px', md: '200px' },
        p: { xs: 1, md: 1.5 },
        overflow: 'visible',
        mt: 0.5
      }}>
        {plan.features.map((feature, index) => (
          <Box key={index} sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 1, 
            mb: 1.2 
          }}>
            <Check sx={{ 
              fontSize: 16, 
              color: '#000000', 
              mt: 0.2,
              flexShrink: 0
            }} />
            <Typography variant="body2" sx={{ 
              color: '#000000',
              fontFamily: "'Inter', sans-serif",
              fontSize: { xs: '0.85rem', md: '0.9rem' },
              lineHeight: 1.4
            }}>
              {feature}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PricingCard; 