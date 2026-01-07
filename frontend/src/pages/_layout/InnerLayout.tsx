import React from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import NavBarInner from '@/components/NavBarInner';
import InnerPageBreadCumb from '@/pages/dashboard/dashboard/DashboardHeader';
import { Box } from '@mui/material';

const InnerProtectedLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        height: '100%',
        width: '100vw',
        backgroundColor: '#f5f5f5'
      }}>
        {/* Navigation Header */}
        <NavBarInner />
        
        {/* Three Column Layout */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'row',
          width: '100%',
          overflow: 'auto'
        }}>
          {/* Left Column - Empty (15%) */}
          <Box sx={{ 
            width: '15%',
            flexShrink: 0,
            display: { xs: 'none', md: 'block' }
          }} />
          
          {/* Middle Column - Content (70%) */}
          <Box sx={{ 
            width: { xs: '100%', md: '70%' },
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            px: { xs: 2, sm: 3, md: 4 },
            py: 4
          }}>
            <InnerPageBreadCumb />
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              width: '100%'
            }}>
              <Outlet />
            </Box>
          </Box>
          
          {/* Right Column - Empty (15%) */}
          <Box sx={{ 
            width: '15%',
            flexShrink: 0,
            display: { xs: 'none', md: 'block' }
          }} />
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

export default InnerProtectedLayout;
