import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    AppBar,
    Toolbar
  } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import klippersLogo from '../../public/klippersnewlogo.png';

const NavBarOuter = () => {

    const location = useLocation();


return (
<>
<AppBar 
        position="fixed"
sx={{ 
  bgcolor: 'rgba(245, 245, 245, 0.95)',
  backdropFilter: 'blur(8px)',
  zIndex: 1000,
  py: 0.4,
  transition: 'all 0.3s ease',
  boxShadow: 'none',
  mt: { xs: 2, md: 0 }
}}
>
<Container maxWidth="xl">
  <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Box 
        component={RouterLink}
        to="/"
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          textDecoration: 'none',
          cursor: 'pointer'
        }}
      >
                      <img 
        src={klippersLogo} 
        alt="Klippers Logo" 
        style={{ 
          width: 32, 
          height: 32,
          objectFit: 'contain'
        }} 
        tabIndex={-1}
        onFocus={(e) => e.target.blur()}
      />
        <Typography variant="h6" sx={{ 
          fontWeight: '800', 
          color: '#000000',
          fontFamily: "'Inter', sans-serif",
          outline: 'none',
          '&:focus': {
            outline: 'none',
            boxShadow: 'none'
          }
        }}>
          Klippers
        </Typography>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
                    <Button 
      component={RouterLink}
      to="/pricing"
      variant="text" 
      className="button-hover-effect"
      sx={{ 
                              borderRadius: 12,
          px: 2.5,
          py: 0.8,
          fontSize: '0.875rem',
          fontFamily: "'Inter', sans-serif",
          color: '#000000',
          transition: 'all 0.3s ease',
          textTransform: 'capitalize',
          fontWeight: '600',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'none',
                          '&:hover': {
          bgcolor: 'rgba(90, 78, 255, 0.1)',
          boxShadow: 'none',
        },
        '&:focus': {
          bgcolor: 'rgba(90, 78, 255, 0.2)',
          outline: '2px solid #5a4eff',
          outlineOffset: '2px',
          boxShadow: 'none',
        }
          }}
      >
          Pricing
        </Button>
      </Box>
    </Box>

    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      
      {location.pathname !== '/login' && (
      <Button 
        component={RouterLink}
        to="/login"
        variant="text" 
        className="button-hover-effect"
        sx={{ 
                          borderRadius: 12,
        px: 2.5,
        py: 0.8,
        fontSize: '0.875rem',
        fontFamily: "'Inter', sans-serif",
        color: '#000000',
        transition: 'all 0.3s ease',
        textTransform: 'capitalize',
        fontWeight: '600',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'none',
        '&:hover': {
          bgcolor: 'rgba(90, 78, 255, 0.1)',
          boxShadow: 'none',
        },
        '&:focus': {
          bgcolor: 'rgba(90, 78, 255, 0.2)',
          outline: '2px solid #5a4eff',
          outlineOffset: '2px',
          boxShadow: 'none',
        }
        }}
      >
        Login
      </Button>
      )}
        {location.pathname !== '/create-account' && (
      <Button 
        component={RouterLink}
        to="/create-account"
        variant="contained" 
        className="button-hover-effect"
        sx={{ 
                          borderRadius: 12,
        px: 2.5,
        py: 0.8,
        fontSize: '0.875rem',
        fontFamily: "'Inter', sans-serif",
        background: '#000000',
        color: 'white',
        transition: 'all 0.3s ease',
        textTransform: 'capitalize',
        fontWeight: '700',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'none',
        '&:hover': {
          background: '#1a1a1a',
          boxShadow: 'none',
        },
        '&:focus': {
          background: '#1a1a1a',
          outline: '2px solid #e05a29',
          outlineOffset: '2px',
          boxShadow: 'none',
        }
        }}
      >
        Sign Up
      </Button>
      )}
    </Box>
  </Toolbar>
</Container>
</AppBar>
</>
  );
};

export default NavBarOuter;