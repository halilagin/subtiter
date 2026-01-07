import React, { useState, useEffect } from 'react';
import { applyCapitalization } from './SubtitlingUtils';
import { SubtitlingStyleProps } from './SubtitlingStyleProps';



export const SubtitlingStyleBasker: React.FC<SubtitlingStyleProps> = ({ capitalizationStyle, id }) => {
  const text = 'THE QUICK BROWN FOX JUMPS OVER';
  const displayText = applyCapitalization(text, capitalizationStyle);
  const words = displayText.split(' ');
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
    const handleStyleSelected = (event: CustomEvent) => {
      const selectedId = event.detail.id;
      if (selectedId === id) {
        console.log('SubtitlingStyleBasker received event with id:', id);
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
              color: '#ffd700',
              fontWeight: 900,
              fontSize: 'clamp(0.4rem, 1.5vw, 0.8rem)',
              fontFamily: 'serif',
              letterSpacing: '0.1em',
              lineHeight: '1.2',
              textShadow: '1px 1px 0px #8b0000',
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

