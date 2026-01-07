import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';

interface WheelPickerProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export const BerfinWheelPicker: React.FC<WheelPickerProps> = ({ options, value, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(options.indexOf(value));
  const itemHeight = 40;
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const index = options.indexOf(value);
    if (index !== -1) {
      setSelectedIndex(index);
    }
  }, [value, options]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
    
    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
      onChange(options[clampedIndex]);
    }

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set new timeout to detect scroll end
    scrollTimeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const currentScrollTop = containerRef.current.scrollTop;
        const currentIndex = Math.round(currentScrollTop / itemHeight);
        const finalIndex = Math.max(0, Math.min(currentIndex, options.length - 1));
        const targetScroll = finalIndex * itemHeight;
        containerRef.current.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    }, 150);
  };

  const handleScrollEnd = () => {
    if (containerRef.current) {
      const targetScroll = selectedIndex * itemHeight;
      containerRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = selectedIndex * itemHeight;
    }
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 200,
        overflow: 'hidden',
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 2,
      }}
    >
      {/* Highlight overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: itemHeight,
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(0, 0, 0, 0.05)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Top fade */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Bottom fade */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Scrollable container */}
      <Box
        ref={containerRef}
        onScroll={handleScroll}

        onTouchEnd={handleScrollEnd}
        onMouseUp={handleScrollEnd}

        sx={{
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          paddingTop: '80px',
          paddingBottom: '80px',
        }}
      >
        {options.map((option, index) => {
          const distance = Math.abs(index - selectedIndex);
          const opacity = Math.max(0.3, 1 - distance * 0.3);
          const scale = Math.max(0.85, 1 - distance * 0.1);

          return (
            <Box
              key={option}
              onClick={() => {
                setSelectedIndex(index);
                onChange(option);
                if (containerRef.current) {
                  containerRef.current.scrollTo({
                    top: index * itemHeight,
                    behavior: 'smooth'
                  });
                }
              }}
              sx={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
                fontWeight: index === selectedIndex ? 600 : 400,
                opacity: opacity,
                transform: `scale(${scale})`,
                transition: 'all 0.2s ease',
                scrollSnapAlign: 'center',
                userSelect: 'none',
                color: '#000000',
              }}
            >
              {option}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

