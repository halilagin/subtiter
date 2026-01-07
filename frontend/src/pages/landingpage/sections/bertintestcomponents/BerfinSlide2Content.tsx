import React, { useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import { VerticalAlignTop, VerticalAlignCenter, VerticalAlignBottom } from '@mui/icons-material';
import { ShortSubtitleStyleBeast } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBeast';
import { ShortSubtitleStyleClassic } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleClassic';
import { ShortSubtitleStyleBobby } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBobby';
import { ShortSubtitleStyleBasker } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBasker';
import { applyCapitalization } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleUtils';
import { berfinSubtitleStyles, NeonSubtitleStyle, BoldSubtitleStyle, MinimalSubtitleStyle } from './BerfinSubtitleStyles';
import { BerfinSubtitleWheelPicker } from './BerfinSubtitleWheelPicker';



interface BerfinSlide2ContentProps {
  videoContainerRef: React.RefObject<HTMLDivElement>;
  rectanglePositions: { top: number; left: number }[];
  labelBoxStyle: any;
}

const BerfinSlide2Content: React.FC<BerfinSlide2ContentProps> = ({ 
  videoContainerRef, 
  rectanglePositions, 
  labelBoxStyle 
}) => {
  const [autoHoverIndex, setAutoHoverIndex] = useState(0); // Start with No captions
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [capitalizationIndex, setCapitalizationIndex] = useState(0);
  const [positionIndex, setPositionIndex] = useState(2); // Start with bottom

  // Capitalization options
  const capitalizationOptions = [
    { label: 'AA', icon: <Box sx={{ fontSize: 'clamp(0.4rem, 1.2vw, 0.6rem)', fontWeight: 700, color: '#ffffff' }}>AA</Box> },
    { label: 'Aa', icon: <Box sx={{ fontSize: 'clamp(0.4rem, 1.2vw, 0.6rem)', fontWeight: 700, color: '#ffffff' }}>Aa</Box> },
    { label: 'aa', icon: <Box sx={{ fontSize: 'clamp(0.4rem, 1.2vw, 0.6rem)', fontWeight: 700, color: '#ffffff' }}>aa</Box> },
    { label: 'Default', icon: <Box sx={{ fontSize: 'clamp(0.35rem, 1vw, 0.5rem)', fontWeight: 400, color: '#ffffff' }}>Default</Box> },
  ];

  // Get capitalization style string from index
  const getCapitalizationStyle = (index: number): 'uppercase' | 'capitalize_first_char_in_words' | 'lowercase' | 'default' => {
    switch (index) {
      case 0: return 'uppercase';
      case 1: return 'capitalize_first_char_in_words';
      case 2: return 'lowercase';
      default: return 'default';
    }
  };

  const currentCapitalizationStyle = getCapitalizationStyle(capitalizationIndex);

  // Position options
  const positionOptions = [
    { label: 'Top', icon: <VerticalAlignTop sx={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', color: '#ffffff' }} /> },
    { label: 'Center', icon: <VerticalAlignCenter sx={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', color: '#ffffff' }} /> },
    { label: 'Bottom', icon: <VerticalAlignBottom sx={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', color: '#ffffff' }} /> },
  ];

  // Auto scroll is disabled - manual control only
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setAutoHoverIndex((prevIndex) => {
  //       const nextIndex = (prevIndex + 1) % berfinSubtitleStyles.length;
  //       return nextIndex;
  //     });
  //   }, 2500);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <Grid container columnSpacing={0} rowSpacing={0} alignItems="center" justifyContent="center" sx={{ gap: { xs: 1.5, md: 2 } }}>
      {/* Portrait Container with Wheel Picker Overlay */}
      <Grid item xs={12} md="auto" sx={{ padding: '0 !important' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#000000',
            aspectRatio: '9/16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: { xs: '280px', md: '330px' },
            height: { xs: '500px', md: '585px' },
            touchAction: 'none',
          }}
          onWheel={(e) => {
            // Prevent scroll on main page
            e.stopPropagation();
          }}
          >
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
                opacity: isVideoReady ? 1 : 0,
                transition: 'opacity 0.3s ease',
                position: 'relative',
                zIndex: 1
              }}
            >
              <source src="/podcastwoman.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Subtitle Overlay - Always visible when not "No captions" */}
            {autoHoverIndex !== 0 && (
              <Box sx={{
                position: 'absolute',
                ...(currentPosition === 'top' && {
                  top: '20%',
                  bottom: 'auto'
                }),
                ...(currentPosition === 'center' && {
                  top: '50%',
                  bottom: 'auto',
                  transform: 'translateX(-50%) translateY(-50%) scale(1.4)'
                }),
                ...(currentPosition === 'bottom' && {
                  bottom: '30%',
                  top: 'auto'
                }),
                left: '50%',
                transform: currentPosition === 'center' 
                  ? 'translateX(-50%) translateY(-50%) scale(1.4)' 
                  : 'translateX(-50%) scale(1.4)',
                zIndex: 10,
                maxWidth: '85%',
                textAlign: 'center',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))',
              }}>
                {(() => {
                  const style = berfinSubtitleStyles[autoHoverIndex];
                  // If it's a component that accepts capitalizationStyle prop, pass it
                  if (style.label === 'Beast') {
                    return <ShortSubtitleStyleBeast capitalizationStyle={currentCapitalizationStyle} selected={() => {}} id="beast" />;
                  } else if (style.label === 'Classic') {
                    return <ShortSubtitleStyleClassic capitalizationStyle={currentCapitalizationStyle} selected={() => {}} id="classic" />;
                  } else if (style.label === 'Bobby') {
                    return <ShortSubtitleStyleBobby capitalizationStyle={currentCapitalizationStyle} selected={() => {}} id="bobby" />;
                  } else if (style.label === 'Basker') {
                    return <ShortSubtitleStyleBasker capitalizationStyle={currentCapitalizationStyle} selected={() => {}} id="basker" />;
                  } else if (style.label === 'Neon') {
                    return <NeonSubtitleStyle capitalizationStyle={currentCapitalizationStyle} key={`neon-${capitalizationIndex}`} />;
                  } else if (style.label === 'Bold') {
                    return <BoldSubtitleStyle capitalizationStyle={currentCapitalizationStyle} key={`bold-${capitalizationIndex}`} />;
                  } else if (style.label === 'Minimal') {
                    return <MinimalSubtitleStyle capitalizationStyle={currentCapitalizationStyle} key={`minimal-${capitalizationIndex}`} />;
                  }
                  return style.icon;
                })()}
              </Box>
            )}

            {/* Wheel Picker Overlay at Bottom - 3 wheels side by side with unified background */}
            <Box sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '24%',
              zIndex: 15,
              background: 'linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.95) 50%, rgba(0,0,0,0.85) 100%)',
              backdropFilter: 'blur(8px)',
              borderBottomLeftRadius: 3,
              borderBottomRightRadius: 3,
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
              py: 1,
              px: 1,
            }}>
              {/* Left: Capitalization Wheel */}
              <Box sx={{ height: '100%', width: '20%', pointerEvents: 'auto' }}>
                <BerfinSubtitleWheelPicker
                  options={capitalizationOptions}
                  selectedIndex={capitalizationIndex}
                  onChange={setCapitalizationIndex}
                  autoScrollIndex={capitalizationIndex}
                />
              </Box>
              
              {/* Center: Subtitle Style Wheel - Wider */}
              <Box sx={{ height: '100%', width: '60%', pointerEvents: 'auto' }}>
                <BerfinSubtitleWheelPicker
                  options={berfinSubtitleStyles}
                  selectedIndex={autoHoverIndex}
                  onChange={setAutoHoverIndex}
                  autoScrollIndex={autoHoverIndex}
                />
              </Box>
              
              {/* Right: Position Wheel */}
              <Box sx={{ height: '100%', width: '20%', pointerEvents: 'auto' }}>
                <BerfinSubtitleWheelPicker
                  options={positionOptions}
                  selectedIndex={positionIndex}
                  onChange={(index) => {
                    setPositionIndex(index);
                    const positions: ('top' | 'center' | 'bottom')[] = ['top', 'center', 'bottom'];
                    setCurrentPosition(positions[index]);
                  }}
                  autoScrollIndex={positionIndex}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default BerfinSlide2Content;

