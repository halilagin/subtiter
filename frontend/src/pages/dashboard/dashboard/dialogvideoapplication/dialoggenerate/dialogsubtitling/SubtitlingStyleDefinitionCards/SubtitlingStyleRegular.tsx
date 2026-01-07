import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Box, IconButton, Typography, Button } from '@mui/material';
import { 
  VerticalAlignTop, 
  VerticalAlignCenter, 
  VerticalAlignBottom,
  Close as CloseIcon
} from '@mui/icons-material';
import { applyCapitalization } from './SubtitlingUtils';
import { SubtitlingStyleProps } from "./SubtitlingStyleProps";
import { getSubtitleVideoBackground } from '../SubtitlingVideoBackgrounds';
import { getPositionStyles } from './SubtitlingPositionUtils';
import { SubtitleCapitalizationMethod } from '@/api/models/SubtitleCapitalizationMethod';
import { SubtitlePosition } from '@/api/models/SubtitlePosition';
import { SubtitleConfiguration } from '@/api/models/SubtitleConfiguration';
import { EventType } from '@/events';
import { LanguageCode, SubtitleStyle } from '@/api/models';
import { subtitleRegularColorOptions } from '@/constants/SubtitleColors';

// Helper function to convert capitalization style
const convertCapitalizationStyle = (style: 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words'): SubtitleCapitalizationMethod => {
  switch (style) {
    case 'uppercase':
      return SubtitleCapitalizationMethod.Uppercase;
    case 'lowercase':
      return SubtitleCapitalizationMethod.Lowercase;
    case 'capitalize_first_char_in_words':
      return SubtitleCapitalizationMethod.CapitalizeFirstCharInWords;
    default:
      return SubtitleCapitalizationMethod.Default;
  }
};

// Helper function to convert position
const convertPosition = (position: 'top' | 'center' | 'bottom'): SubtitlePosition => {
  switch (position) {
    case 'top':
      return SubtitlePosition.Top;
    case 'bottom':
      return SubtitlePosition.Bottom;
    default:
      return SubtitlePosition.Center;
  }
};

interface RegularPreviewProps {
  colorOption: typeof subtitleRegularColorOptions[0];
  initialCapitalization: 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words';
  isSelected: boolean;
  onSelect: (colorValue: string) => void;
  showSelectButton?: boolean;
  disableSelectionListener?: boolean; // Disable selection change listener for static previews
  staysInSelectedBucket?: boolean; // If true, the card will stay in the selected bucket even if the selection is changed
}

