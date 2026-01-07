import React, { useState, useEffect } from 'react';
import { applyCapitalization } from './ShortSubtitleUtils';
import {ShortSubtitleStyleProps} from "./ShortSubtitleStyleProps"
import { SubtitleConfiguration } from '@/api/models/SubtitleConfiguration';


export const ShortSubtitleStyleBeast: React.FC<ShortSubtitleStyleProps> = ({ capitalizationStyle, id }) => {
  const text = applyCapitalization('THE QUICK BROWN FOX JUMPS OVER', capitalizationStyle);
  const words = text.split(' ');
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => {
        if (prev < words.length - 1) {
          return prev + 1;
        }
        return 0; // Reset to beginning
      });
    }, 500); // Change word every 500ms

    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    const handleStyleSelected = (event: CustomEvent<SubtitleConfiguration>) => {
      const config = event.detail;
      const selectedId = config.id;
      if (selectedId === id) {
        console.log('ShortSubtitleStyleBeast received event with id:', id);
      }
    };

    window.addEventListener('short-subtitle-style-selected', handleStyleSelected as EventListener);

    return () => {
      window.removeEventListener('short-subtitle-style-selected', handleStyleSelected as EventListener);
    };
  }, [id]);

  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '4px',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {words.map((word, index) => {
        const isActive = index === activeWordIndex;
        
        if (index !== activeWordIndex) {
          return null; // Only show the current active word
        }
        
        return (
          <span
            key={index}
            style={{
              color: '#000000',
              fontWeight: 'bold',
              fontSize: 'clamp(0.4rem, 1.5vw, 0.6rem)',
              fontFamily: 'sans-serif',
              letterSpacing: '0.02em',
              lineHeight: '1.2',
              backgroundColor: 'white',
              padding: 'clamp(2px, 0.5vw, 4px) clamp(4px, 1vw, 6px)',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

