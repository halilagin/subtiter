import React, { useState, useLayoutEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import {
  ChevronRight,
  ChevronLeft
} from '@mui/icons-material';
import  ShortSubtitleCard from "./ShortSubtitleCard"
import SubtitlePositionSelection from "./SubtitlePositionSelection"
import { ShortSubtitleStyleDefault } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleDefault';
import { ShortSubtitleStyleRoundedBox } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleRoundedBox';
import { ShortSubtitleStyleKaraokePopup } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleKaraokePopup';
import { ShortSubtitleStyleClassic } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleClassic';
import { ShortSubtitleStyleSara } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleSara';
import { ShortSubtitleStyleJimi } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleJimi';
import { ShortSubtitleStyleBasker } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBasker';
import { ShortSubtitleStyleBobby } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBobby';
import { ShortSubtitleStyleBeast } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBeast';
import { ShortSubtitleStyleNeon } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleNeon';
import { ShortSubtitleStyleVintage } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleVintage';
import { ShortSubtitleStyleCyber } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleCyber';
import { ShortSubtitleStyleElegant } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleElegant';
import { ShortSubtitleStyleRegular } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleRegular';
import { ShortSubtitleStyleMesageBox } from './ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleMesageBox';
import { SubtitleConfiguration } from '@/api/models/SubtitleConfiguration';
import { EventType } from '@/events';
import { ShortConfigJsonInput } from '@/api/models';

interface ShortSubtitleCapitalizationButtonsProps {
  capitalizationStyle: 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words';
  onCapitalizationChange: (style: 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words') => void;
}

interface NavigationArrowProps {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}

const NavigationArrow: React.FC<NavigationArrowProps> = ({ direction, onClick, disabled }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        [direction]: -20,
        top: '50%',
        transform: 'translateY(-50%)',
        bgcolor: 'white',
        borderRadius: '50%',
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        zIndex: 1,
        opacity: disabled ? 0.3 : 1,
        '&:hover': {
          bgcolor: '#f5f5f5',
          transform: 'translateY(-50%) scale(1.05)'
        }
      }}
      onClick={onClick}
    >
      {direction === 'left' ? (
        <ChevronLeft sx={{ fontSize: 18, color: '#6b7280' }} />
      ) : (
        <ChevronRight sx={{ fontSize: 18, color: '#6b7280' }} />
      )}
    </Box>
  );
};

