import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Button
} from '@mui/material';
import {
  ChevronRight,
  ChevronLeft
} from '@mui/icons-material';
import SubtitlingCard from "./SubtitlingCard"
import { SubtitlingStyleDefault } from './SubtitlingStyleDefinitionCards/SubtitlingStyleDefault';
import { SubtitlingStyleRoundedBox } from './SubtitlingStyleDefinitionCards/SubtitlingStyleRoundedBox';
import { SubtitlingStyleClassic } from './SubtitlingStyleDefinitionCards/SubtitlingStyleClassic';
import { SubtitlingStyleSara } from './SubtitlingStyleDefinitionCards/SubtitlingStyleSara';
import { SubtitlingStyleJimi } from './SubtitlingStyleDefinitionCards/SubtitlingStyleJimi';
import { SubtitlingStyleBasker } from './SubtitlingStyleDefinitionCards/SubtitlingStyleBasker';
import { SubtitlingStyleBobby } from './SubtitlingStyleDefinitionCards/SubtitlingStyleBobby';
import { SubtitlingStyleBeast } from './SubtitlingStyleDefinitionCards/SubtitlingStyleBeast';
import { SubtitlingStyleNeon } from './SubtitlingStyleDefinitionCards/SubtitlingStyleNeon';
import { SubtitlingStyleVintage } from './SubtitlingStyleDefinitionCards/SubtitlingStyleVintage';
import { SubtitlingStyleCyber } from './SubtitlingStyleDefinitionCards/SubtitlingStyleCyber';
import { SubtitlingStyleElegant } from './SubtitlingStyleDefinitionCards/SubtitlingStyleElegant';
import { SubtitlingStyleRegular } from './SubtitlingStyleDefinitionCards/SubtitlingStyleRegular';
import { SubtitlingStyleMesageBox } from './SubtitlingStyleDefinitionCards/SubtitlingStyleMesageBox';
import { SubtitleConfiguration } from '@/api/models';
import { EventType } from '@/events';
import SelectedSubtitles from './SelectedSubtitles';

import GenerateSubtitleButton from './GenerateSubtitleButton';


