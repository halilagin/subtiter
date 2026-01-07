import React from 'react';
import { Box, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const InnerPageBreadCumb = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleDashboardClick = () => {
    navigate('/in/dashboard');
  };

  const handleSubscriptionClick = () => {
    navigate('/in/subscription');
  };

  const getBreadcrumbParts = () => {
    if (location.pathname.includes('/list-shorts/')) {
      return ['Dashboard', 'Your Shorts'];
    } else if (location.pathname.includes('/list-subtitles/')) {
      return ['Dashboard', 'Your Subtitles'];
    } else if (location.pathname.includes('/account')) {
      return ['Dashboard', 'Account'];
    } else if (location.pathname.includes('/subscription/pay-for-upgrade')) {
      return ['Dashboard', 'Subscription', 'Payment'];
    } else if (location.pathname.includes('/subscription') || location.pathname.includes('/billing')) {
      return ['Dashboard', 'Subscription'];
    } else {
      return ['Dashboard'];
    }
  };

  const getMainTitle = () => {
    if (location.pathname.includes('/list-shorts/')) {
      return 'Your Shorts';
    } else if (location.pathname.includes('/list-subtitles/')) {
      return 'Your Subtitles';
    } else if (location.pathname.includes('/account')) {
      return 'Personal Details';
    } else if (location.pathname.includes('/subscription/pay-for-upgrade')) {
      return 'Pay For Upgrade';
    } else if (location.pathname.includes('/subscription') || location.pathname.includes('/billing')) {
      return 'Subscription Management';
    } else if (location.pathname.includes('/apply-promotion-code')) {
      return 'Apply Promotion Code';
    } else if (location.pathname.includes('/billing')) {
      return 'Billing';
    } else {
      return 'Your videos';
    } 
  };

  return (
    <Box sx={{ mb: 6, width: '100%', pl: { xs: 2, md: 0 } }}>
      {/* Dashboard Title */}
      <Box sx={{ 
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        width: '100%'
      }}>
        {getBreadcrumbParts().map((part, index) => {
          const isSubscription = part === 'Subscription';
          
          return (
            <React.Fragment key={index}>
              {index === 0 ? (
                <Typography 
                  variant="body1" 
                  onClick={handleDashboardClick}
                  sx={{ 
                    fontWeight: '500', 
                    color: '#808080',
                    fontSize: '0.875rem',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    '&:hover': {
                      color: '#2f2e2c'
                    }
                  }}
                >
                  {part}
                </Typography>
              ) : (
                <>
                  <ChevronRight sx={{ fontSize: '1rem', color: '#808080' }} />
                  <Typography 
                    variant="body1" 
                    onClick={isSubscription ? handleSubscriptionClick : undefined}
                    sx={{ 
                      fontWeight: '400', 
                      color: '#808080',
                      fontSize: '0.875rem',
                      letterSpacing: '0.05em',
                      ...(isSubscription && {
                        cursor: 'pointer',
                        '&:hover': {
                          color: '#2f2e2c'
                        }
                      })
                    }}
                  >
                    {part}
                  </Typography>
                </>
              )}
            </React.Fragment>
          );
        })}
      </Box>
      
      {/* Main Title */}
      <Typography variant="h4" sx={{ 
        fontWeight: '700', 
        color: '#2f2e2c',
        textAlign: 'left',
        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
        lineHeight: { xs: 1.1, md: 1.05 },
        letterSpacing: { xs: '-0.02em', md: '-0.03em' },
        fontFamily: "'Inter', sans-serif",
        width: '100%',
        display: 'block'
      }}>
        {getMainTitle()}
      </Typography>
    </Box>
  );
};

export default InnerPageBreadCumb; 