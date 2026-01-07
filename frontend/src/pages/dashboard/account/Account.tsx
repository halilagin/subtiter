import React from 'react';
import { Box } from '@mui/material';
import PersonalDetailsForm from './PersonalDetailsForm';

const Account = () => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      width: '100%',
      height: '100%'
    }}>
      <PersonalDetailsForm />
      
    </Box>
  );
};

export default Account; 