import React, { useState, useEffect } from 'react';
import { applyCapitalization } from './ShortSubtitleUtils';
import {ShortSubtitleStyleProps} from "./ShortSubtitleStyleProps"
import { SubtitleConfiguration } from '@/api/models/SubtitleConfiguration';


export const ShortSubtitleStyleKaraokePopup: React.FC<ShortSubtitleStyleProps> = ({ capitalizationStyle, id }) => {
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
          console.log('ShortSubtitleStyleKaraokePopup received event with id:', id);
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
        gap: '2px',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {words.map((word, index) => {
          const isActive = index === activeWordIndex;
          
          return (
            <span
              key={index}
              style={{
                color: isActive ? '#00ff00' : '#ffffff',
                fontWeight: 700,
                fontSize: '0.6rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                transition: 'all 0.2s ease',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    );
  };