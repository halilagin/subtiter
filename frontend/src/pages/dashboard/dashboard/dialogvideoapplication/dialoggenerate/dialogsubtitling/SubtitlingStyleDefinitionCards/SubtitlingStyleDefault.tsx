import React, { useState, useEffect } from 'react';
import { applyCapitalization } from './SubtitlingUtils';
import {SubtitlingStyleProps} from "./SubtitlingStyleProps";
import { SubtitleCapitalizationMethod } from '@/api/models/SubtitleCapitalizationMethod';
import { SubtitlePosition } from '@/api/models/SubtitlePosition';
import { EventType } from '@/events';

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



export const SubtitlingStyleDefault: React.FC<SubtitlingStyleProps> = ({ capitalizationStyle, id }) => {
  const text = 'THE QUICK BROWN FOX JUMPS OVER';
  const displayText = applyCapitalization(text, capitalizationStyle);
  const words = displayText.split(' ');
  
  // Split into 3 lines
  const line1 = words.slice(0, 2).join(' '); // "THE QUICK"
  const line2 = words.slice(2, 5).join(' '); // "BROWN FOX JUMPS"
  const line3 = words.slice(5).join(' '); // "OVER"
  
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const allLines = [line1, line2, line3];
  const [currentCapitalization, setCurrentCapitalization] = useState<'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words'>(
    ['default', 'uppercase', 'lowercase', 'capitalize_first_char_in_words'].includes(capitalizationStyle) 
      ? capitalizationStyle as 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words'
      : 'uppercase'
  );
  const [currentPosition, setCurrentPosition] = useState<'top' | 'center' | 'bottom'>('center');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLineIndex((prev) => {
        if (prev < allLines.length - 1) {
          return prev + 1;
        }
        return 0; // Reset to beginning
      });
    }, 800); // Change line every 800ms

    return () => clearInterval(interval);
  }, [allLines.length]);

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

  useEffect(() => {
    const handleStyleSelected = (event: CustomEvent) => {
      const selectedId = event.detail.id;
      console.log('[SubtitlingStyleDefault] Received short-subtitle-style-selected:', selectedId, 'my id:', id);
      if (selectedId === id) {
        console.log('[SubtitlingStyleDefault] Match! Dispatching details update');
        
        // Dispatch subtitle details update event
        const detailsEvent = new CustomEvent(EventType.SUBTITLE_DETAILS_UPDATE, {
          detail: {
            id: 'default',
            font: 'Default',
            animation: 'Line by line',
            color: 'White',
            size: 'Medium',
            subtitle_capitalization_method: convertCapitalizationStyle(currentCapitalization),
            subtitle_position: convertPosition(currentPosition)
          }
        });
        console.log('[SubtitlingStyleDefault] Dispatching subtitle-details-update:', detailsEvent.detail);
        window.dispatchEvent(detailsEvent);
      }
    };

    window.addEventListener(EventType.SHORT_SUBTITLE_STYLE_SELECTED, handleStyleSelected as EventListener);

    return () => {
      window.removeEventListener(EventType.SHORT_SUBTITLE_STYLE_SELECTED, handleStyleSelected as EventListener);
    };
  }, [id, currentCapitalization, currentPosition]);
  
  return (
    <div style={{ 
      textAlign: 'center',
      lineHeight: '1.1'
    }}>
      {allLines.map((line, index) => {
        const isActive = index === activeLineIndex;
        
        if (index !== activeLineIndex) {
          return null; // Only show the current active line
        }
        
        return (
          <div key={index} style={{ 
            color: '#ffffff', 
            fontWeight: 700,
            fontSize: '0.6rem',
            transition: 'all 0.3s ease'
          }}>
            {line}
          </div>
        );
      })}
    </div>
  );
};

