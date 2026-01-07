import React from 'react';
import { Box, Container } from '@mui/material';
import NavBar from '@/components/NavBarOuter';
import CreateAccountForm from './CreateAccountForm';

const CreateAccountPage = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 80px)',
        py: 4
      }}>
        <Box sx={{ maxWidth: '480px', width: '100%', px: 3 }}>
          <CreateAccountForm />
        </Box>
      </Box>
    </Box>
  );
};

export default CreateAccountPage;
