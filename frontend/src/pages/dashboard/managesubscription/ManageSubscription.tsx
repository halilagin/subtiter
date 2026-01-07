import { Box, Button, Container, Grid, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { Chip } from "@mui/material";
import PricingCard from "../../pricing/plans/PricingCard";
import InternalCardButton from "../../pricing/plans/InternalCardButton";
import { plans } from "../../pricing/plans/PlanDescriptions";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createApiConfiguration } from "@/apiConfig";
import { AuthApi, SubscriptionApi } from "@/api/apis";
import { jwtDecode } from "jwt-decode";
import { getAuthenticatedUser, AuthenticatedUser } from "@/apiConfig";
import WarningIcon from '@mui/icons-material/Warning';

interface PricingCardSubscriptionWrapperProps {
    currentPlan: boolean;
 
    children: React.ReactNode;
}

const PricingCardSubscriptionWrapper = ({ currentPlan, children }: PricingCardSubscriptionWrapperProps) => {
    if (currentPlan) {
        return (
            <Box sx={{ position: 'relative', border: '2px solid #5a4eff', borderRadius: 2, p: 2 }}>
                <Chip 
                    label="Current Plan" 
                    sx={{ 
                        position: 'absolute', 
                        top: -12, 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        bgcolor: '#5a4eff',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                    }} 
                />
                {children}
            </Box>
        );
    }
    
    return <>{children}</>;
};

