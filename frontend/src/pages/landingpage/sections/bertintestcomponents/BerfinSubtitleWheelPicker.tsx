import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';

interface SubtitleWheelPickerProps {
  options: Array<{
    label: string;
    icon: React.ReactNode;
  }>;
  selectedIndex: number;
  onChange: (index: number) => void;
  autoScrollIndex?: number;
}

export const BerfinSubtitleWheelPicker: React.FC<SubtitleWheelPickerProps> = ({ 
  options, 
  selectedIndex, 
  onChange,
  autoScrollIndex 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localSelectedIndex, setLocalSelectedIndex] = useState(selectedIndex);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserScrollingRef = useRef(false);

  // Update local selected index when parent changes it
  useEffect(() => {
    setLocalSelectedIndex(selectedIndex);
  }, [selectedIndex]);

  // Auto scroll effect - only when user is not scrolling
  useEffect(() => {
    if (containerRef.current && autoScrollIndex !== undefined && !isUserScrollingRef.current) {
      const targetTop = (containerRef.current.scrollHeight / 2) - (containerRef.current.clientHeight / 2);
      containerRef.current.scrollTop = targetTop;
    }
  }, [autoScrollIndex]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Debounce wheel events - increased to prevent skipping
    if (wheelTimeoutRef.current) {
      return;
    }
    
    wheelTimeoutRef.current = setTimeout(() => {
      wheelTimeoutRef.current = null;
    }, 400); // Increased from 250ms to 400ms
    
    const delta = e.deltaY;
    const currentIndex = localSelectedIndex;
    
    if (delta > 0) {
      // Scroll down - next subtitle (cycle)
      const nextIndex = currentIndex >= options.length - 1 ? 0 : currentIndex + 1;
      setLocalSelectedIndex(nextIndex);
      onChange(nextIndex);
    } else if (delta < 0) {
      // Scroll up - previous subtitle (cycle)
      const prevIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
      setLocalSelectedIndex(prevIndex);
      onChange(prevIndex);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const targetTop = (containerRef.current.scrollHeight / 2) - (containerRef.current.clientHeight / 2);
      containerRef.current.scrollTop = targetTop;
    }
  }, [selectedIndex]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: 0,
        pointerEvents: 'auto',
        touchAction: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        perspective: '800px',
        perspectiveOrigin: '50% 50%',
        transformStyle: 'preserve-3d',
      }}
      onWheel={handleWheel}
    >
      {/* Highlight selection box */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '28%',
          minHeight: '50px',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(255, 255, 255, 0.08)',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 0,
          pointerEvents: 'none',
          zIndex: 1,
          boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
        }}
      />

      {/* Top fade - stronger */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '45%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Bottom fade - stronger */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '45%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Rotating wheel container */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
      }}>
        {/* Show all items with rotation effect - more visible items */}
        {options.map((option, index) => {
          // Calculate position relative to selected index
          let offset = index - localSelectedIndex;
          
          // For small wheels (<=4 items), don't use circular positioning to prevent seeing back items
          // For larger wheels, use circular positioning for infinite scroll effect
          if (options.length > 4) {
            // Handle circular positioning for larger wheels
            if (offset > options.length / 2) offset -= options.length;
            if (offset < -options.length / 2) offset += options.length;
          }
          
          const itemHeight = 45;
          const translateY = offset * itemHeight;
          const isSelected = offset === 0;
          const absOffset = Math.abs(offset);
          
          // Show more items - always show max 3 items (selected + 1 above + 1 below)
          const maxVisible = 3;
          if (absOffset > maxVisible) return null;
          
          // Calculate opacity and scale based on distance - more gradual and visible
          const opacity = absOffset === 0 ? 1 : 
                         absOffset === 1 ? 0.75 : 
                         absOffset === 2 ? 0.5 : 
                         0.25;
          const scale = absOffset === 0 ? 1 : 
                       absOffset === 1 ? 0.8 : 
                       absOffset === 2 ? 0.65 : 
                       0.5;
          // Stronger 3D rotation for wheel effect
          const rotateX = offset * 25;
          const translateZ = -Math.abs(offset) * 20; // 3D depth

          return (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
                fontWeight: isSelected ? 700 : 400,
                opacity: opacity,
                transform: `translateY(calc(-50% + ${translateY}px)) translateZ(${translateZ}px) scale(${scale}) rotateX(${rotateX}deg)`,
                transformStyle: 'preserve-3d',
                transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                userSelect: 'none',
                color: '#ffffff',
                filter: isSelected 
                  ? 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.6))' 
                  : absOffset === 1 
                    ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))'
                    : 'none',
                pointerEvents: 'none',
                backfaceVisibility: 'hidden',
              }}
            >
              <Box sx={{ 
                transform: `scale(${isSelected ? 1.3 : absOffset === 1 ? 1 : 0.85})`,
                transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                display: 'flex',
                alignItems: 'center',
                transformStyle: 'preserve-3d',
              }}>
                {option.icon}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

