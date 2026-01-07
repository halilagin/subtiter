import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

interface Slide1ContentProps {
  videoContainerRef: React.RefObject<HTMLDivElement>;
  rectanglePositions: { top: number; left: number }[];
  labelBoxStyle: any;
}

const Slide1Content: React.FC<Slide1ContentProps> = ({ 
  videoContainerRef, 
  rectanglePositions, 
  labelBoxStyle 
}) => {
  const [beforeVideoReady, setBeforeVideoReady] = useState(false);
  const [afterVideoReady, setAfterVideoReady] = useState(false);

  return (
    <Grid container spacing={{ xs: 3, md: 5 }} alignItems="center" justifyContent="center" sx={{ mt: { xs: 4, md: 0 } }}>
      {/* Before Video */}
      <Grid item xs={12} md={5}>
        <Box sx={{ textAlign: 'center', mb: { xs: 1, md: 2 } }}>
          <Box ref={videoContainerRef} sx={{
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#000',
            aspectRatio: '16/9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: { xs: 1.5, md: 2 },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            minHeight: { xs: '120px', md: '190px' },
            transform: 'scale(1.0)',
            maxWidth: { xs: '90%', md: '360px' },
            mx: 'auto'
          }}>
            {/* Thumbnail for Before video */}
            {!beforeVideoReady && (
              <Box
                component="img"
                src="/landingpageshortthumbnails/landingpageslide1thumbnail/landingpageslide1thumbnail_256w.avif"
                alt="Before video thumbnail"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center bottom',
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
                objectFit: 'contain',
                objectPosition: 'center bottom',
                borderRadius: '8px',
                opacity: beforeVideoReady ? 1 : 0,
                transition: 'opacity 0.3s ease',
                position: 'relative',
                zIndex: 2
              }}
            >
              <source src="https://peralabs.co.uk/assets/subtiter/subtiter_ai_examples/podcast_sample.smaller240.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {rectanglePositions.map((pos, rectIndex) => (
              <Box key={rectIndex}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: `${pos.top}px`,
                    left: `${pos.left}px`,
                    width: { xs: '50px', md: '75px' },
                    height: { xs: '50px', md: '75px' },
                    background: 'rgba(255, 255, 0, 0.3)',
                    border: '2px solid rgba(255, 255, 0, 0.5)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: `${pos.top - 10}px`,
                    left: `${pos.left + 20}px`,
                    bgcolor: '#ffff00',
                    color: '#000000',
                    fontSize: { xs: '0.6rem', md: '0.8rem' },
                    fontWeight: 700,
                    px: { xs: 1, md: 1.5 },
                    py: { xs: 0.3, md: 0.5 },
                    borderRadius: 20,
                    textAlign: 'center',
                    minWidth: { xs: '20px', md: '30px' }
                  }}
                >
                  AI
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{
            mt: { xs: 1.5, md: 2 },
            display: 'inline-block',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 10,
            px: { xs: 2, md: 2.5 },
            py: { xs: 0.8, md: 1 }
          }}>
            <Box sx={{ color: '#000000', fontSize: { xs: '0.9rem', md: '1rem' }, fontWeight: 600 }}>
              Before
            </Box>
          </Box>
        </Box>
      </Grid>

      {/* Arrow Icon */}
      <Grid item xs={12} md={2} sx={{ 
        display: { xs: 'none', md: 'flex' }, 
        justifyContent: 'center', 
        alignItems: 'center',
        order: { xs: 2, md: 0 },
        transform: 'translateY(-40px)'
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
        <Box sx={{ textAlign: 'center', mb: { xs: 1, md: 2 }, transform: { xs: 'translateX(0)', md: 'translateX(-40px)' } }}>
          <Box sx={{
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#000',
            aspectRatio: '9/16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: { xs: 1.5, md: 2 },
            mx: 'auto',
            maxWidth: { xs: '160px', md: '230px' },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            minHeight: { xs: '240px', md: '330px' },
            transform: 'scale(1.0)'
          }}>
            {/* Thumbnail for After video */}
            {!afterVideoReady && (
              <Box
                component="img"
                src="/landingpageshortthumbnails/landingpageslide1-2thumbnail/landingpageslide1-2thumbnail_128w.avif"
                alt="After video thumbnail"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
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
                borderRadius: '8px',
                opacity: afterVideoReady ? 1 : 0,
                transition: 'opacity 0.3s ease',
                position: 'relative',
                zIndex: 2
              }}
            >
              <source src="https://peralabs.co.uk/assets/subtiter/subtiter_ai_examples/segment_2_with_subtitles.smaller240.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
          <Box sx={{
            mt: { xs: 1.5, md: 2 },
            display: 'inline-block',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 10,
            px: { xs: 2, md: 2.5 },
            py: { xs: 0.8, md: 1 }
          }}>
            <Box sx={{ color: '#000000', fontSize: { xs: '0.9rem', md: '1rem' }, fontWeight: 600 }}>
              After
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Slide1Content;

