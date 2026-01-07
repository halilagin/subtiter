import React, { useState, useEffect } from 'react';
import { applyCapitalization } from './ShortSubtitleUtils';
import {ShortSubtitleStyleProps} from "./ShortSubtitleStyleProps"
import { SubtitleConfiguration } from '@/api/models/SubtitleConfiguration';

export const ShortSubtitleStyleCyber: React.FC<ShortSubtitleStyleProps> = ({ 
  capitalizationStyle = 'uppercase',
  id
}) => {
  const text = 'THE QUICK BROWN FOX JUMPS OVER';
  const displayText = applyCapitalization(text, capitalizationStyle);
  const words = displayText.split(' ');
  
  // Split into 3 lines
  const line1 = words.slice(0, 2).join(' '); // "THE QUICK"
  const line2 = words.slice(2, 5).join(' '); // "BROWN FOX JUMPS"
  const line3 = words.slice(5).join(' '); // "OVER"
  
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
    const handleStyleSelected = (event: CustomEvent<SubtitleConfiguration>) => {
      const config = event.detail;
      const selectedId = config.id;
      if (selectedId === id) {
        console.log('ShortSubtitleStyleCyber received event with id:', id);
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
      lineHeight: '1.1',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #00ffff',
      background: 'rgba(0, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      {allLines.map((line, index) => {
        const isActive = index === activeLineIndex;
        
        if (index !== activeLineIndex) {
          return null; // Only show the current active line
        }
        
        return (
          <div key={index} style={{ 
            color: '#00ffff', 
            fontWeight: 600,
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            textShadow: '0 0 5px #00ffff, 0 0 10px #00ffff',
            letterSpacing: '0.15em',
            transition: 'all 0.3s ease'
          }}>
            {line}
          </div>
        );
      })}
    </div>
  );
};
