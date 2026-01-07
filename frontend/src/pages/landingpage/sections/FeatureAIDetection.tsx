import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
} from '@mui/material';

const SubtiterFeaturesAIDetection = () => {
  const [isVideoReady, setIsVideoReady] = useState(false);

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
              width: '100%',
              maxWidth: '576px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: '1px solid #e5e7eb',
              position: 'relative'
            }}
          >
            {/* Thumbnail - shown until video loads */}
            {!isVideoReady && (
              <Box
                component="img"
                src="/landingpageshortthumbnails/landingpagefeature1thumbnail/landingpagefeature1thumbnail_384w.avif"
                alt="AI Detection video thumbnail"
                loading="eager"
                fetchPriority="high"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 1,
                  opacity: isVideoReady ? 0 : 1,
                  transition: 'opacity 0.3s ease'
                }}
              />
            )}
            
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onCanPlay={() => setIsVideoReady(true)}
              onLoadedMetadata={() => setIsVideoReady(true)}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                opacity: isVideoReady ? 1 : 0,
                transition: 'opacity 0.3s ease',
                position: 'relative',
                zIndex: 2
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

