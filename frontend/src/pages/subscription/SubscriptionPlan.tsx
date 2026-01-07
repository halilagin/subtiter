import React from 'react';
import { Box, Typography, Button, List, ListItem, ListItemIcon, ListItemText, Paper, Chip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { Plan } from '@/pages/pricing/plans/PlanDescriptions';

interface PlanProps {
  plan: Plan; // Use the imported Plan interface
  onSelect: () => void;
  selectedPlanId: string | null; // Added this
}

const SubscriptionPlan: React.FC<PlanProps> = ({ plan, onSelect, selectedPlanId }) => {
  // Calculate display states based on props
  const isThisPlanSelected = plan.id === selectedPlanId;
  const isAnotherPlanSelected = selectedPlanId !== null && selectedPlanId !== plan.id;
  
  // Show recommended styling if the plan is popular AND (no plan is selected OR this plan is the one selected)
  const shouldDisplayAsRecommended = plan.popular && !isAnotherPlanSelected;

  // Determine border and chip visibility based on calculated states
  const finalBorderColor = isThisPlanSelected ? plan.color : (shouldDisplayAsRecommended ? plan.color : 'divider');
  const finalBorderWidth = (isThisPlanSelected || shouldDisplayAsRecommended) ? '2px' : '1px';
  const showRecommendedChip = shouldDisplayAsRecommended;

  return (
    <Paper 
      elevation={0} // No shadow
      variant="outlined" // Use outline instead of shadow
      sx={{
        p: 3,
        borderRadius: '12px', 
        borderColor: finalBorderColor,
        borderWidth: finalBorderWidth,
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        // Keep subtle background highlight only for the actually selected plan
        bgcolor: isThisPlanSelected ? 'primary.lighter' : 'background.paper' 
      }}
    >
      {showRecommendedChip && (
        <Chip 
          label="Recommended" 
          sx={{ 
            position: 'absolute', 
            top: -10, 
            right: 15, 
            fontWeight: 'bold',
            bgcolor: plan.color,
            color: 'white',
          }} 
        />
      )}
      <Box className="plan-header" sx={{ mb: 2, textAlign: 'center' }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {plan.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: '3em' }}> {/* Add min height for alignment */}
          {plan.description}
        </Typography>
      </Box>
      <Box className="plan-price" sx={{ textAlign: 'center', my: 2 }}>
        <Typography component="span" variant="h4" sx={{ fontWeight: 'bold', mr: 0.5 }}>
          ${plan.monthlyPrice}
        </Typography>
        <Typography component="span" variant="body2" color="text.secondary">
            /month
        </Typography>
      </Box>
      <Box className="plan-features" sx={{ flexGrow: 1, mb: 3 }}> {/* Allow features to take up space */}
        <List dense>
          {plan.features.map((feature, index) => (
            <ListItem key={index} disableGutters sx={{ py: 0.2 }}>
              <ListItemIcon sx={{ minWidth: '30px' }}>
                <CheckIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary={feature} primaryTypographyProps={{ fontSize: '14px' }} />
            </ListItem>
          ))}
        </List>
      </Box>

      <Button 
        fullWidth 
        // Use the internally calculated isThisPlanSelected for button styling
        variant={isThisPlanSelected ? "contained" : "outlined"} 
        onClick={onSelect}
        disabled={isThisPlanSelected} 
        sx={{ 
          mt: 'auto', 
          borderRadius: '20px', 
          color: isThisPlanSelected ? 'white' : '#455cff', 
          borderColor: isThisPlanSelected ? undefined : '#455cff', 
          '&:hover': {
             bgcolor: isThisPlanSelected 
               ? 'primary.main' 
               : 'rgba(69, 92, 255, 0.08)', 
             borderColor: isThisPlanSelected ? undefined : '#455cff' 
          }
        }}
      >
        {isThisPlanSelected ? 'Selected' : 'Select Plan'}
      </Button>
    </Paper>
  );
};

export default SubscriptionPlan; 