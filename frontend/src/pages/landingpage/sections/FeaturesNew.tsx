import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
} from '@mui/material';

const SubtiterFeaturesAIDetection = () => {
  return (
    <Box sx={{ bgcolor: '#f5f5f5', pt: 20, pb: 16 }}>
      <Container maxWidth="xl">
        {/* Text Content - Centered */}
        <Box sx={{ textAlign: 'center', mb: 8, maxWidth: '900px', mx: 'auto' }}>
          {/* Subtitle */}
          <Typography 
            variant="overline" 
            sx={{ 
              color: '#000000',
              fontWeight: '700',
              fontSize: '0.75rem',
              
              mb: 2,
              display: 'block',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            AI DETECTION
          </Typography>
          
          {/* Main Title */}
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: '700', 
              mb: 3, 
              lineHeight: 1.3, 
              color: '#000000',
              fontFamily: "'Kelson Sans', 'Inter', sans-serif"
            }}
          >
            Let AI find your next viral moment
          </Typography>
          
          {/* Description */}
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#000000', 
              lineHeight: 1.6, 
              fontWeight: '300',
              fontFamily: "'Kelson Sans', 'Inter', sans-serif"
            }}
          >
            Smart detection technology identifies your best scenes and turns them into share-worthy clips in seconds.
          </Typography>
        </Box>

        {/* Visual Container - Centered */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box 
            sx={{ 
              bgcolor: '#ffffff', 
              borderRadius: 4, 
              overflow: 'hidden',
              height: 500, 
              width: '100%',
              maxWidth: '900px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: '1px solid #e5e7eb' 
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '480px',
                height: 'auto',
                objectFit: 'cover',
                transform: 'scale(1.2)'
              }}
            >
              <source src="https://peralabs.co.uk/assets/subtiter/landingpage_aidetection_480p.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SubtiterFeaturesAIDetection;

