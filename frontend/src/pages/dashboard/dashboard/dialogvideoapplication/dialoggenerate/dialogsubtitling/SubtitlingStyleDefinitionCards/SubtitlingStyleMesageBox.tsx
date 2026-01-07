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
import { subtitleMessageBoxColorOptions } from '@/constants/SubtitleColors';
import { LanguageCode, SubtitleStyle } from '@/api/models';

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

interface MessageBoxPreviewProps {
  color: typeof subtitleMessageBoxColorOptions[0];
  initialCapitalization: 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words';
  isSelected: boolean;
  onSelect: (colorValue: string) => void;
  disableSelectionListener?: boolean; // Disable selection change listener for static previews
  staysInSelectedBucket?: boolean; // Indicates if this card is in the selected bucket
}

export const MessageBoxPreviewCard: React.FC<MessageBoxPreviewProps> = ({ 
  color, 
  initialCapitalization,
  isSelected,
  onSelect,
  disableSelectionListener = false,
  staysInSelectedBucket = false
}) => {
  const [position, setPosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [capitalization, setCapitalization] = useState(initialCapitalization);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isCardSelected, setIsCardSelected] = useState(false);

  const text = applyCapitalization('THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG', capitalization);
  const words = text.split(' ');
  
  // Create 4 lines from the words
  const lines = [
    words.slice(0, 3).join(' '),  // "THE QUICK BROWN"
    words.slice(3, 6).join(' '),  // "FOX JUMPS OVER"
    words.slice(6, 8).join(' '),  // "THE LAZY"
    words.slice(8, 9).join(' '),  // "DOG"
  ];

  useEffect(() => {
    const showDuration = 500; 
    const hideDuration = 500;
    const totalCycleDuration = showDuration + hideDuration;
    
    let timeoutId: NodeJS.Timeout;
    
    const animate = () => {
      setIsVisible(true);
      timeoutId = setTimeout(() => {
        setIsVisible(false);
        timeoutId = setTimeout(() => {
          setActiveLineIndex((prev) => (prev < lines.length - 1 ? prev + 1 : 0));
        }, hideDuration);
      }, showDuration);
    };
    
    animate();
    const interval = setInterval(animate, totalCycleDuration);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [lines.length]);

  // Listen for selection changes (only if not disabled)
  useEffect(() => {
    if (disableSelectionListener) return;
    
    const handleSelectionChange = (event: CustomEvent) => {
      const selectedIds = event.detail.selectedIds as string[];
      const cardId = `message_box_${color.name}`;
      setIsCardSelected(selectedIds.includes(cardId));
    };

    window.addEventListener(EventType.SUBTITLE_SELECTION_CHANGED, handleSelectionChange as EventListener);
    return () => {
      window.removeEventListener(EventType.SUBTITLE_SELECTION_CHANGED, handleSelectionChange as EventListener);
    };
  }, [color.name, disableSelectionListener]);

  const handleToggleSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const cardId = `message_box_${color.name}`;
    const cardName = `Message Box - ${color.name}`;
    
    console.log('[MessageBoxPreviewCard] Toggle selection:', { cardId, cardName, isCardSelected });
    
    const subtitleConfiguration: SubtitleConfiguration =  {
        id: cardId,
        kind: 'message_box',
        name: cardName,
        animation: undefined,
        color: color.name,
        size: 16,
        font: 'Arial',
        subtitleStyle: SubtitleStyle.MessageBox,
        subtitleCapitalizationMethod: SubtitleCapitalizationMethod.Default,
        subtitlePosition: SubtitlePosition.Bottom,
        subtitleBoxFontColor: color.ui.activeColor,
        subtitleBoxTransparency: 0,
        subtitleBoxBackgroundColor: color.videoColor.activeBoxColor,    
        subtitleInactiveColor: color.videoColor.inactiveColor,
        subtitleActiveColor: color.videoColor.activeColor,
        subtitleBoxCornerRadius: 0,
        subtitleBoxWidthCompensation: 1,
        subtitleBoxBorderThickness: 0,
        subtitleFontSize: 16,
        subtitleFontName: 'Arial',
        subtitleFontBold: false,
        subtitleFontItalic: false,
        subtitleFontUnderline: false,
        subtitleLanguageCode: LanguageCode.En,
    } as SubtitleConfiguration
    
    const event = new CustomEvent(EventType.SUBTITLE_CARD_TOGGLE, {
      detail: { 
        isCurrentlySelected: isCardSelected,
        subtitleConfiguration
      }
    });
    window.dispatchEvent(event);
  };

  const videoSrc = getSubtitleVideoBackground('message_box');
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
        border: isSelected ? `3px solid ${color.ui.activeBoxColor}` : '3px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }
      }}
      onClick={() => onSelect(color.ui.activeBoxColor)}
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
      </Box>}

      {/* Subtitle Preview */}
      <Box
        sx={{
          position: 'absolute',
          ...positionStyle,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          px: 1
        }}
      >
        {isVisible && (
          <div
            style={{
              color: color.ui.activeColor,
              fontWeight: 700,
              fontSize: '0.55rem',
              textAlign: 'center',
              backgroundColor: color.ui.activeBoxColor,
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'opacity 0.2s ease',
            }}
          >
            {lines[activeLineIndex % lines.length]}
          </div>
        )}
      </Box>
      
      {/* Select/Unselect Button */}
      {!staysInSelectedBucket && <Box
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
      </Box>}

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
          {color.name}
        </Typography>
      </Box>}
    </Box>
  );
};

