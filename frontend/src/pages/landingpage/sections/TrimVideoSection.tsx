import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';
import TouchAppIcon from "@mui/icons-material/TouchApp";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const TrimVideoSection = () => {
  const [gifError, setGifError] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [smallVideosReady, setSmallVideosReady] = useState<{ [key: number]: boolean }>({});

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
              mb: 0.5,
              display: 'block',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            TRIM VIDEO
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
            Trim your video to the perfect length
          </Typography>
          
          {/* Description */}
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#000000', 
              lineHeight: 1.6, 
              fontWeight: '300',
              fontFamily: "'Kelson Sans', 'Inter', sans-serif",
              mb: 0,
              display: 'block'
            }}
          >
            Easily trim your videos with our intuitive interface. Drag to select the perfect segment and create professional clips in seconds.
          </Typography>
        </Box>

        {/* Main Video Preview */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0 }}>
          <Box
            sx={{
              bgcolor: '#ffffff',
              borderRadius: 4,
              overflow: 'hidden',
              width: '100%',
              maxWidth: '576px',
              aspectRatio: '16/9',
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
                src="/landingpageshortthumbnails/landingpagefeature2thumbnail/landingpagefeature2thumbnail_384w.avif"
                alt="Trim video thumbnail"
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
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                opacity: isVideoReady ? 1 : 0,
                transition: 'opacity 0.3s ease',
                position: 'relative',
                zIndex: 2
              }}
            >
              <source src="https://peralabs.co.uk/assets/subtiter/landingpage_trim_sample_1_480px.mp4" type="video/mp4" />
            </video>
          </Box>
        </Box>

        {/* Visual Container - Centered and Larger */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -6 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: '100%',
              maxWidth: '576px',
              height: '280px',
              overflow: 'visible',
              pt: 0,
              mt: 0,
            }}
          >
            {!gifError ? (
              <Box
                component="img"
                src="/trim-video-preview.gif"
                alt="Trim Video Preview"
                onError={() => setGifError(true)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: 2,
                }}
              />
            ) : (
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  overflow: 'visible',
                  pt: 0,
                  mt: 0,
                }}
              >
                {/* Main Black Box with Yellow Border - Larger */}
                <Box
                  sx={{
                    position: 'relative',
                    bgcolor: '#000000',
                    borderTop: '5px solid rgb(255, 239, 95)',
                    borderBottom: '5px solid rgb(255, 239, 95)',
                    borderLeft: '10px solid rgb(255, 239, 95)',
                    borderRight: '10px solid rgb(255, 239, 95)',
                    borderRadius: 3,
                    padding: '10px',
                    display: 'flex',
                    gap: '3px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    animation: 'trimVideo 3s ease-in-out infinite',
                    '@keyframes trimVideo': {
                      '0%': {
                        width: '576px',
                      },
                      '40%': {
                        width: '576px',
                      },
                      '70%': {
                        width: '288px',
                      },
                      '85%': {
                        width: '288px',
                      },
                      '100%': {
                        width: '576px',
                      },
                    },
                  }}
                >
                  {/* Left Arrow */}
                  <ChevronLeftIcon
                    sx={{
                      position: 'absolute',
                      left: '4px',
                      color: '#ffffff',
                      fontSize: '28px',
                      zIndex: 10,
                    }}
                  />
                  
                  {/* 9:16 Aspect Ratio Small Videos - Larger */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].map((index) => (
                    <Box
                      key={index}
                      sx={{
                        width: '48px',
                        height: '84px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 2px rgba(255, 255, 255, 0.1)',
                        position: 'relative',
                      }}
                    >
                      {/* Thumbnail for small videos */}
                      {!smallVideosReady[index] && (
                        <Box
                          component="img"
                          src="/landingpageshortthumbnails/landingpagefeature2thumbnail/landingpagefeature2thumbnail_128w.avif"
                          alt="Small video thumbnail"
                          loading="lazy"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 1,
                            opacity: smallVideosReady[index] ? 0 : 1,
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
                        onCanPlay={() => setSmallVideosReady(prev => ({ ...prev, [index]: true }))}
                        onLoadedMetadata={() => setSmallVideosReady(prev => ({ ...prev, [index]: true }))}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          opacity: smallVideosReady[index] ? 1 : 0,
                          transition: 'opacity 0.3s ease',
                          position: 'relative',
                          zIndex: 2
                        }}
                      >
                        <source src="https://cdn.midjourney.com/video/f96bcd37-1a0e-42ba-b91e-096d4e7024e1/2.mp4" type="video/mp4" />
                      </video>
                    </Box>
                  ))}
                  
                  {/* Right Arrow */}
                  <ChevronRightIcon
                    sx={{
                      position: 'absolute',
                      right: '4px',
                      color: '#ffffff',
                      fontSize: '28px',
                      zIndex: 10,
                    }}
                  />
                </Box>
                
                {/* Trim Bar - Synced with Video - Larger */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '288px',
                    height: '6px',
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 2,
                    overflow: 'visible',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: '288px',
                      bgcolor: '#000000',
                      borderRadius: 2,
                      animation: 'trimBar 3s ease-in-out infinite',
                      overflow: 'visible',
                      cursor: 'default',
                      '@keyframes trimBar': {
                        '0%': {
                          width: '288px',
                        },
                        '20%': {
                          width: '288px',
                        },
                        '40%': {
                          width: '144px',
                        },
                        '60%': {
                          width: '144px',
                        },
                        '80%': {
                          width: '288px',
                        },
                        '100%': {
                          width: '288px',
                        },
                      },
                    }}
                  >
                    {/* Drag Handle Circle - Larger */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        right: 0,
                        transform: 'translate(50%, -50%)',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        bgcolor: '#000000',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        zIndex: 100,
                      }}
                    />
                    {/* Cursor Icon - Larger */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '60%',
                        right: '-2px',
                        transform: 'translate(50%, -30%)',
                        pointerEvents: 'none',
                        zIndex: 101,
                      }}
                    >
                      <TouchAppIcon 
                        sx={{ 
                          fontSize: '36px', 
                          color: '#ffeb3b',
                        }} 
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default TrimVideoSection;

