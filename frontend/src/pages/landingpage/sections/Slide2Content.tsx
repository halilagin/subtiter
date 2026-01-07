import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { TouchApp } from '@mui/icons-material';
import CaptionStyleSegment from './secondslidecomponents/CaptionStyleSegment';
import { subtitleStyles } from './secondslidecomponents/SubtitleStyles';



interface Slide2ContentProps {
  videoContainerRef: React.RefObject<HTMLDivElement>;
  rectanglePositions: { top: number; left: number }[];
  labelBoxStyle: any;
}

const Slide2Content: React.FC<Slide2ContentProps> = ({ 
  videoContainerRef, 
  rectanglePositions, 
  labelBoxStyle 
}) => {
  const [autoHoverIndex, setAutoHoverIndex] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Auto hover effect - cycles through each subtitle
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoHoverIndex((prev) => (prev + 1) % 5); // 5 subtitles total
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Grid container spacing={{ xs: 3, md: 5 }} alignItems="center" justifyContent="center">
      {/* Left - Landscape Container */}
      <Grid item xs={12} md={7}>
        <Box sx={{ textAlign: 'center', mb: { xs: 1, md: 2 } }}>
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
            minHeight: { xs: '180px', md: '250px' },
            transform: 'scale(1.0)',
            maxWidth: { xs: '100%', md: '500px' },
            mx: 'auto'
          }}>
            {/* Thumbnail - shown until video loads */}
            {!isVideoReady && (
              <Box
                component="img"
                src="/landingpageshortthumbnails/landingpageslide2thumbnail/landingpageslide2thumbnail_384w.avif"
                alt="Video thumbnail"
                loading="eager"
                fetchPriority="high"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
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
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 20%',
                opacity: isVideoReady ? 1 : 0,
                transition: 'opacity 0.3s ease',
                position: 'relative',
                zIndex: 2
              }}
            >
              <source src="https://peralabs.co.uk/assets/subtiter/landingpagevideo1.smaller240.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Subtitle Overlay */}
            {autoHoverIndex !== 0 && (
              <Box sx={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                maxWidth: '80%',
                textAlign: 'center'
              }}>
                {subtitleStyles[autoHoverIndex].icon}
              </Box>
            )}
          </Box>
        </Box>
      </Grid>

      {/* Right - Portrait Container */}
      <Grid item xs={12} md={5}>
        <Box sx={{ textAlign: 'center', mb: { xs: 1, md: 2 } }}>
          <Box sx={{
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(60px)',
            WebkitBackdropFilter: 'blur(60px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            mx: 'auto',
            maxWidth: { xs: '100%', sm: '350px', md: '300px' },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transform: 'scale(1.0)',
            py: { xs: 2, md: 2.5 },
            pb: { xs: 2.5, md: 3 },
            gap: { xs: 1.5, md: 2 }
          }}>
            {/* Subtitles Title */}
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.95)', 
              fontSize: { xs: '0.9rem', md: '1rem' }, 
              fontWeight: 600,
              textAlign: 'left',
              width: '90%'
            }}>
              Subtitles
            </Typography>

            {/* Caption Styles */}
            <Box sx={{ width: '90%', display: 'flex', flexDirection: 'column', gap: { xs: 1.2, md: 1.5 } }}>
              {subtitleStyles.map((style, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    zIndex: autoHoverIndex === index ? 10 : 1,
                  }}
                >
                  <CaptionStyleSegment 
                    label={style.label} 
                    isHighlighted={autoHoverIndex === index}
                    isHovered={autoHoverIndex === index}
                  >
                    {style.icon}
                    {autoHoverIndex === index && (
                      <TouchApp
                        sx={{
                          position: 'absolute',
                          top: '80%',
                          right: '15%',
                          transform: 'translateY(-50%) rotate(-5deg)',
                          fontSize: '32px',
                          color: '#ffffff',
                          
                          filter: 'drop-shadow(1px 1px 1px #000000)',
                          zIndex: 20,
                          pointerEvents: 'none'
                        }}
                      />
                    )}
                  </CaptionStyleSegment>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Slide2Content;

