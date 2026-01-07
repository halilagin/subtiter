import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';

interface Slide3ContentProps {
  videoContainerRef: React.RefObject<HTMLDivElement>;
  rectanglePositions: { top: number; left: number }[];
  labelBoxStyle: any;
}

type AspectRatio = '1/1' | '9/16' | '16/9';

const Slide3Content: React.FC<Slide3ContentProps> = ({ 
  videoContainerRef, 
  rectanglePositions, 
  labelBoxStyle 
}) => {
  const aspectRatios: AspectRatio[] = ['1/1', '9/16', '16/9'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const aspectRatio = aspectRatios[currentIndex];
  const [beforeVideoReady, setBeforeVideoReady] = useState(false);
  const [afterVideoReady, setAfterVideoReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % aspectRatios.length);
    }, 2000); // Her 2 saniyede bir değişir

    return () => clearInterval(interval);
  }, []);

  const getMaxWidth = () => {
    switch (aspectRatio) {
      case '1/1': return { xs: '200px', md: '280px' };
      case '9/16': return { xs: '180px', md: '230px' };
      case '16/9': return { xs: '100%', md: '380px' };
    }
  };

  const getMinHeight = () => {
    switch (aspectRatio) {
      case '1/1': return { xs: '200px', md: '280px' };
      case '9/16': return { xs: '250px', md: '330px' };
      case '16/9': return { xs: '180px', md: '240px' };
    }
  };

  return (
    <Grid container spacing={{ xs: 3, md: 5 }} alignItems="center" justifyContent="center">
      {/* Before Video */}
      <Grid item xs={12} md={5}>
        <Box sx={{ textAlign: 'center', mb: { xs: 1, md: 2 }, mt: { xs: 0, md: 0 } }}>
          <Box sx={{
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#000',
            aspectRatio: '16/9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            minHeight: { xs: '120px', md: '140px' },
            transform: 'scale(1.0)',
            maxWidth: { xs: '100%', md: '320px' },
            mx: 'auto'
          }}>
            {/* Thumbnail - shown until video loads */}
            {!beforeVideoReady && (
              <Box
                component="img"
                src="/landingpageshortthumbnails/landingpageslide3thumbnail/landingpageslide3thumbnail_256w.avif"
                alt="Before video thumbnail"
                loading="eager"
                fetchPriority="high"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 10%',
                  borderRadius: '8px',
                  zIndex: 1,
                  opacity: beforeVideoReady ? 0 : 1,
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
              onCanPlay={() => setBeforeVideoReady(true)}
              onLoadedMetadata={() => setBeforeVideoReady(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 10%',
                borderRadius: '8px',
                opacity: beforeVideoReady ? 1 : 0,
                transition: 'opacity 0.3s ease',
                position: 'relative',
                zIndex: 2
              }}
            >
              <source src="https://peralabs.co.uk/assets/subtiter/landingpagevideo2.smaller240.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 1, 
              color: '#ffffff', 
              fontSize: '0.9rem',
              fontWeight: 600,
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}
          >
            Original
          </Typography>
        </Box>
      </Grid>

      {/* Logo */}
      <Grid item xs={12} md={2} sx={{ 
        display: { xs: 'none', md: 'flex' }, 
        justifyContent: 'center', 
        alignItems: 'center',
        transform: 'translateY(-20px)',
        pl: 3
      }}>
        <img
          src="/logogif.gif"
          alt="Logo"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      </Grid>

      {/* After Video */}
      <Grid item xs={12} md={5} sx={{ order: { xs: 1, md: 0 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 1, md: 2 } }}>
          <Box sx={{
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#000',
            aspectRatio: aspectRatio,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: { xs: 1.5, md: 2 },
            mx: 'auto',
            maxWidth: getMaxWidth(),
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            minHeight: getMinHeight(),
            transform: 'scale(1.0)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            {/* Thumbnail - shown until video loads */}
            {!afterVideoReady && (
              <Box
                component="img"
                src="/landingpageshortthumbnails/landingpageslide3thumbnail/landingpageslide3thumbnail_256w.avif"
                alt="After video thumbnail"
                loading="eager"
                fetchPriority="high"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 10%',
                  borderRadius: '8px',
                  zIndex: 1,
                  opacity: afterVideoReady ? 0 : 1,
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
              onCanPlay={() => setAfterVideoReady(true)}
              onLoadedMetadata={() => setAfterVideoReady(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 10%',
                borderRadius: '8px',
                opacity: afterVideoReady ? 1 : 0,
                transition: 'opacity 0.3s ease',
                position: 'relative',
                zIndex: 2
              }}
            >
              <source src="https://peralabs.co.uk/assets/landingpage_aireframe_output_sample_1.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
          
          {/* Aspect Ratio Label */}
          <Box sx={{
            mt: { xs: 1.5, md: 2 },
            display: 'inline-block',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 10,
            px: { xs: 2, md: 2.5 },
            py: { xs: 0.8, md: 1 }
          }}>
            <Typography sx={{
              color: '#000000',
              fontSize: { xs: '0.9rem', md: '1rem' },
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}>
              {aspectRatio.replace('/', ':')}
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Slide3Content;

