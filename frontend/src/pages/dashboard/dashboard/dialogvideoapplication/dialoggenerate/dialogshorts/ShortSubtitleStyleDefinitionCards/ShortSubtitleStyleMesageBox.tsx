import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { applyCapitalization } from './ShortSubtitleUtils';
import {ShortSubtitleStyleProps} from "./ShortSubtitleStyleProps"
import { useGridEditing } from '@mui/x-data-grid/internals';
import { SubtitleConfiguration } from '@/api/models/SubtitleConfiguration';
import { EventType } from '@/events';
import { SubtitleStyle } from '@/api/models/SubtitleStyle';
import { SubtitlePosition } from '@/api/models/SubtitlePosition';
import { SubtitleCapitalizationMethod } from '@/api/models/SubtitleCapitalizationMethod';
import { LanguageCode } from '@/api/models/LanguageCode';
import { subtitleMessageBoxColorOptions as colorOptions } from '@/constants/SubtitleColors';
import { SubtitleApplication as SubtitleApplicationInterface } from '@/api/models/SubtitleApplication';

interface ShortSubtitleMessageBoxColorCardProps {
  color: typeof colorOptions[0];
  lines: string[];
  activeLineIndex: number;
  isVisible: boolean;
  onColorSelect: (color: typeof colorOptions[0]) => void;
}

