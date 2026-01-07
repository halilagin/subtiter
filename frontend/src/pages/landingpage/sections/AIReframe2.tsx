import React, { useRef, useState, useLayoutEffect } from 'react';
import { Box, Container, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight, ContentCut, ClosedCaption, CropRotate } from '@mui/icons-material';
import Slide1Content from './Slide1Content';
import Slide2Content from './Slide2Content';
import Slide3Content from './Slide3Content';

const LandingPageProductCarousel = () => {
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 3;

  // Common styles for Before/After labels
  const labelBoxStyle = {
    bgcolor: 'white',
    color: '#000000',
    px: 3,
    py: 0.9,
    borderRadius: 2,
    display: 'inline-block',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '600',
    fontSize: '0.9rem',
    minWidth: '85px',
    textAlign: 'center'
  };

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [rectanglePositions, setRectanglePositions] = useState<{ top: number; left: number }[]>([]);

  useLayoutEffect(() => {
    if (videoContainerRef.current) {
      const { offsetWidth, offsetHeight } = videoContainerRef.current;
      setRectanglePositions([
        { top: offsetHeight * 0.15, left: offsetWidth * 0.12 },
        { top: offsetHeight * 0.15, left: offsetWidth * 0.70 },
      ]);
    }
  }, []);

  // Carousel navigation functions
  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  // Slide content data
  const slides = [
    {
      title: "Turn Any Video into a Short",
      badge: "AI clipping",
      icon: ContentCut,
      component: Slide1Content,
      backgroundVideo: "https://peralabs.co.uk/assets/klippers/klippers_ai_examples/podcast_sample.smaller240.mp4",
      backgroundType: "video",
      thumbnail: "/landingpageshortthumbnails/landingpageslide1thumbnail/landingpageslide1thumbnail_256w.avif"
    },
    {
      title: "AI-Powered Auto-Reframing",
      badge: "AI captioning",
      icon: ClosedCaption,
      component: Slide2Content,
      backgroundVideo: "https://peralabs.co.uk/assets/klippers/klippers_ai_examples/podcast_sample.smaller240.mp4",
      backgroundType: "video",
      thumbnail: "/landingpageshortthumbnails/landingpageslide2thumbnail/landingpageslide2thumbnail_256w.avif"
    },
    {
      title: "Professional Quality Shorts",
      badge: "AI reframe",
      icon: CropRotate,
      component: Slide3Content,
      backgroundVideo: "https://peralabs.co.uk/assets/klippers/klippers_ai_examples/podcast_sample.smaller240.mp4",
      backgroundType: "video",
      thumbnail: "/landingpageshortthumbnails/landingpageslide3thumbnail/landingpageslide3thumbnail_256w.avif"
    }
  ];

  // Track video loading state for each slide
  const [videoLoadedStates, setVideoLoadedStates] = useState<{ [key: number]: boolean }>({});

  return (
    <Box id="features" sx={{ 
      bgcolor: 'transparent', 
      pt: 6,
      pb: 12, 
      color: '#000000',
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Container maxWidth="xl" disableGutters sx={{ position: 'relative', overflow: 'visible', width: '100%' }}>
        {/* Badges - Above slides */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          mb: 4,
          zIndex: 20
        }}>
          {slides.map((slideData, index) => (
                    <Box
                      key={index}
              onClick={() => setCurrentSlide(index)}
                      sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                bgcolor: currentSlide === index ? '#000000' : 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                px: { xs: 2, md: 2.5 },
                py: { xs: 0.8, md: 1 },
                borderRadius: 50,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: { xs: '110px', md: '130px' },
                '&:hover': {
                  bgcolor: currentSlide === index ? '#000000' : 'rgba(0, 0, 0, 0.7)',
                }
              }}
            >
              {React.createElement(slideData.icon, { 
                sx: { fontSize: { xs: 16, md: 18 }, color: 'white' } 
              })}
              <Typography sx={{ 
                color: 'white',
                fontSize: { xs: '0.8rem', md: '0.875rem' },
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif"
              }}>
                {slideData.badge}
              </Typography>
              </Box>
          ))}
              </Box>

        {/* Carousel Wrapper with Peek Effect */}
                <Box sx={{
                  position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '2000px',
          minHeight: '760px'
        }}>
          {slides.map((slideData, index) => {
            const position = index - currentSlide;
            const isActive = index === currentSlide;
            
            return (
              <Box
                key={index}
                sx={{ 
                  background: 'rgba(26, 26, 26, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: 3, 
                  p: 7,
                  maxWidth: '1050px',
                  width: '100%',
                  position: 'absolute',
                  height: '680px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: `translateX(calc(${position * 100}% + ${position * 24}px)) scale(1)`,
                  opacity: isActive ? 1 : 0.35,
                  zIndex: isActive ? 10 : 1,
                  pointerEvents: isActive ? 'auto' : 'none',
                  overflow: 'hidden',
        }}>
          {/* Blurred background video/image */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 1,
            }
          }}>
            {/* Thumbnail - shown until video loads (only for slides with thumbnails) */}
            {slideData.thumbnail && !videoLoadedStates[index] && (
              <Box
                component="img"
                src={slideData.thumbnail}
                alt="Background thumbnail"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'blur(30px)',
                  transform: 'scale(1.1)',
                  opacity: 0.6,
                  zIndex: 0,
                  transition: 'opacity 0.3s ease'
                }}
              />
            )}
            
            {slideData.backgroundType === 'video' ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onCanPlay={() => {
                      setVideoLoadedStates(prev => ({ ...prev, [index]: true }));
                    }}
                    onLoadedMetadata={() => {
                      setVideoLoadedStates(prev => ({ ...prev, [index]: true }));
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                  filter: 'blur(30px)',
                  transform: 'scale(1.1)',
                      opacity: videoLoadedStates[index] ? 0.6 : 0,
                      transition: 'opacity 0.3s ease',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                <source src={slideData.backgroundVideo} type="video/mp4" />
                  </video>
            ) : (
              <img
                src={slideData.backgroundVideo}
                alt="Background"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'blur(30px)',
                  transform: 'scale(1.1)',
                  opacity: 0.6,
                }}
              />
            )}
                </Box>

          {/* Content on top */}
          <Box sx={{ position: 'relative', zIndex: 2, width: '100%' }}>
            {React.createElement(slideData.component, {
              videoContainerRef,
              rectanglePositions,
              labelBoxStyle
            })}
                </Box>
              </Box>
            );
          })}

          {/* Carousel Navigation Buttons */}
          <IconButton
            onClick={handlePrevSlide}
            sx={{
              position: 'absolute',
              left: { xs: '50%', md: 150 },
              top: { xs: 'calc(100% + 20px)', md: '50%' },
              transform: { xs: 'translateX(-60px) translateY(-50%)', md: 'translateY(-50%)' },
              bgcolor: '#000000',
              backdropFilter: 'blur(10px)',
              color: 'white',
              zIndex: 100,
              width: 44,
              height: 44,
              '&:hover': {
                bgcolor: '#000000',
                transform: { xs: 'translateX(-60px) translateY(-50%) scale(1.1)', md: 'translateY(-50%) scale(1.1)' },
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ChevronLeft sx={{ fontSize: 40, fontWeight: 300 }} />
          </IconButton>

          <IconButton
            onClick={handleNextSlide}
            sx={{
              position: 'absolute',
              right: { xs: '50%', md: 150 },
              top: { xs: 'calc(100% + 20px)', md: '50%' },
              transform: { xs: 'translateX(60px) translateY(-50%)', md: 'translateY(-50%)' },
              bgcolor: '#000000',
              backdropFilter: 'blur(10px)',
              color: 'white',
              zIndex: 100,
              width: 44,
              height: 44,
              '&:hover': {
                bgcolor: '#000000',
                transform: { xs: 'translateX(60px) translateY(-50%) scale(1.1)', md: 'translateY(-50%) scale(1.1)' },
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ChevronRight sx={{ fontSize: 40, fontWeight: 300 }} />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPageProductCarousel;
