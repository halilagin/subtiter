

import {
    Box,
    Typography,
  } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import subtiterLogo2 from '../../../public/subtiternewlogo.png';
import LandingPageVideoInput from '@/components/LandingPageVideoInput';


const HeroCenter = () => {
  return (
    <>
    
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h1" sx={{ 
            fontWeight: '700', 
            mb: 4, 
            color: '#000000',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3.2rem', lg: '3.6rem' },
            lineHeight: { xs: 1.1, md: 1.05 },
            letterSpacing: { xs: '-0.02em', md: '-0.03em' },
            fontFamily: "'Kelson Sans', 'Inter', sans-serif",

          }}>
            Where AI Meets The Power of Going Viral
          </Typography>
          <Typography variant="h2" sx={{ 
            fontWeight: '300', 
            mb: 6, 
            color: '#000000',
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontFamily: "'Kelson Sans', 'Inter', sans-serif"
          }}>
            Transform your long videos into viral moments with the power of AI.
          </Typography>
          
              

          <LandingPageVideoInput /> 
        </Box>
    
    </>
  );
};

export default HeroCenter;