export const RegularPreviewCard: React.FC<RegularPreviewProps> = ({ 
  colorOption, 
  initialCapitalization,
  isSelected,
  onSelect,
  showSelectButton = true,
  disableSelectionListener = false,
  staysInSelectedBucket = false
}) => {
  const [position, setPosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [capitalization, setCapitalization] = useState(initialCapitalization);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [isCardSelected, setIsCardSelected] = useState(false);

  const text = applyCapitalization('THE QUICK BROWN FOX JUMPS OVER', capitalization);
  const words = text.split(' ');
  const inactiveColor = '#ffffff';

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
    }, 500);
    return () => clearInterval(interval);
  }, [words.length]);

  // Listen for selection changes (only if not disabled)
  useEffect(() => {
    if (disableSelectionListener) return;
    
    const handleSelectionChange = (event: CustomEvent) => {
      const selectedIds = event.detail.selectedIds as string[];
      const cardId = `regular_${colorOption.name}`;
      setIsCardSelected(selectedIds.includes(cardId));
    };

    window.addEventListener(EventType.SUBTITLE_SELECTION_CHANGED, handleSelectionChange as EventListener);
    return () => {
      window.removeEventListener(EventType.SUBTITLE_SELECTION_CHANGED, handleSelectionChange as EventListener);
    };
  }, [colorOption.name, disableSelectionListener]);

  const handleToggleSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const cardId = `regular_${colorOption.name}`;
    const cardName = `Regular - ${colorOption.name}`;
    
    console.log('[RegularPreviewCard] Toggle selection:', { cardId, cardName, isCardSelected });
    
    const subtitleConfiguration: SubtitleConfiguration = {
      id: cardId,
      kind: 'regular',
      name: cardName,
      font: 'Arial',
      animation: 'Word by word',
      color: colorOption.name,
      size: 16,
      subtitleStyle: SubtitleStyle.Regular,
      subtitleActiveColor: colorOption?.videoColor?.activeColor || (colorOption as any)?.activeColor || '&H00FFFFFF',
      subtitleInactiveColor: colorOption?.videoColor?.inactiveColor || (colorOption as any)?.inactiveColor || '&H00FFFFFF',
      subtitleBoxBackgroundColor: null,
      subtitleCapitalizationMethod: convertCapitalizationStyle(capitalization),
      subtitlePosition: convertPosition(position),
      subtitleBoxFontColor: colorOption?.videoColor?.activeColor || (colorOption as any)?.activeColor || '&H00FFFFFF',
      subtitleBoxTransparency: 0,
      subtitleBoxCornerRadius: 0,
      subtitleBoxWidthCompensation: 1,
      subtitleBoxBorderThickness: 0,
      subtitleFontSize: 16,
      subtitleFontName: 'Arial',
      subtitleFontBold: false,
      subtitleFontItalic: false,
      subtitleFontUnderline: false,
      subtitleLanguageCode: LanguageCode.En,
    } as SubtitleConfiguration;
    
    const event = new CustomEvent(EventType.SUBTITLE_CARD_TOGGLE, {
      detail: { 
        isCurrentlySelected: isCardSelected,
        subtitleConfiguration
      }
    });
    window.dispatchEvent(event);
  };

  const videoSrc = getSubtitleVideoBackground('regular');
  const positionStyle = getPositionStyles(position);

  return (
    <Box 
      sx={{ 
        position: 'relative',
        width: '100%',
        aspectRatio: '9/16',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: '#000',
        border: isSelected ? `3px solid ${colorOption?.ui?.activeColor || (colorOption as any)?.value || 'transparent'}` : '3px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }
      }}
      onClick={() => onSelect(colorOption?.ui?.activeColor || (colorOption as any)?.value)}
    >
      {/* Video Background */}
      <video
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.7
        }}
      />

      {/* Position Controls (Left) */}
      {!staysInSelectedBucket && <Box
        sx={{
          position: 'absolute',
          left: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          zIndex: 10
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {['top', 'center', 'bottom'].map((pos) => (
          <IconButton
            key={pos}
            size="small"
            onClick={() => setPosition(pos as any)}
            sx={{
              bgcolor: position === pos ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
              color: position === pos ? 'white' : 'black',
              width: 18,
              height: 18,
              padding: 0.3,
              '&:hover': {
                bgcolor: position === pos ? 'black' : 'white'
              }
            }}
          >
            {pos === 'top' && <VerticalAlignTop sx={{ fontSize: 10 }} />}
            {pos === 'center' && <VerticalAlignCenter sx={{ fontSize: 10 }} />}
            {pos === 'bottom' && <VerticalAlignBottom sx={{ fontSize: 10 }} />}
          </IconButton>
        ))}
      </Box>}

      {/* Capitalization Controls (Top Right) */}
      {!staysInSelectedBucket && <Box
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          zIndex: 10
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="contained"
          size="small"
          onClick={() => setCapitalization('uppercase')}
          sx={{
            minWidth: 18,
            height: 15,
            p: 0,
            fontSize: '0.35rem',
            bgcolor: capitalization === 'uppercase' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
            color: capitalization === 'uppercase' ? 'white' : 'black',
            '&:hover': { bgcolor: capitalization === 'uppercase' ? 'black' : 'white' }
          }}
        >
          AA
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => setCapitalization('capitalize_first_char_in_words')}
          sx={{
            minWidth: 18,
            height: 15,
            p: 0,
            fontSize: '0.35rem',
            bgcolor: capitalization === 'capitalize_first_char_in_words' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
            color: capitalization === 'capitalize_first_char_in_words' ? 'white' : 'black',
            '&:hover': { bgcolor: capitalization === 'capitalize_first_char_in_words' ? 'black' : 'white' }
          }}
        >
          Aa
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => setCapitalization('lowercase')}
          sx={{
            minWidth: 18,
            height: 15,
            p: 0,
            fontSize: '0.35rem',
            bgcolor: capitalization === 'lowercase' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
            color: capitalization === 'lowercase' ? 'white' : 'black',
            '&:hover': { bgcolor: capitalization === 'lowercase' ? 'black' : 'white' }
          }}
        >
          aa
        </Button>
      </Box>
      }

      {/* Subtitle Preview */}
      <Box
        sx={{
          position: 'absolute',
          ...positionStyle,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 0.5,
          px: 1
        }}
      >
        {words.map((word, index) => {
          const isActive = index === activeWordIndex;
          // Safety check for colorOption.ui
          const activeColor = colorOption?.ui?.activeColor || (colorOption as any)?.value || '#ffffff';

          return (
            <span
              key={index}
              style={{
                color: isActive ? activeColor : inactiveColor,
                fontWeight: isActive ? 900 : 600,
                fontSize: '0.5rem',
                textShadow: isActive ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {word}
            </span>
          );
        })}
      </Box>
      
      {/* Select/Unselect Button */}
      {!staysInSelectedBucket && showSelectButton && (
        <Box
        sx={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          pointerEvents: 'auto'
        }}
        onClick={handleToggleSelection}
      >
        <Button
          size="small"
          variant={isCardSelected ? 'contained' : 'outlined'}
          sx={{
            fontSize: '0.5rem',
            padding: '2px 8px',
            minWidth: 'auto',
            bgcolor: isCardSelected ? '#000000' : 'rgba(255, 255, 255, 0.95)',
            color: isCardSelected ? 'white' : '#000000',
            border: isCardSelected ? 'none' : '1px solid #000000',
            pointerEvents: 'auto',
            '&:hover': {
              bgcolor: isCardSelected ? '#333333' : 'rgba(255, 255, 255, 1)',
            }
          }}
        >
          {isCardSelected ? 'Unselect' : 'Select'}
        </Button>
      </Box>
      )}

      {/* Color Name Label */}
      {!staysInSelectedBucket && <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(0,0,0,0.6)',
          color: 'white',
          py: 0.5,
          textAlign: 'center'
        }}
      >
        <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
          {colorOption.name}
        </Typography>
      </Box>}
    </Box>
  );
};

