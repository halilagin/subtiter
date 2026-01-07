import React, { useState, useEffect } from 'react';
import { applyCapitalization } from './ShortSubtitleUtils';
import {ShortSubtitleStyleProps} from "./ShortSubtitleStyleProps"
import { SubtitleConfiguration } from '@/api/models/SubtitleConfiguration';


export const ShortSubtitleStyleElegant: React.FC<ShortSubtitleStyleProps> = ({ 
  capitalizationStyle = 'title',
  id
}) => {
  const text = 'THE QUICK BROWN FOX JUMPS OVER';
  const displayText = applyCapitalization(text, capitalizationStyle);
  const words = displayText.split(' ');
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex(prev => (prev + 1) % words.length);
    }, 800);

    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    const handleStyleSelected = (event: CustomEvent<SubtitleConfiguration>) => {
      const config = event.detail;
      const selectedId = config.id;
      if (selectedId === id) {
        console.log('ShortSubtitleStyleElegant received event with id:', id);
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
      justifyContent: 'center',
      alignItems: 'center',
      padding: '8px',
      fontFamily: 'sans-serif',
      fontSize: '0.75rem',
      fontWeight: 700,
      textAlign: 'center',
      lineHeight: 1.3,
      textTransform: 'uppercase',
      gap: '4px'
    }}>
      {words.map((word, index) => (
        <span
          key={index}
          style={{
            color: index === activeWordIndex ? '#ff69b4' : '#ff69b4',
            textShadow: index === activeWordIndex 
              ? '2px 2px 4px rgba(255, 105, 180, 0.6), 4px 4px 8px rgba(255, 105, 180, 0.4)' 
              : '1px 1px 2px rgba(255, 105, 180, 0.3)',
            transform: index === activeWordIndex ? 'scale(1.1)' : 'scale(1)',
            opacity: index === activeWordIndex ? 1 : 0.7,
            transition: 'all 0.3s ease',
            letterSpacing: '0.05em'
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
};