const ShortSubtitleCapitalizationButtons: React.FC<ShortSubtitleCapitalizationButtonsProps> = ({ 
  capitalizationStyle, 
  onCapitalizationChange 
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 0, minWidth: 0, flexShrink: 1 }}>
      <Button
        size="small"
        variant={capitalizationStyle === 'uppercase' ? 'contained' : 'outlined'}
        onClick={() => onCapitalizationChange('uppercase')}
        sx={{
          bgcolor: capitalizationStyle === 'uppercase' ? '#000000' : 'white',
          color: capitalizationStyle === 'uppercase' ? 'white' : '#6b7280',
          borderColor: '#d1d5db',
          textTransform: 'none',
          borderRadius: '8px 0 0 8px',
          fontFamily: "'Inter', sans-serif",
          px: { xs: 0.5, md: 1 },
          py: { xs: 0.3, md: 0.5 },
          fontSize: { xs: '0.65rem', md: '0.7rem' },
          minWidth: { xs: 'auto', md: '48px' },
          borderRight: 'none',
          '&:hover': {
            bgcolor: capitalizationStyle === 'uppercase' ? '#000000' : 'transparent'
          }
        }}
      >
        AA BB
      </Button>
      <Button
        size="small"
        variant={capitalizationStyle === 'capitalize_first_char_in_words' ? 'contained' : 'outlined'}
        onClick={() => onCapitalizationChange('capitalize_first_char_in_words')}
        sx={{
          bgcolor: capitalizationStyle === 'capitalize_first_char_in_words' ? '#000000' : 'white',
          color: capitalizationStyle === 'capitalize_first_char_in_words' ? 'white' : '#6b7280',
          borderColor: '#d1d5db',
          textTransform: 'none',
          borderRadius: '0',
          fontFamily: "'Inter', sans-serif",
          px: { xs: 0.5, md: 1 },
          py: { xs: 0.3, md: 0.5 },
          fontSize: { xs: '0.65rem', md: '0.7rem' },
          minWidth: { xs: 'auto', md: '48px' },
          borderLeft: 'none',
          borderRight: 'none',
          '&:hover': {
            bgcolor: capitalizationStyle === 'capitalize_first_char_in_words' ? '#000000' : 'transparent'
          }
        }}
      >
        Aa Bb
      </Button>

      <Button
        size="small"
        variant={capitalizationStyle === 'lowercase' ? 'contained' : 'outlined'}
        onClick={() => onCapitalizationChange('lowercase')}
        sx={{
          bgcolor: capitalizationStyle === 'lowercase' ? '#000000' : 'white',
          color: capitalizationStyle === 'lowercase' ? 'white' : '#6b7280',
          borderColor: '#d1d5db',
          textTransform: 'none',
          borderRadius: '0',
          fontFamily: "'Inter', sans-serif",
          px: { xs: 0.5, md: 1 },
          py: { xs: 0.3, md: 0.5 },
          fontSize: { xs: '0.65rem', md: '0.7rem' },
          minWidth: { xs: 'auto', md: '48px' },
          borderLeft: 'none',
          borderRight: 'none',
          '&:hover': {
            bgcolor: capitalizationStyle === 'lowercase' ? '#000000' : 'transparent'
          }
        }}
      >
        aa bb
      </Button>

      <Button
        size="small"
        variant={capitalizationStyle === 'default' ? 'contained' : 'outlined'}
        onClick={() => onCapitalizationChange('default')}
        sx={{
          bgcolor: capitalizationStyle === 'default' ? '#000000' : 'white',
          color: capitalizationStyle === 'default' ? 'white' : '#6b7280',
          borderColor: '#d1d5db',
          textTransform: 'none',
          borderRadius: '0 8px 8px 0',
          fontFamily: "'Inter', sans-serif",
          px: { xs: 0.5, md: 1 },
          py: { xs: 0.3, md: 0.5 },
          fontSize: { xs: '0.65rem', md: '0.7rem' },
          minWidth: { xs: 'auto', md: '48px' },
          borderLeft: 'none',
          '&:hover': {
            bgcolor: capitalizationStyle === 'default' ? '#000000' : 'transparent'
          }
        }}
      >
        Default
      </Button>
    </Box>
  );
}

interface ShortSubtitleSelectionProps {
  shortConfig?: ShortConfigJsonInput;
}

