import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Button, Chip } from '@mui/material';
import InternalCardButton from './plans/InternalCardButton';
import { useNavigate } from 'react-router-dom';
import { plans } from './plans/PlanDescriptions';
import PricingCard from './plans/PricingCard';

const PricingPlans = ({ viewOnly }: { viewOnly: boolean }) => {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();

  const handleButtonClick = (isYearly: boolean, planId: string) => {
    const period = isYearly ? 'yearly' : 'monthly';

    navigate('/create-account', {
      state: {
        planId: planId,
        isYearly: isYearly
      }
    });
  };

  return (
    <Box sx={{ py: 4, bgcolor: '#f5f5f5' }}>
      <Container maxWidth="xl">
        {/* Toggle */}
        <Box sx={{ textAlign: 'center', mb: 2, mt: 0 }}>
          <Box sx={{ 
            display: 'inline-flex', 
            bgcolor: 'white', 
            borderRadius: 16, 
            p: 0.5, 
            border: '1px solid #e5e7eb' 
          }}>
            <Button
              onClick={() => setIsYearly(false)}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 18,
                bgcolor: !isYearly ? '#5a4eff' : 'transparent',
                color: !isYearly ? 'white' : '#000000',
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                outline: 'none',
                '&:hover': {
                  bgcolor: !isYearly ? '#4a3eff' : 'rgba(90, 78, 255, 0.1)'
                },
                '&:focus': {
                  outline: 'none'
                },
                '&:focus-visible': {
                  outline: 'none'
                }
              }}
            >
              Monthly
            </Button>
            <Button
              onClick={() => setIsYearly(true)}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 16,
                bgcolor: isYearly ? '#5a4eff' : 'transparent',
                color: isYearly ? 'white' : '#000000',
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                outline: 'none',
                '&:hover': {
                  bgcolor: isYearly ? '#4a3eff' : 'rgba(90, 78, 255, 0.1)'
                },
                '&:focus': {
                  outline: 'none'
                },
                '&:focus-visible': {
                  outline: 'none'
                }
              }}
            >
              Yearly
              <Chip 
                label="Save 20%" 
                size="small" 
                sx={{ 
                  ml: 1, 
                  bgcolor: '#e2f4a6', 
                  color: '#000000',
                  fontSize: '0.7rem',
                  height: 20
                }} 
              />
            </Button>
          </Box>
        </Box>

        {/* Pricing Cards */}
        <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
          <Grid item xs={9} sm={7} md={2.3}>
            <PricingCard viewOnly={viewOnly} isYearly={isYearly} plan={plans.find(p => p.id === 'klippers_level1')!}>
              <InternalCardButton viewOnly={viewOnly} isCurrentPlan={false} planId="klippers_level1" handleButtonClick={()=>handleButtonClick(isYearly, "klippers_level1")} />
            </PricingCard>
          </Grid>
          <Grid item xs={9} sm={7} md={2.3}>    
            <PricingCard viewOnly={viewOnly} isYearly={isYearly} plan={plans.find(p => p.id === 'klippers_level2')!}>
              <InternalCardButton viewOnly={viewOnly} isCurrentPlan={false} planId="klippers_level2" handleButtonClick={()=>handleButtonClick(isYearly, "klippers_level2")} />
            </PricingCard>
          </Grid>
          <Grid item xs={9} sm={7} md={2.3}>
            <PricingCard viewOnly={viewOnly} isYearly={isYearly} plan={plans.find(p => p.id === 'klippers_level3')!}>
              <InternalCardButton viewOnly={viewOnly} isCurrentPlan={false} planId="klippers_level3" handleButtonClick={()=>handleButtonClick(isYearly, "klippers_level3")} />
            </PricingCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PricingPlans; 