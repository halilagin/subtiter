
import { Box, Button } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';

interface InternalCardButtonProps {
    handleButtonClick: (action: string) => void;
    isCurrentPlan: boolean;
    planId: string;
    viewOnly: boolean;
}

const InternalCardButton = ({ handleButtonClick,  isCurrentPlan, planId, viewOnly }: InternalCardButtonProps) => {
    // Function to determine background color
    const getBackgroundColor = (isHover: boolean = false): string => {
        
        if (planId === "no_plan" && isCurrentPlan) {
            return '#000000';
        }
        if (isCurrentPlan) {
            return isHover ? '#c62828' : '#d32f2f';
        }
        if (planId === "no_plan") {
            return '#000000';
        }
        return '#1a1a1a';
    };

    // Function to determine button text
    const getButtonText = (): string => {
        if (viewOnly) {
            return "Get Started";
        }

        if (isCurrentPlan && planId === "no_plan") {
            return "Current Plan";
        }
        if (isCurrentPlan && planId !== "no_plan") {
            return "Cancel";
        }
        return "Upgrade";
        
        
    };

    return (
        
        <Box sx={{ textAlign: 'center', mb: 1, mt: { xs: 1.5, md: 2 } }}>
          <Button
            variant="contained"
            onClick={() => handleButtonClick(isCurrentPlan ? "cancel" : "upgrade")}
            startIcon={isCurrentPlan ? <CancelIcon /> : undefined}
            disabled={planId === "no_plan" && isCurrentPlan}
            sx={{
              py: { xs: 0.8, md: 1 },
              px: { xs: 4, md: 6 },
              bgcolor: getBackgroundColor(),
              color: 'white',
              borderRadius: 16,
              textTransform: 'none',
              fontWeight: '600',
              fontSize: { xs: '0.8rem', md: '0.9rem' },
              boxShadow: 'none',
              '&:hover': {
                bgcolor: getBackgroundColor(true),
                boxShadow: 'none'
              },
              '&:focus': {
                boxShadow: 'none'
              }
            }}
          >
            {getButtonText()}
          </Button>
        </Box>
    );
};

export default InternalCardButton;