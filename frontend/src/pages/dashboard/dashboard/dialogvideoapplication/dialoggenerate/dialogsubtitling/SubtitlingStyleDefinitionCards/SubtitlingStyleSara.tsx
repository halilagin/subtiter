import React, { useState, useEffect } from 'react';
import { applyCapitalization } from './SubtitlingUtils';
import {SubtitlingStyleProps} from "./SubtitlingStyleProps"

export const SubtitlingStyleSara: React.FC<SubtitlingStyleProps> = ({ capitalizationStyle, id }) => {
  const text = applyCapitalization('The quick brown fox', capitalizationStyle);
  const words = text.split(' ');
  
  // Split into 3 lines
  const line1 = words.slice(0, 1).join(' '); // "The"
  const line2 = words.slice(1, 3).join(' '); // "quick brown"
  const line3 = words.slice(3).join(' '); // "fox"
  
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
        console.log('SubtitlingStyleSara received event with id:', id);
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
            color: 'white', 
            fontWeight: 500,
            fontSize: '0.65rem',
            fontStyle: 'italic',
            textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease'
          }}>
            {line}
          </div>
        );
      })}
    </div>
  );
};

