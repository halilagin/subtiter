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
    if (currentSection > 0) {
      const prev = currentSection - 1;
      currentSectionRef.current = prev;
      setCurrentSection(prev);
    }
  };

  // Update ref when section changes
  useEffect(() => {
    currentSectionRef.current = currentSection;
  }, [currentSection]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Check if scrolling within subtitle selection area
      const target = e.target as HTMLElement;
      
      // Check if we're inside a scrollable subtitle area, navigation buttons, or video preview
      const isInSubtitleGrid = target.closest('[data-subtitle-area="true"]');
      const isInNavigationButton = target.closest('.MuiIconButton-root') || target.closest('button[class*="MuiIconButton"]');
      const isInVideoPreview = target.closest('[data-video-preview="true"]');
      const isVideoElement = target.tagName === 'VIDEO' || target.closest('video');
      const isButton = target.tagName === 'BUTTON' || target.closest('button');
      const isInput = target.tagName === 'INPUT' || target.closest('input');
      // Check for video controls (they're in shadow DOM)
      const isVideoControl = target.closest('video') || (target.parentElement && target.parentElement.closest('video'));
      const isClickable = isButton || isInput || isVideoControl;
      
      if (isInSubtitleGrid || isInNavigationButton || isInVideoPreview || isVideoElement || isClickable) {
        return; // Allow normal scrolling/interaction
      }
      
      // Only handle wheel events inside cube-container
      const container = target.closest('.cube-container');
      if (!container) return;
      
      // Check if scrolling within content
      const scrollableContent = target.closest('.cube-face');
      
      if (scrollableContent) {
        const hasScroll = scrollableContent.scrollHeight > scrollableContent.clientHeight;
        const isAtTop = scrollableContent.scrollTop === 0;
        const isAtBottom = scrollableContent.scrollTop + scrollableContent.clientHeight >= scrollableContent.scrollHeight - 1;
        
        if (hasScroll && ((e.deltaY > 0 && !isAtBottom) || (e.deltaY < 0 && !isAtTop))) {
          return;
        }
      }
      
      if (isScrollingRef.current) return;
      
      e.preventDefault();
      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const current = currentSectionRef.current;
      
      if (e.deltaY > 0) {
        if (current < 3) {
          const next = current + 1;
          currentSectionRef.current = next;
          setCurrentSection(next);
        }
      } else {
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

    // Add wheel listener to document, not container
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentSection]); // Add currentSection dependency to ensure ref is updated

  // Touch events for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if touch started within subtitle selection area, video preview, or navigation buttons
      const isInSubtitleGrid = target.closest('[data-subtitle-area="true"]');
      const isInNavigationButton = target.closest('.MuiIconButton-root') || target.closest('button[class*="MuiIconButton"]');
      const isInVideoPreview = target.closest('[data-video-preview="true"]');
      const isVideoElement = target.tagName === 'VIDEO' || target.closest('video');
      const isButton = target.tagName === 'BUTTON' || target.closest('button');
      const isInput = target.tagName === 'INPUT' || target.closest('input');
      // Check for video controls (they're in shadow DOM, so check parent)
      const isVideoControl = target.closest('video') || (target.parentElement && target.parentElement.closest('video'));
      
      if (isInSubtitleGrid || isInNavigationButton || isInVideoPreview || isVideoElement || isButton || isInput || isVideoControl) {
        return; // Allow normal interaction
      }
      
      // Only handle touches inside cube-container
      const container = target.closest('.cube-container');
      if (!container) return;
      
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollingRef.current) return;
      
      const target = e.target as HTMLElement;
      
      // Check if touch ended within subtitle selection area, video preview, or navigation buttons
      const isInSubtitleGrid = target.closest('[data-subtitle-area="true"]');
      const isInNavigationButton = target.closest('.MuiIconButton-root') || target.closest('button[class*="MuiIconButton"]');
      const isInVideoPreview = target.closest('[data-video-preview="true"]');
      const isVideoElement = target.tagName === 'VIDEO' || target.closest('video');
      const isButton = target.tagName === 'BUTTON' || target.closest('button');
      const isInput = target.tagName === 'INPUT' || target.closest('input');
      // Check for video controls
      const isVideoControl = target.closest('video') || (target.parentElement && target.parentElement.closest('video'));
      
      if (isInSubtitleGrid || isInNavigationButton || isInVideoPreview || isVideoElement || isButton || isInput || isVideoControl) {
        return; // Allow normal interaction
      }
      
      // Only handle touches inside cube-container
      const container = target.closest('.cube-container');
      if (!container) return;
      
      const touchEndY = e.changedTouches[0].clientY;
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

    // Add touch listeners to document, not container
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentSection]); // Add currentSection dependency

  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
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
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            overflowX: 'hidden',
            overflowY: 'hidden',
          }}
        >
          {/* Front Face - Video Upload */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: currentSection === 0 ? 1 : 0,
              transform: currentSection === 0 ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(50px)',
              pointerEvents: currentSection === 0 ? 'auto' : 'none',
              transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              zIndex: currentSection === 0 ? 10 : 1,
              willChange: 'transform',
              overflow: 'hidden',
            }}
          >
            <VideoUploadSection
              onNext={handleNext}
              onVideoUploaded={(file) => {
                setUploadedVideo(file);
              }}
            />
          </Box>

          {/* Top Face - Subtitle Library */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: currentSection === 1 ? 1 : 0,
              transform: currentSection === 1 ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(50px)',
              pointerEvents: currentSection === 1 ? 'auto' : 'none',
              transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              zIndex: currentSection === 1 ? 10 : 1,
              willChange: 'transform',
              overflow: 'hidden',
            }}
          >
            <SubtitleLibrarySection
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSubtitleSelected={(subtitle) => {
                setSelectedSubtitle(subtitle);
              }}
              uploadedVideo={uploadedVideo}
            />
          </Box>

          {/* Back Face - Summary */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: currentSection === 2 ? 1 : 0,
              transform: currentSection === 2 ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(50px)',
              pointerEvents: currentSection === 2 ? 'auto' : 'none',
              transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              zIndex: currentSection === 2 ? 10 : 1,
              willChange: 'transform',
              overflow: 'hidden',
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
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: currentSection === 3 ? 1 : 0,
              transform: currentSection === 3 ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(50px)',
              pointerEvents: currentSection === 3 ? 'auto' : 'none',
              transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              zIndex: currentSection === 3 ? 10 : 1,
              willChange: 'transform',
              overflow: 'hidden',
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