const ShortSubtitleMessageBoxColorCard: React.FC<ShortSubtitleMessageBoxColorCardProps> = ({
  color,
  lines,
  activeLineIndex,
  isVisible,
  onColorSelect,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#374151',
        borderRadius: '8px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={() => onColorSelect(color)}
    >
      <div style={{ marginBottom: '12px' }}>
        <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 600 }}>{color.name}</span>
      </div>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '4px',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '40px',
      }}>
        {isVisible && (
          <div
            style={{
              color: '#ffffff',
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
      </div>
    </div>
  );
};

export const ShortSubtitleStyleMesageBox: React.FC<ShortSubtitleStyleProps> = ({ capitalizationStyle, id, videoId, position = 'center' }) => {
  // Split text into 4 lines for message box display
  const fullText = applyCapitalization('THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG', capitalizationStyle);
  const words = fullText.split(' ');
  
  // Create 4 lines from the words
  const lines = [
    words.slice(0, 3).join(' '),  // "THE QUICK BROWN"
    words.slice(3, 6).join(' '),  // "FOX JUMPS OVER"
    words.slice(6, 8).join(' '),  // "THE LAZY"
    words.slice(8, 9).join(' '),  // "DOG"
  ];
  
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [isInitialMount, setIsInitialMount] = useState(true);

  

  /*
# Fancy Colour Examples
# Sky blue: &H00EBCE87
# Deep Teal: &H00808000
# Vibrant Magenta: &H00D400A7
# Goldenrod: &H0020A5DA
# Cool Lavender: &H00FAE6E6
# Burnt Sienna: &H005A82E9
# Slate Blue: &H00CD5A6A
# Mint Green: &H0071B33C
# Crimson Red: &H003C14DC
# Living Coral: &H00507FFF
# Charcoal Gray: &H004F4536
# Electric Blue: &H00FF7F00
# Emerald Green: &H0050C878
# Ruby Red: &H0025169A
# Sunny Yellow: &H0000FFFF
# Amethyst Purple: &H00D36099
# Tangerine Orange: &H000080FF
# Rose Gold: &H0071AAB7
# Turquoise: &H00D0E040
# Forest Green: &H00228B22
# Indigo: &H0082004B
  */



    // Mark initial mount as complete
    useEffect(() => {
      // Use a small delay to ensure parent listeners are set up
      const timer = setTimeout(() => {
        setIsInitialMount(false);
      }, 100);
      return () => clearTimeout(timer);
    }, []);

 

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
    // Show line for 0.5 seconds, hide for 0.5 seconds, then show next line
    const showDuration = 500; // 0.5 seconds visible
    const hideDuration = 500; // 0.5 seconds hidden
    const totalCycleDuration = showDuration + hideDuration; // 1 second per line
    
    let timeoutId: NodeJS.Timeout;
    
    const animate = () => {
      // Show the current line
      setIsVisible(true);
      
      // After showDuration, hide it
      timeoutId = setTimeout(() => {
        setIsVisible(false);
        
        // After hideDuration, move to next line
        timeoutId = setTimeout(() => {
          setActiveLineIndex((prev) => {
            if (prev < lines.length - 1) {
              return prev + 1;
            }
            return 0; // Reset to beginning
          });
        }, hideDuration);
      }, showDuration);
    };
    
    // Start the animation
    animate();
    
    // Set up interval for continuous animation
    const interval = setInterval(animate, totalCycleDuration);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [lines.length, activeLineIndex]);

  useEffect(() => {
    const handleStyleSelected = (event: CustomEvent<SubtitleConfiguration>) => {
      const config = event.detail;
      const selectedId = config.id;
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

  // Listen for color button click from main section
  useEffect(() => {
    const handleColorButtonClick = (event: CustomEvent<{ id: string }>) => {
      if (event.detail.id === id && isSelected) {
        setShowColorDialog(true);
      }
    };

    window.addEventListener('short-subtitle-color-button-click', handleColorButtonClick as EventListener);
    return () => {
      window.removeEventListener('short-subtitle-color-button-click', handleColorButtonClick as EventListener);
    };
  }, [id, isSelected]);

  // Dispatch color changed event when color changes
  useEffect(() => {
    if (isSelected) {
      const event = new CustomEvent('short-subtitle-color-changed', {
        detail: { id, color: selectedColor.ui.activeBoxColor }
      });
      window.dispatchEvent(event);
    }
  }, [selectedColor, isSelected, id]);

  const handleColorSelect = (color: typeof colorOptions[0], videoId?: string) => {
    console.log('handleColorSelect', color);
    setSelectedColor(color);
    const event = new CustomEvent(EventType.UPDATE_SHORT_CONFIG_SUBTITLE_STYLE, {
        detail: {
          videoId: videoId,
          subtitleApplication: {
            subtitleConfiguration: [
              {
                  id: 'message_box',
                  name: 'message_box',
                  animation: undefined,
                  color: '#FFFFFF',
                  size: 16,
                  font: 'Arial',
                  subtitleStyle: SubtitleStyle.MessageBox,
                  subtitleCapitalizationMethod: SubtitleCapitalizationMethod.Default,
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
            ]
          } as SubtitleApplicationInterface
        }
      }) as CustomEvent<SubtitleApplicationInterface>;
      console.log('dispatch handleColorSelect', event.detail);
      window.dispatchEvent(event);
  };

  return (
    <div style={{ 
      position: 'relative',
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      minHeight: '100px',
      justifyContent: position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'center',
      alignItems: 'center',
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '8px',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: position === 'top' ? '0' : position === 'bottom' ? '0' : '10px',
        paddingBottom: '0',
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
              backgroundColor: selectedColor.ui.activeBoxColor,
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
      {/* Color button removed - now in main section */}

      {/* Color Selection Dialog - Rendered via Portal */}
      {showColorDialog && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowColorDialog(false)}
        >
          <div
            style={{
              backgroundColor: '#1f2937',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '24px 24px 16px 24px',
              borderBottom: '1px solid #374151',
            }}>
              <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1.2rem' }}>Choose Box Color</h3>
              <button
                onClick={() => setShowColorDialog(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#9ca3af',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ 
              padding: '24px',
              overflowY: 'auto',
              flex: '1',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {colorOptions.map((color) => (
                  <ShortSubtitleMessageBoxColorCard
                    key={color.name}
                    color={color}
                    lines={lines}
                    activeLineIndex={activeLineIndex}
                    isVisible={isVisible}
                    onColorSelect={() => {
                      handleColorSelect(color, videoId);
                    setShowColorDialog(false);
                  }}
                  />
              ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