export const SubtitlingStyleMesageBox: React.FC<SubtitlingStyleProps> = ({ capitalizationStyle, id }) => {
  const fullText = applyCapitalization('THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG', capitalizationStyle);
  const words = fullText.split(' ');
  
  const lines = [
    words.slice(0, 3).join(' '),
    words.slice(3, 6).join(' '),
    words.slice(6, 8).join(' '),
    words.slice(8, 9).join(' '),
  ];
  
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
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
      if (isInitialMount || !isSelected) {
        return;
      }
      
      let selectedColorOption = subtitleMessageBoxColorOptions.find((color) => color.ui.activeBoxColor === selectedColor);
      if (!selectedColorOption) {
        selectedColorOption = subtitleMessageBoxColorOptions[0];
      }

      const event = new CustomEvent(EventType.SUBTITLING_SELECT_SUBTITLE_STYLE, {
        detail: {
          subtitleStyle: 'message_box',
          activeColor: selectedColorOption.videoColor.activeColor,
          inactiveColor: selectedColorOption.videoColor.inactiveColor,
          subtitleBoxBackgroundColor: selectedColorOption.videoColor.activeBoxColor,
          subtitle_capitalization_method: convertCapitalizationStyle(currentCapitalization),
          subtitle_position: convertPosition(currentPosition)
        }
      });
      
      window.dispatchEvent(event);

      // Dispatch subtitle details update event
      const detailsEvent = new CustomEvent(EventType.SUBTITLE_DETAILS_UPDATE, {
        detail: {
          id: 'message_box',
          font: 'Default',
          animation: 'Line by line with box',
          color: selectedColorOption.name,
          size: 'Medium',
          subtitle_capitalization_method: convertCapitalizationStyle(currentCapitalization),
          subtitle_position: convertPosition(currentPosition)
        }
      });
      console.log('[SubtitlingStyleMesageBox] Dispatching subtitle-details-update:', detailsEvent.detail);
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
    const showDuration = 500;
    const hideDuration = 500;
    const totalCycleDuration = showDuration + hideDuration;
    
    let timeoutId: NodeJS.Timeout;
    
    const animate = () => {
      setIsVisible(true);
      timeoutId = setTimeout(() => {
        setIsVisible(false);
        timeoutId = setTimeout(() => {
          setActiveLineIndex((prev) => (prev < lines.length - 1 ? prev + 1 : 0));
        }, hideDuration);
      }, showDuration);
    };
    
    animate();
    const interval = setInterval(animate, totalCycleDuration);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [lines.length]);

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
        flexDirection: 'column',
        gap: '8px',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '10px',
        paddingBottom: isSelected ? '40px' : '0',
        width: '100%',
        minHeight: '50px',
      }}>
        {isVisible && (
          <div
            style={{
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.6rem',
              textAlign: 'center',
              backgroundColor: selectedColor ? selectedColor : subtitleMessageBoxColorOptions[0].ui.activeBoxColor,
              padding: '6px 12px',
              borderRadius: '8px',
              transition: 'opacity 0.2s ease',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            }}
          >
            {lines[activeLineIndex]}
          </div>
        )}
      </div>
      {isSelected && (
        <button
          onClick={() => setShowColorDialog(true)}
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            backgroundColor: selectedColor ? selectedColor : subtitleMessageBoxColorOptions[0].ui.activeBoxColor,
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
                Choose Box Color
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
                {subtitleMessageBoxColorOptions.map((color) => (
                  <MessageBoxPreviewCard
                    key={color.name+'_'+color.ui.activeBoxColor}
                    color={color}
                    initialCapitalization={capitalizationStyle as 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words'}
                    isSelected={selectedColor === color.ui.activeBoxColor}
                    onSelect={(colorValue) => {
                      setSelectedColor(colorValue);
                    }}
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
