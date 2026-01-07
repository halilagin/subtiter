import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';


const NavBarInner = () => {
  const navigate = useNavigate();
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogoClick = () => {
    navigate('/in/dashboard');
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{ 
          bgcolor: 'rgba(245, 245, 245, 0.95)', 
          backdropFilter: 'blur(8px)', 
          boxShadow: 'none', 
          py: 0.4,
          mt: { xs: 2, md: 0 }
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', pl: { xs: 2, md: 0 } }}>
            {/* Logo */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8
                }
              }}
              onClick={handleLogoClick}
            >
            
              <Typography variant="h6" sx={{ 
                fontWeight: '800', 
                color: '#2f2e2c',
                fontFamily: "'Inter', sans-serif"
              }}>
                Subtiter
              </Typography>
            </Box>

            {/* Profile Dropdown */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, pr: { xs: 2, md: 0 } }}>
              <ProfileDropdown
                profileMenuAnchor={profileMenuAnchor}
                onProfileMenuOpen={handleProfileMenuOpen}
                onProfileMenuClose={handleProfileMenuClose}
              />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default NavBarInner; 