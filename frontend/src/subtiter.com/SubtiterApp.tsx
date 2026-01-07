import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { NavBar } from './components/NavBar';
import { VideoUploadSection } from './sections/VideoUploadSection';
import { SubtitleLibrarySection } from './sections/SubtitleLibrarySection';
import { SummarySection } from './sections/SummarySection';
import { PaymentSection } from './sections/PaymentSection';
import './SubtiterApp.css';

export const SubtiterApp: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [selectedSubtitle, setSelectedSubtitle] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef<boolean>(false);
  const touchStartYRef = useRef<number>(0);
  const currentSectionRef = useRef<number>(0);

  const handleNext = () => {
    if (currentSectionRef.current < 3) {
      const next = currentSectionRef.current + 1;
      currentSectionRef.current = next;
      setCurrentSection(next);
    }
  };

  const handlePrevious = () => {
    if (currentSectionRef.current > 0) {
      const prev = currentSectionRef.current - 1;
      currentSectionRef.current = prev;
      setCurrentSection(prev);
    }
  };

  // Update ref when section changes
  useEffect(() => {
    currentSectionRef.current = currentSection;
  }, [currentSection]);

  useEffect(() => {
    const handleWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      
      // Check if scrolling within subtitle selection area
      const target = wheelEvent.target as HTMLElement;
      
      // Check if we're inside a scrollable subtitle area or navigation buttons
      const isInSubtitleGrid = target.closest('[data-subtitle-area="true"]');
      const isInNavigationButton = target.closest('.MuiIconButton-root');
      
      if (isInSubtitleGrid || isInNavigationButton) {
        return; // Allow normal scrolling/interaction
      }
      
      // Check if scrolling within content
      const scrollableContent = target.closest('.cube-face');
      
      if (scrollableContent) {
        const hasScroll = scrollableContent.scrollHeight > scrollableContent.clientHeight;
        const isAtTop = scrollableContent.scrollTop === 0;
        const isAtBottom = scrollableContent.scrollTop + scrollableContent.clientHeight >= scrollableContent.scrollHeight - 1;
        
        if (hasScroll && ((wheelEvent.deltaY > 0 && !isAtBottom) || (wheelEvent.deltaY < 0 && !isAtTop))) {
          return;
        }
      }
      
      if (isScrollingRef.current) return;
      
      wheelEvent.preventDefault();
      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      if (wheelEvent.deltaY > 0) {
        const current = currentSectionRef.current;
        if (current < 3) {
          const next = current + 1;
          currentSectionRef.current = next;
          setCurrentSection(next);
        }
      } else {
        const current = currentSectionRef.current;
        if (current > 0) {
          const prev = current - 1;
          currentSectionRef.current = prev;
          setCurrentSection(prev);
        }
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    };

    const container = document.querySelector('.cube-container');
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []); // Remove currentSection dependency

  // Touch events for mobile
  useEffect(() => {
    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      const target = touchEvent.target as HTMLElement;
      
      // Check if touch started within subtitle selection area
      const isInSubtitleGrid = target.closest('[data-subtitle-area="true"]');
      const isInNavigationButton = target.closest('.MuiIconButton-root');
      
      if (isInSubtitleGrid || isInNavigationButton) {
        return; // Allow normal interaction
      }
      
      touchStartYRef.current = touchEvent.touches[0].clientY;
    };

    const handleTouchEnd = (e: Event) => {
      if (isScrollingRef.current) return;
      
      // Check if touch ended within subtitle selection area
      const touchEvent = e as TouchEvent;
      const target = touchEvent.target as HTMLElement;
      const isInSubtitleGrid = target.closest('[data-subtitle-area="true"]');
      const isInNavigationButton = target.closest('.MuiIconButton-root');
      
      if (isInSubtitleGrid || isInNavigationButton) {
        return; // Allow normal interaction
      }
      
      const touchEndY = touchEvent.changedTouches[0].clientY;
      const diff = touchStartYRef.current - touchEndY;

      if (Math.abs(diff) > 50) {
        isScrollingRef.current = true;

        if (diff > 0) {
          // Swipe up - next section
          if (currentSection < 3) {
            setCurrentSection(prev => prev + 1);
          }
        } else {
          // Swipe down - previous section
          if (currentSection > 0) {
            setCurrentSection(prev => prev - 1);
          }
        }

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
        }, 800);
      }
    };

    const container = document.querySelector('.cube-container');
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []); // Remove currentSection dependency

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        bgcolor: '#001111',
      }}
    >
      <NavBar />
      <Box
        className="cube-container"
        sx={{
          width: '100%',
          height: 'calc(100vh - 64px)',
          marginTop: '64px',
          perspective: '2000px',
          perspectiveOrigin: '50% 50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          className={`cube ${currentSection === 0 ? 'show-front' : currentSection === 1 ? 'show-top' : currentSection === 2 ? 'show-back' : 'show-bottom'}`}
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Front Face - Video Upload */}
          <Box
            className="cube-face cube-face-front"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <VideoUploadSection
              onNext={handleNext}
              onVideoUploaded={(file) => {
                setUploadedVideo(file);
                handleNext();
              }}
            />
          </Box>

          {/* Top Face - Subtitle Library */}
          <Box
            className="cube-face cube-face-top"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <SubtitleLibrarySection
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSubtitleSelected={(subtitle) => {
                setSelectedSubtitle(subtitle);
                handleNext();
              }}
            />
          </Box>

          {/* Back Face - Summary */}
          <Box
            className="cube-face cube-face-back"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <SummarySection
              onNext={handleNext}
              onPrevious={handlePrevious}
              video={uploadedVideo}
              subtitle={selectedSubtitle}
              onSummaryReady={(data) => {
                setSummaryData(data);
                handleNext();
              }}
            />
          </Box>

          {/* Bottom Face - Payment */}
          <Box
            className="cube-face cube-face-bottom"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <PaymentSection
              onPrevious={handlePrevious}
              summaryData={summaryData}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