const ManageSubscription = () => {
    const [isYearly, setIsYearly] = useState(false);
    const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);
    const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [pendingCancelData, setPendingCancelData] = useState<{ planId: string, isYearly: boolean } | null>(null);
    const navigate = useNavigate();


    const requestCancelSubscription = async (planId: string, isYearly: boolean) => {
        const subscriptionApi = new SubscriptionApi(createApiConfiguration());
        subscriptionApi.cancelSubscriptionApiV1SubscriptionCancelSubscriptionPost()
        .then((response) => {
            alert("Subscription cancelled successfully");
            // Refresh the subscription plan
            fetchSubscriptionPlan();
        })
        .catch((error) => {
            alert("Error canceling subscription: " );
        });
    }
  

    const handleButtonClick = (action: string, isYearly: boolean, planId: string) => {
      const period = isYearly ? 'yearly' : 'monthly';
      if (action == "upgrade") {
      navigate(`/in/subscription/pay-for-upgrade`, {
        state: {
          planId: planId,
          isYearly: isYearly
          }
        });
      } else if (action == "cancel") {
        if (planId == "no_plan") {
            return;
        }

        // Open confirmation dialog
        setPendingCancelData({ planId, isYearly });
        setOpenCancelDialog(true);
      }
    };

    const handleConfirmCancel = () => {
        if (pendingCancelData) {
            requestCancelSubscription(pendingCancelData.planId, pendingCancelData.isYearly);
        }
        setOpenCancelDialog(false);
        setPendingCancelData(null);
    };

    const handleCloseDialog = () => {
        setOpenCancelDialog(false);
        setPendingCancelData(null);
    };

    const initializeSubscriptionPlan = () => {
        const user = getAuthenticatedUser();
        
        setAuthenticatedUser(user);
        if (!user) {
            console.log("no user");
            setSubscriptionPlan("no_plan");
            setIsYearly(false);
            return;
        }

        if (!user.subscription_plan || user.subscription_plan=="no_plan") {
            console.log("no subscription plan", user.subscription_plan);
            setSubscriptionPlan("no_plan");
            setIsYearly(false);
            return;
        }
        const isYearly = user.subscription_plan.endsWith("_yearly");
        if (isYearly) {
            setSubscriptionPlan(user.subscription_plan.replace("_yearly", ""));
        } else {
            setSubscriptionPlan(user.subscription_plan.replace("_monthly", ""));
        }
        setSubscriptionPlan(user.subscription_plan);
        setIsYearly(isYearly);
        
        return;
    }

    const fetchSubscriptionPlan = async () => {
        const subscriptionApi = new SubscriptionApi(createApiConfiguration());

        subscriptionApi.mySubscriptionPlanApiV1SubscriptionMySubscriptionPlanPost()
        .then((response) => {
            console.log("Subscription plan response:", response);
            
            // Extract subscription plan from response
            if (response && response.subscription_plan) {
                const plan = response.subscription_plan.replace("prod_", "");
                console.log("Subscription Plan:", plan);
                // Check if it's a yearly or monthly plan
                const isYearlyPlan = plan.endsWith("_yearly");
                
                // Remove the _yearly or _monthly suffix to get the base plan
                let basePlan = plan;
                if (plan.endsWith("_yearly")) {
                    basePlan = plan.replace("_yearly", "");
                } else if (plan.endsWith("_monthly")) {
                    basePlan = plan.replace("_monthly", "");
                }
                
                setSubscriptionPlan(basePlan);
                setIsYearly(isYearlyPlan);
            } else {
                // No subscription plan found
                setSubscriptionPlan("no_plan");
                setIsYearly(false);
            }
        }).catch((error) => {
            console.log("Error fetching subscription plan:", error);
            // Default to no plan on error
            setSubscriptionPlan("no_plan");
            setIsYearly(false);
        });
    };

    useEffect(() => {
        console.log("subscriptionPlan", subscriptionPlan);
    }, [subscriptionPlan]);

    useEffect(() => {
        fetchSubscriptionPlan();
    }, [])
      
    return (
      <>
        {/* Cancel Subscription Confirmation Dialog */}
        <Dialog
          open={openCancelDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon sx={{ color: '#d32f2f' }} />
            <Typography variant="h6" component="span">
              Cancel Subscription
            </Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                color: '#000000',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Keep Subscription
            </Button>
            <Button
              onClick={handleConfirmCancel}
              variant="contained"
              sx={{
                bgcolor: '#d32f2f',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#c62828'
                }
              }}
            >
              Yes, Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ py: 4, bgcolor: '#f5f5f5' }}>
        <Container maxWidth="xl">
            <Box sx={{ display: 'none' }}>
                {
                    subscriptionPlan
                }
                <br />
                {
                    isYearly ? "Yearly" : "Monthly"
                }
                <br />
                {
                    JSON.stringify(authenticatedUser)
                }
            </Box>
          {/* Toggle */}
          <Box sx={{ textAlign: 'center', mb: 2, mt: { xs: -4, md: 0 } }}>
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
            { subscriptionPlan == "no_plan" && <Grid item xs={9} sm={7} md={2.8}>
                <PricingCardSubscriptionWrapper currentPlan={subscriptionPlan === "no_plan"}> 
                    <PricingCard viewOnly={false} isYearly={isYearly} plan={plans.find(p => p.id === 'no_plan')!} >
                        <InternalCardButton viewOnly={false} 
                        handleButtonClick={(action)=>handleButtonClick(action, isYearly, "no_plan")}
                        isCurrentPlan={subscriptionPlan === "no_plan"}
                        planId="no_plan"
                        
                        />
                    </PricingCard>
              </PricingCardSubscriptionWrapper>
            </Grid>}
            <Grid item xs={9} sm={7} md={2.8}>
                <PricingCardSubscriptionWrapper currentPlan={subscriptionPlan === "subtiter_level1"}>       
                    <PricingCard viewOnly={false} isYearly={isYearly} plan={plans.find(p => p.id === 'subtiter_level1')!} >
                        <InternalCardButton viewOnly={false} 
                        handleButtonClick={(action)=>handleButtonClick(action, isYearly, "subtiter_level1")}
                        isCurrentPlan={subscriptionPlan === "subtiter_level1"}
                        planId="subtiter_level1"
                        />
                    </PricingCard>
                </PricingCardSubscriptionWrapper>
            </Grid>  
            <Grid item xs={9} sm={7} md={2.8}>
                <PricingCardSubscriptionWrapper currentPlan={subscriptionPlan === "subtiter_level2"}>
                    <PricingCard viewOnly={false} isYearly={isYearly} plan={plans.find(p => p.id === 'subtiter_level2')!}>
                        <InternalCardButton viewOnly={false} 
                        handleButtonClick={(action)=>handleButtonClick(action, isYearly, "subtiter_level2")} 
                        isCurrentPlan={subscriptionPlan === "subtiter_level2"}
                        planId="subtiter_level2"
                        />
                    </PricingCard>
                </PricingCardSubscriptionWrapper>
            </Grid>
            <Grid item xs={9} sm={7} md={2.8}>
                <PricingCardSubscriptionWrapper currentPlan={subscriptionPlan === "subtiter_level3"}>
                    <PricingCard viewOnly={false} isYearly={isYearly} plan={plans.find(p => p.id === 'subtiter_level3')!}>
                        <InternalCardButton viewOnly={false} 
                        handleButtonClick={(action)=>handleButtonClick(action, isYearly, "subtiter_level3")} 
                        isCurrentPlan={subscriptionPlan === "subtiter_level3"}
                        planId="subtiter_level3"
                        />
                    </PricingCard>
                </PricingCardSubscriptionWrapper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      </>
    );
};

export default ManageSubscription;