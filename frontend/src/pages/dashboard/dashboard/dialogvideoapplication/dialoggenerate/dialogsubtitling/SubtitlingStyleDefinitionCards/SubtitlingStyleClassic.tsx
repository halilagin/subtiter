import React, { useState, useEffect } from 'react';
import { applyCapitalization } from './SubtitlingUtils';
import {SubtitlingStyleProps} from "./SubtitlingStyleProps"



export const SubtitlingStyleClassic: React.FC<SubtitlingStyleProps> = ({ capitalizationStyle, id }) => {
  const text = 'THE QUICK BROWN FOX JUMPS OVER';
  const displayText = applyCapitalization(text, capitalizationStyle);
  const lines = displayText.split(' ');
  
  // Split into 3 lines
  const line1 = lines.slice(0, 2).join(' '); // "the quick"
  const line2 = lines.slice(2, 5).join(' '); // "brown fox jumps"
  const line3 = lines.slice(5).join(' '); // "over"
  
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const allLines = [line1, line2, line3];

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

  useEffect(() => {
    const handleStyleSelected = (event: CustomEvent) => {
      const selectedId = event.detail.id;
      if (selectedId === id) {
        console.log('SubtitlingStyleClassic received event with id:', id);
      }
    };

    window.addEventListener('short-subtitle-style-selected', handleStyleSelected as EventListener);

    return () => {
      window.removeEventListener('short-subtitle-style-selected', handleStyleSelected as EventListener);
    };
  }, [id]);
  
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
            color: '#ffff00', 
            fontWeight: 900,
            fontSize: '0.8rem',
            fontFamily: 'sans-serif',
            transition: 'all 0.3s ease'
          }}>
            {line}
          </div>
        );
      })}
    </div>
  );
};

