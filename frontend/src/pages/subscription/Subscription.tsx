import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
// import './Subscription.css'; // Removed CSS import
import SubscriptionPlan from './SubscriptionPlan';
import PaymentForm from './PaymentForm';
import { plans, Plan } from '@/pages/pricing/plans/PlanDescriptions';
import AppConfig from '@/AppConfig';
import { Box, Typography, Grid, Button } from '@mui/material'; // Removed Container
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Icon for back button

// Define props for Subscription, including the new callback
interface SubscriptionProps {
  onPlanSelect?: (planId: string | null) => void;
  title?: string; // Add title prop
}

// Initialize Stripe with your public key
const stripePromise = loadStripe(AppConfig.stripePublishableKey);

const Subscription: React.FC<SubscriptionProps> = ({ onPlanSelect, title }) => { // Destructure the title prop
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentForm(true);
    // Call the callback prop when a plan is selected
    onPlanSelect?.(planId); 
  };

  const handleBackToPlans = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null); // Clear selection when going back
    // Optionally call callback with null, or let ManageSubscription keep the last selection
    // onPlanSelect?.(null); // Let's not clear the display for now
  };

  return (
    // Use Box instead of Container, rely on parent for margins
    <Box sx={{ py: { xs: 4, md: 8 }, mx: { xs: 3, sm: 6, md: 10 } }}> {/* Increased horizontal margins */}

      <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
        {/* Keep existing Typography for title/description */}
        <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '28px', md: '42px' }, fontWeight: 600, color: '#212121', mb: 1 }}>
          {title || 'Choose Your Subscription Plan'} {/* Use title prop or default */}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontSize: { xs: '14px', md: '16px' } }}>
          Select the plan that works best for your document signing needs
        </Typography>
      </Box>

      {!showPaymentForm ? (
        // Use Grid container for plan layout
        <Grid container spacing={3} justifyContent="center" alignItems="stretch"> {/* Use stretch for equal height */}
          {plans.filter(p => p.id !== 'no_plan').map((plan: Plan) => (
            // Grid items for responsiveness
            <Grid item key={plan.id} xs={12} sm={6} md={4}> 
              <SubscriptionPlan
                plan={plan}
                onSelect={() => handleSelectPlan(plan.id)}
                selectedPlanId={selectedPlan}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        // Payment Form Section
        <Elements stripe={stripePromise}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={handleBackToPlans} 
              sx={{ 
                mb: 3, 
                alignSelf: 'flex-start', // Align button left
                color: '#455cff', // Set text color
                '&:hover': {
                  bgcolor: 'transparent' // Remove hover background effect
                }
              }} 
            >
              Back to plans
            </Button>
            {/* Wrap PaymentForm if it needs specific layout */}
            <Box sx={{ width: '100%', maxWidth: '500px' }}> {/* Constrain payment form width */}
              <PaymentForm
                planId={selectedPlan}
                planDetails={plans.find(p => p.id === selectedPlan)}
              />
            </Box>
          </Box>
        </Elements>
      )}
    </Box>
  );
};

export default Subscription; 