interface SubtitlingCapitalizationButtonsProps {
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

const SubtitlingCapitalizationButtons: React.FC<SubtitlingCapitalizationButtonsProps> = ({ 
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



interface SubtitlingSelectionProps {
  videoId: string;
  onSubtitleDefinitionSelect: (subtitleDefinitionId: string) => void;
  onCapitalizationChange: (style: 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words') => void;
  onPositionChange: (position: 'top' | 'center' | 'bottom') => void;
}

const SubtitlingSelection: React.FC<SubtitlingSelectionProps> = ({ 
  videoId,
  onSubtitleDefinitionSelect, 
  onCapitalizationChange,
  onPositionChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
  const [capitalizationStyle, setCapitalizationStyle] = useState<'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words'>('uppercase');
  const [selectedSubtitleDefinition, setSelectedSubtitleDefinition] = useState<string>('default');
  const [subtitlePosition, setSubtitlePosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [cardsPerPage, setCardsPerPage] = useState(4);
  const [isMobile, setIsMobile] = useState(false);
  const totalSubtitleStyles = 4; // Only show first 4 styles (default, rounded_box, karaoke_popup_rectangle, classic)
  const [selectedSubtitles, setSelectedSubtitles] = useState<SubtitleConfiguration[]>([]);

  // Calculate how many cards fit based on container width
  useLayoutEffect(() => {
    const calculateCardsPerPage = () => {
      if (!containerRef.current) return;
      
      // Check if mobile (screen width < 600px)
      const mobileCheck = window.innerWidth < 600;
      setIsMobile(mobileCheck);
      
      if (mobileCheck) {
        // Mobile: always show 2 cards
        setCardsPerPage(2);
        return;
      }
      
      const containerWidth = containerRef.current.offsetWidth;
      const cardWidth = 110; // Card width
      const gap = 8; // Gap between cards (theme spacing 1 = 8px)
      const padding = 24; // Container padding (px: 1.5 = 24px)
      
      // Available width for cards = total width - padding
      const availableWidth = containerWidth - padding;
      
      // Calculate how many cards fit: (availableWidth + gap) / (cardWidth + gap)
      const calculatedCards = Math.floor((availableWidth + gap) / (cardWidth + gap));
      
      // Ensure at least 1 card, but not more than total definitions
      const cardsToShow = Math.max(1, Math.min(calculatedCards, totalSubtitleStyles));
      
      setCardsPerPage(cardsToShow);
    };

    // Use ResizeObserver for better performance
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

  // Reset current index when cards per page changes
  useEffect(() => {
    if (currentPresetIndex >= totalSubtitleStyles) {
      setCurrentPresetIndex(0);
    }
  }, [cardsPerPage, currentPresetIndex, totalSubtitleStyles]);



  const handleCapitalizationChange = (style: 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words') => {
    setCapitalizationStyle(style);
    onCapitalizationChange(style);
    
    // Dispatch event with current capitalization and position
    const event = new CustomEvent(EventType.SUBTITLING_CONFIG_CHANGED, {
      detail: { 
        capitalizationStyle: style,
        position: subtitlePosition
      }
    });
    window.dispatchEvent(event);
  };

  const handleSubtitleDefinitionSelect = (subtitleDefinitionId: string) => {
    setSelectedSubtitleDefinition(subtitleDefinitionId);
    onSubtitleDefinitionSelect(subtitleDefinitionId);
    
    // Dispatch custom event
    const event = new CustomEvent(EventType.SHORT_SUBTITLE_STYLE_SELECTED, {
      detail: { id: subtitleDefinitionId }
    });
    window.dispatchEvent(event);
  };

  const handlePositionChange = (position: 'top' | 'center' | 'bottom') => {
    setSubtitlePosition(position);
    onPositionChange(position);
    
    // Dispatch event with current capitalization and position
    const event = new CustomEvent(EventType.SUBTITLING_CONFIG_CHANGED, {
      detail: { 
        capitalizationStyle: capitalizationStyle,
        position: position
      }
    });
    window.dispatchEvent(event);
  };

  // Calculate transform for mobile (2 cards per page)
  const cardTransform = useMemo(() => {
    if (isMobile) {
      const cardWidth = 110;
      const gap = 8;
      return `translateX(-${currentPresetIndex * (cardWidth + gap)}px)`;
    }
    return 'none';
  }, [currentPresetIndex, isMobile]);

  const renderPreviewStyle = (id: string) => {
    const props = { 
      capitalizationStyle, 
      id, 
      selected: () => {} 
    };
    
    switch(id) {
      case 'default': return <SubtitlingStyleDefault {...props} />;
      case 'regular': return <SubtitlingStyleRegular {...props} />;
      case 'rounded_box': return <SubtitlingStyleRoundedBox {...props} />;
      case 'message_box': return <SubtitlingStyleMesageBox {...props} />;
      // Keeping these for future reference even if not currently used in the switch
      case 'jimi': return <SubtitlingStyleJimi {...props} />;
      case 'classic': return <SubtitlingStyleClassic {...props} />;
      case 'sara': return <SubtitlingStyleSara {...props} />;
      case 'basker': return <SubtitlingStyleBasker {...props} />;
      case 'bobby': return <SubtitlingStyleBobby {...props} />;
      case 'beast': return <SubtitlingStyleBeast {...props} />;
      case 'neon': return <SubtitlingStyleNeon {...props} />;
      case 'vintage': return <SubtitlingStyleVintage {...props} />;
      case 'cyber': return <SubtitlingStyleCyber {...props} />;
      case 'elegant': return <SubtitlingStyleElegant {...props} />;
      default: return <SubtitlingStyleDefault {...props} />;
    }
  };


   return (
    <Box>
     <Box sx={{ 
       mb: 0.5, 
       bgcolor: '#f5f5f5', 
       p: 1, 
       borderRadius: 2,
       height: '100%',
       display: 'flex',
       flexDirection: 'column'
     }}>
       {/* Title */}
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
          justifyContent: 'center',
          alignItems: 'center',
          px: 1.5,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          position: 'relative'
        }}>

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


            <SubtitlingCard
              id='regular'
              name='Regular'
              isSelected={selectedSubtitleDefinition === 'regular'}
              onSelect={() => handleSubtitleDefinitionSelect('regular')}
              position={subtitlePosition}
              capitalization={capitalizationStyle}
            >
              <SubtitlingStyleRegular capitalizationStyle={capitalizationStyle} selected={() => {}} id='regular' />
            </SubtitlingCard>
            
            <SubtitlingCard
              id='rounded_box'
              name='Rounded Box'
              isSelected={selectedSubtitleDefinition === 'rounded_box'}
              onSelect={() => handleSubtitleDefinitionSelect('rounded_box')}
              position={subtitlePosition}
              capitalization={capitalizationStyle}
            >
              <SubtitlingStyleRoundedBox capitalizationStyle={capitalizationStyle} selected={() => {}} id='rounded_box' />
            </SubtitlingCard>

            <SubtitlingCard
              id='message_box'
              name='Message Box'
              isSelected={selectedSubtitleDefinition === 'message_box'}
              onSelect={() => handleSubtitleDefinitionSelect('message_box')}
              position={subtitlePosition}
              capitalization={capitalizationStyle}
            >
              <SubtitlingStyleMesageBox capitalizationStyle={capitalizationStyle} selected={() => {}} id='message_box' />
            </SubtitlingCard>

          </Box>
        </Box>

        <NavigationArrow
          direction="right"
          onClick={() => setCurrentPresetIndex(Math.min(totalSubtitleStyles - cardsPerPage, currentPresetIndex + cardsPerPage))}
          disabled={currentPresetIndex >= totalSubtitleStyles - cardsPerPage}
        />
        
        {/* Page Indicator */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 0.2,
          gap: 0.5
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
      <Box>
        <SelectedSubtitles onSelectedSubtitlesChange={setSelectedSubtitles} />
      </Box>

      <Box sx={{ mt: 0.5 }}>
        <GenerateSubtitleButton 
          videoId={videoId}
          subtitleApplication={{
            subtitleConfiguration: selectedSubtitles
          }}
        />
      </Box>

    </Box>
    
    
    
  );
};

export default SubtitlingSelection;
