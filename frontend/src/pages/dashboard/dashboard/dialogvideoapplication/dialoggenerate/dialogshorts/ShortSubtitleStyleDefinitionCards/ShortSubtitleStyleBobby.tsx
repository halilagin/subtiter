import React, { useState, useEffect } from 'react';
import { applyCapitalization } from './ShortSubtitleUtils';
import {ShortSubtitleStyleProps} from "./ShortSubtitleStyleProps"
import { SubtitleConfiguration } from '@/api/models/SubtitleConfiguration';



export const ShortSubtitleStyleBobby: React.FC<ShortSubtitleStyleProps> = ({ capitalizationStyle, id }) => {
  const text = 'THE QUICK BROWN FOX JUMPS OVER';
  const displayText = applyCapitalization(text, capitalizationStyle);
  const words = displayText.split(' ');
  
  // Split into 3 lines
  const line1 = words.slice(0, 2); // ["THE", "QUICK"]
  const line2 = words.slice(2, 5); // ["BROWN", "FOX", "JUMPS"]
  const line3 = words.slice(5); // ["OVER"]
  
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const allLines = [line1, line2, line3];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => {
        const currentLine = allLines[activeLineIndex];
        if (prev < currentLine.length - 1) {
          return prev + 1;
        } else {
          // Move to next line
          setActiveLineIndex((linePrev) => {
            if (linePrev < allLines.length - 1) {
              return linePrev + 1;
            }
            return 0; // Reset to beginning
          });
          return 0; // Reset word index
        }
      });
    }, 500); // Change word every 500ms

    return () => clearInterval(interval);
  }, [activeLineIndex, allLines.length]);

  useEffect(() => {
    const handleStyleSelected = (event: CustomEvent<SubtitleConfiguration>) => {
      const config = event.detail;
      const selectedId = config.id;
      if (selectedId === id) {
        console.log('ShortSubtitleStyleBobby received event with id:', id);
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
      {allLines.map((line, lineIndex) => {
        if (lineIndex !== activeLineIndex) {
          return null; // Only show the current active line
        }
        
        return (
          <div key={lineIndex} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {line.map((word, wordIndex) => {
              const isActive = wordIndex === activeWordIndex;
              
              return (
                <span
                  key={wordIndex}
                  style={{
                    color: isActive ? '#ff69b4' : '#f5f5dc',
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    fontFamily: isActive ? 'sans-serif' : 'serif',
                    fontStyle: isActive ? 'italic' : 'normal',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

