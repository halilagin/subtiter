import React from 'react';
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Person,
  BarChart,
  CreditCard,
  Logout
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ProfileDropdownProps {
  profileMenuAnchor: HTMLElement | null;
  onProfileMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onProfileMenuClose: () => void;
}

const ProfileDropdown = ({ 
  profileMenuAnchor, 
  onProfileMenuOpen, 
  onProfileMenuClose 
}: ProfileDropdownProps) => {
  const navigate = useNavigate();
  
  // Get user's first name initial (you can replace this with actual user data)
  const getUserInitial = () => {
    // For now, using hardcoded name. In real app, this would come from user context/state
    const firstName = 'John'; // Replace with actual user data
    return firstName.charAt(0).toUpperCase();
  };

  const handleMenuAction = (action: string) => {
    console.log(`${action} clicked`);
    onProfileMenuClose();
    
    switch (action) {
      case 'Account':
        navigate('/in/account');
        break;
      // case 'Usage':
      //   navigate('/in/usage');
      //   break;
      case 'Subscription':
        navigate('/in/subscription');
        break;
      case 'Billing':
        navigate('/in/billing');
        break;
      case 'ApplyPromotionCode':
        navigate('/in/apply-promotion-code');
        break;
      case 'Log out':
        // Handle logout logic here
        console.log('Logging out...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        navigate('/');
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* Profile Avatar */}
      <Avatar 
        sx={{ 
          width: 40, 
          height: 40, 
          bgcolor: '#000000',
          color: 'white',
          cursor: 'pointer',
          fontWeight: '600',
          fontFamily: "'Inter', sans-serif",
          '&:hover': {
            bgcolor: '#333333'
          }
        }}
        onClick={onProfileMenuOpen}
      >
        <Person sx={{ fontSize: 24 }} />
      </Avatar>

      {/* Profile Dropdown Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={onProfileMenuClose}
        disableScrollLock={true}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 4,
            boxShadow: 'none',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            bgcolor: 'white',
            '& .MuiMenuItem-root': {
              py: 1.5,
              px: 2.5,
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#2f2e2c',
              fontFamily: "'Inter', sans-serif",
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
              '&:last-child': {
                '&:hover': {
                  bgcolor: '#f5f5f5',
                }
              }
            },
            '& .MuiListItemIcon-root': {
              minWidth: 36,
              mr: 2
            },
            '& .MuiListItemText-primary': {
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#2f2e2c',
              fontFamily: "'Inter', sans-serif"
            }
          }
        }}
      >
        <MenuItem onClick={() => handleMenuAction('Account')}>
          <ListItemIcon>
            <Person sx={{ fontSize: 22, color: '#6b7280' }} />
          </ListItemIcon>
          <ListItemText primary="Account" />
        </MenuItem>
        {/* <MenuItem onClick={() => handleMenuAction('Usage')}>
          <ListItemIcon>
            <BarChart sx={{ fontSize: 22, color: '#6b7280' }} />
          </ListItemIcon>
          <ListItemText primary="Usage" />
        </MenuItem> */}
        <MenuItem onClick={() => handleMenuAction('Billing')}>
          <ListItemIcon>
            <CreditCard sx={{ fontSize: 22, color: '#6b7280' }} />
          </ListItemIcon>
          <ListItemText primary="Billing" />
        </MenuItem>

        <MenuItem onClick={() => handleMenuAction('ApplyPromotionCode')}>
          <ListItemIcon>
            <CreditCard sx={{ fontSize: 22, color: '#6b7280' }} />
          </ListItemIcon>
          <ListItemText primary="Apply Promotion Code" />
        </MenuItem>
        
        <MenuItem onClick={() => handleMenuAction('Subscription')}>
          <ListItemIcon>
            <CreditCard sx={{ fontSize: 22, color: '#6b7280' }} />
          </ListItemIcon>
          <ListItemText primary="Subscription" />
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('Log out')}>
          <ListItemIcon>
            <Logout sx={{ fontSize: 22, color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText primary="Sign out" sx={{ '& .MuiListItemText-primary': { color: '#ef4444', fontWeight: 600 } }} />
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileDropdown; 