export const SubtitlingStyleRegular: React.FC<SubtitlingStyleProps> = ({ capitalizationStyle, id }) => {
  const text = applyCapitalization('THE QUICK BROWN FOX JUMPS OVER', capitalizationStyle);
  const words = text.split(' ');
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [isSelected, setIsSelected] = useState(false);
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [inactiveColor] = useState('#ffffff');
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [currentCapitalization, setCurrentCapitalization] = useState<'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words'>(
    ['default', 'uppercase', 'lowercase', 'capitalize_first_char_in_words'].includes(capitalizationStyle) 
      ? capitalizationStyle as 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words'
      : 'uppercase'
  );
  const [currentPosition, setCurrentPosition] = useState<'top' | 'center' | 'bottom'>('center');

    // Mark initial mount as complete
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsInitialMount(false);
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    // Listen for config changes from parent
    useEffect(() => {
      const handleConfigChange = (event: CustomEvent) => {
        const { capitalizationStyle: newCap, position: newPos } = event.detail;
        if (newCap && ['default', 'uppercase', 'lowercase', 'capitalize_first_char_in_words'].includes(newCap)) {
          setCurrentCapitalization(newCap as 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words');
        }
        if (newPos && ['top', 'center', 'bottom'].includes(newPos)) {
          setCurrentPosition(newPos as 'top' | 'center' | 'bottom');
        }
      };

      window.addEventListener(EventType.SUBTITLING_CONFIG_CHANGED, handleConfigChange as EventListener);
      return () => {
        window.removeEventListener(EventType.SUBTITLING_CONFIG_CHANGED, handleConfigChange as EventListener);
      };
    }, []);

    // Dispatch color change event (skip on initial mount, only when color actually changes)
    useEffect(() => {
      // Only dispatch if this component is selected and it's not the initial mount
      if (isInitialMount || !isSelected) {
        return;
      }
      
      let selectedColorOption = subtitleRegularColorOptions.find((color) => (color?.ui?.activeColor || (color as any)?.value) === selectedColor);
      if (!selectedColorOption) {
        selectedColorOption = subtitleRegularColorOptions[0];
      }

      const activeColor = selectedColorOption?.videoColor?.activeColor || (selectedColorOption as any)?.activeColor || '&H00FFFFFF';
      const inactiveColor = selectedColorOption?.videoColor?.inactiveColor || (selectedColorOption as any)?.inactiveColor || '&H00FFFFFF';

      const event = new CustomEvent(EventType.SUBTITLING_SELECT_SUBTITLE_STYLE, {
        detail: {
          subtitleStyle: 'regular',
          activeColor: activeColor,
          inactiveColor: inactiveColor,
          subtitleBoxBackgroundColor: null,
          subtitle_capitalization_method: convertCapitalizationStyle(currentCapitalization),
          subtitle_position: convertPosition(currentPosition)
        }
      });
      
      window.dispatchEvent(event);

      // Dispatch subtitle details update event
      const detailsEvent = new CustomEvent(EventType.SUBTITLE_DETAILS_UPDATE, {
        detail: {
          id: 'regular',
          font: 'Arial',
          animation: 'Word by word',
          color: selectedColorOption.name,
          size: 16,
          activeColor: activeColor,
          inactiveColor: inactiveColor,
          subtitle_capitalization_method: convertCapitalizationStyle(currentCapitalization),
          subtitle_position: convertPosition(currentPosition)
        }
      });
      console.log('[SubtitlingStyleRegular] Dispatching subtitle-details-update:', detailsEvent.detail);
      window.dispatchEvent(detailsEvent);
    }, [selectedColor, isInitialMount, isSelected]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showColorDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showColorDialog]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => {
        if (prev < words.length - 1) {
          return prev + 1;
        }
        return 0;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    const handleStyleSelected = (event: CustomEvent) => {
      const selectedId = event.detail.id;
      if (selectedId === id) {
        setIsSelected(true);
      } else {
        setIsSelected(false);
      }
    };

    window.addEventListener(EventType.SHORT_SUBTITLE_STYLE_SELECTED, handleStyleSelected as EventListener);

    return () => {
      window.removeEventListener(EventType.SHORT_SUBTITLE_STYLE_SELECTED, handleStyleSelected as EventListener);
    };
  }, [id]);

  return (
    <div style={{ 
      position: 'relative',
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      minHeight: '100px',
      justifyContent: 'flex-start',
      alignItems: 'center',
    }}>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '4px',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '10px',
        paddingBottom: isSelected ? '40px' : '0',
      }}>
        {words.map((word, index) => {
          const isActive = index === activeWordIndex;
          const hasBeenShown = index <= activeWordIndex;

          if (!hasBeenShown) {
            return null; // Don't show words that haven't appeared yet
          }
          
          return (
            <span
              key={index}
              style={{
                color: isActive ? (selectedColor ? selectedColor : (subtitleRegularColorOptions[0]?.ui?.activeColor || '#ffffff')) : inactiveColor,
                fontWeight: isActive ? 900 : 600,
                fontSize: '0.6rem',
                textShadow: isActive ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
      {isSelected && (
        <button
          onClick={() => setShowColorDialog(true)}
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            backgroundColor: selectedColor ? selectedColor : subtitleRegularColorOptions[0].ui.activeColor,
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            padding: '6px 12px',
            fontSize: '0.7rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          colors
        </button>
      )}

      {/* Color Selection Dialog - Rendered via Portal */}
      {showColorDialog && ReactDOM.createPortal(
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box
            sx={{
              bgcolor: '#1f2937',
              borderRadius: 3,
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 3,
              borderBottom: '1px solid #374151'
            }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                Choose Color Variation
              </Typography>
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorDialog(false);
                }} 
                sx={{ color: '#9ca3af' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ 
              p: 3, 
              overflowY: 'auto', 
              flex: 1 
            }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' },
                gap: 2 
              }}>
                {subtitleRegularColorOptions.map((color) => (
                  <RegularPreviewCard
                    key={color.name}
                    colorOption={color}
                    initialCapitalization={capitalizationStyle as 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words'}
                    isSelected={selectedColor === color.ui.activeColor}
                    onSelect={(colorValue) => {
                      setSelectedColor(colorValue);
                    }}
                    showSelectButton={true}
                    staysInSelectedBucket={false}
                    disableSelectionListener={false}
                  />
                ))}
              </Box>
            </Box>
          </Box>
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              zIndex: -1 
            }} 
            onClick={() => setShowColorDialog(false)}
          />
        </Box>,
        document.body
      )}
    </div>
  );
};