const ShortSubtitleSelection: React.FC<ShortSubtitleSelectionProps> = ({ 
  shortConfig
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
  const [capitalizationStyle, setCapitalizationStyle] = useState<'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words'>('uppercase');
  const [selectedSubtitleDefinition, setSelectedSubtitleDefinition] = useState<string>('default');
  const [subtitlePosition, setSubtitlePosition] = useState<'top' | 'middle' | 'bottom'>('bottom');
  const [regularColor, setRegularColor] = useState('#000000');
  const [roundedBoxColor, setRoundedBoxColor] = useState('#000000');
  const [messageBoxColor, setMessageBoxColor] = useState('#000000');

  const [cardsPerPage, setCardsPerPage] = useState(4);
  const [isMobile, setIsMobile] = useState(false);
  const totalSubtitleStyles = 4;

  // Calculate how many cards fit based on container width
  useLayoutEffect(() => {
    const calculateCardsPerPage = () => {
      if (!containerRef.current) return;
      
      const mobileCheck = window.innerWidth < 600;
      setIsMobile(mobileCheck);
      
      if (mobileCheck) {
        setCardsPerPage(2);
        return;
      }
      
      const containerWidth = containerRef.current.offsetWidth;
      const cardWidth = 110;
      const gap = 8;
      const positionButtonsWidth = 48;
      const padding = 24;
      
      const availableWidth = containerWidth - positionButtonsWidth - padding;
      const calculatedCards = Math.floor((availableWidth + gap) / (cardWidth + gap));
      const cardsToShow = Math.max(1, Math.min(calculatedCards, totalSubtitleStyles));
      
      setCardsPerPage(cardsToShow);
    };

    if (!containerRef.current) return;
    
    calculateCardsPerPage();
    
    const resizeObserver = new ResizeObserver(() => {
      calculateCardsPerPage();
    });
    
    const handleWindowResize = () => {
      calculateCardsPerPage();
    };
    
    resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', handleWindowResize);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [totalSubtitleStyles]);

  const handleCapitalizationChange = (style: 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words') => {
    setCapitalizationStyle(style);
    const event = new CustomEvent(EventType.UPDATE_SHORT_CONFIG, { 
        detail: { 
            subtitleCapitalizationMethod: style,
            videoId: shortConfig?.videoId
        } 
    });
    window.dispatchEvent(event);
  };

  const handleSubtitleDefinitionSelect = (subtitleDefinitionId: string) => {
    setSelectedSubtitleDefinition(subtitleDefinitionId);
    
    const event = new CustomEvent(EventType.UPDATE_SHORT_CONFIG, { 
        detail: { 
            subtitleStyle: subtitleDefinitionId,
            videoId: shortConfig?.videoId
        } 
    });
    window.dispatchEvent(event);
    
    const subtitleConfig: SubtitleConfiguration = {
      id: subtitleDefinitionId
    };
    
    const customEvent = new CustomEvent<SubtitleConfiguration>(EventType.SHORT_SUBTITLE_STYLE_SELECTED, {
      detail: subtitleConfig
    });
    window.dispatchEvent(customEvent);
  };

  const handlePositionChange = (position: 'top' | 'middle' | 'bottom') => {
    setSubtitlePosition(position);
    const event = new CustomEvent(EventType.UPDATE_SHORT_CONFIG_SUBTITLE_POSITION, { 
        detail: { 
            subtitlePosition: position,
            videoId: shortConfig?.videoId
        } 
    });
    window.dispatchEvent(event);
  };

  const handleColorButtonClick = () => {
    const event = new CustomEvent('short-subtitle-color-button-click', {
      detail: { id: selectedSubtitleDefinition }
    });
    window.dispatchEvent(event);
  };

  const getSelectedColor = () => {
    if (selectedSubtitleDefinition === 'regular') {
      return regularColor;
    } else if (selectedSubtitleDefinition === 'rounded_box') {
      return roundedBoxColor;
    } else if (selectedSubtitleDefinition === 'message_box') {
      return messageBoxColor;
    }
    return '#000000';
  };

  const hasColorSupport = () => {
    return ['regular', 'rounded_box', 'message_box'].includes(selectedSubtitleDefinition);
  };

  const cardTransform = useMemo(() => {
    if (isMobile) {
      const cardWidth = 110;
      const gap = 8;
      return `translateX(-${currentPresetIndex * (cardWidth + gap)}px)`;
    }
    return 'none';
  }, [currentPresetIndex, isMobile]);

   return (
     <Box sx={{ 
       mb: 0.5, 
       bgcolor: '#f5f5f5', 
       p: 1, 
       borderRadius: 2,
       height: '100%',
       display: 'flex',
       flexDirection: 'column'
     }}>
       {/* Title and Controls Row */}
       <Box sx={{ 
         display: 'flex', 
         justifyContent: 'space-between', 
         alignItems: 'center', 
         mb: 1.5,
         px: 1,
         py: 0.5,
         minWidth: 0,
         gap: 1
       }}>
         <Typography 
           variant="h6" 
           sx={{ 
             fontWeight: '600', 
             color: '#2f2e2c', 
             fontFamily: "'Inter', sans-serif",
             fontSize: { xs: '0.75rem', md: '0.85rem' },
             lineHeight: 1.5,
             flexShrink: 0
           }}
         >
           Subtitle Styles
         </Typography>

         <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 'auto', minWidth: 0, flexShrink: 1 }}>
           <ShortSubtitleCapitalizationButtons 
             capitalizationStyle={capitalizationStyle}
             onCapitalizationChange={handleCapitalizationChange}
           />
         </Box>
       </Box>

      {/* Preset Containers */}
       <Box 
         ref={containerRef}
         sx={{ 
         position: 'relative', 
         mb: 1,
         flex: 1,
         display: 'flex',
         flexDirection: 'column',
         minHeight: 0
       }}>
        <NavigationArrow
          direction="left"
          onClick={() => setCurrentPresetIndex(Math.max(0, currentPresetIndex - cardsPerPage))}
          disabled={currentPresetIndex === 0}
        />

        {/* Container Row */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 1.5,
          flexShrink: 0,
          minHeight: 0,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <SubtitlePositionSelection
            subtitlePosition={subtitlePosition}
            onPositionChange={handlePositionChange}
          />

          {/* Subtitle Cards */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            flex: 1, 
            justifyContent: 'flex-start', 
            alignItems: 'center', 
            minWidth: 0,
            transition: 'transform 0.3s ease',
            willChange: 'transform'
          }} style={{ transform: cardTransform }}>
            {/* <ShortSubtitleCard
              id='default'
              name='Default'
              isSelected={selectedSubtitleDefinition === 'default'}
              onSelect={() => handleSubtitleDefinitionSelect('default')}
              position={subtitlePosition}
            >
              <ShortSubtitleStyleDefault capitalizationStyle={capitalizationStyle} selected={() => {}} id='default' />
            </ShortSubtitleCard> */}

            <ShortSubtitleCard
              id='regular'
              name='Regular'
              isSelected={selectedSubtitleDefinition === 'regular'}
              onSelect={() => handleSubtitleDefinitionSelect('regular')}
              position={subtitlePosition}
            >
              <ShortSubtitleStyleRegular capitalizationStyle={capitalizationStyle} selected={() => {}} id='regular' videoId={shortConfig?.videoId} position={subtitlePosition} />
            </ShortSubtitleCard>
            
            <ShortSubtitleCard
              id='rounded_box'
              name='Rounded Box'
              isSelected={selectedSubtitleDefinition === 'rounded_box'}
              onSelect={() => handleSubtitleDefinitionSelect('rounded_box')}
              position={subtitlePosition}
            >
              <ShortSubtitleStyleRoundedBox capitalizationStyle={capitalizationStyle} selected={() => {}} id='rounded_box' videoId={shortConfig?.videoId} position={subtitlePosition} />
            </ShortSubtitleCard>

            <ShortSubtitleCard
              id='message_box'
              name='Message Box'
              isSelected={selectedSubtitleDefinition === 'message_box'}
              onSelect={() => handleSubtitleDefinitionSelect('message_box')}
              position={subtitlePosition}
            >
              <ShortSubtitleStyleMesageBox capitalizationStyle={capitalizationStyle} selected={() => {}} id='message_box' videoId={shortConfig?.videoId} position={subtitlePosition} />
            </ShortSubtitleCard>
          </Box>
        </Box>

        <NavigationArrow
          direction="right"
          onClick={() => setCurrentPresetIndex(Math.min(totalSubtitleStyles - cardsPerPage, currentPresetIndex + cardsPerPage))}
          disabled={currentPresetIndex >= totalSubtitleStyles - cardsPerPage}
        />
        
        {/* Color Button */}
        {hasColorSupport() && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 1.5,
            mb: 0.5,
            flexShrink: 0
          }}>
            <Button
              onClick={handleColorButtonClick}
              sx={{
                minWidth: 'auto',
                px: 1.5,
                py: 0.6,
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                textTransform: 'none',
                bgcolor: getSelectedColor(),
                color: '#ffffff',
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  bgcolor: getSelectedColor(),
                  opacity: 0.9,
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Change Color
            </Button>
          </Box>
        )}

        {/* Page Indicator */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: hasColorSupport() ? 0.5 : 1.5,
          gap: 0.5,
          flexShrink: 0
        }}>
          {Array.from({ length: Math.ceil(totalSubtitleStyles / cardsPerPage) }, (_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: currentPresetIndex === index * cardsPerPage ? '#000000' : '#e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: currentPresetIndex === index * cardsPerPage ? '#000000' : '#d1d5db'
                }
              }}
              onClick={() => setCurrentPresetIndex(index * cardsPerPage)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ShortSubtitleSelection;
