import React from 'react';
import { Box } from '@mui/material';
import BillingDetails from './BillingDetails';

const Billing = () => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      width: '100%',
      height: '100%'
    }}>
      <BillingDetails />
    </Box>
  );
};

export default Billing; 