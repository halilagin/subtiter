import React, { useState, useEffect } from 'react';
import { Block } from '@mui/icons-material';
import { Box } from '@mui/material';
import { ShortSubtitleStyleBeast } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBeast';
import { ShortSubtitleStyleClassic } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleClassic';
import { ShortSubtitleStyleBobby } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBobby';
import { ShortSubtitleStyleBasker } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBasker';
import { applyCapitalization } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleUtils';

// Neon Style Component - line by line like Bobby
export const NeonSubtitleStyle = ({ capitalizationStyle = 'uppercase' }: { capitalizationStyle?: string }) => {
  const baseText = 'THE QUICK BROWN FOX JUMPS OVER';
  
  // Calculate lines based on capitalization
  const getLines = () => {
    const text = applyCapitalization(baseText, capitalizationStyle);
    const words = text.split(' ');
    const line1 = words.slice(0, 2);
    const line2 = words.slice(2, 5);
    const line3 = words.slice(5);
    return [line1, line2, line3];
  };
  
  const [allLines, setAllLines] = useState<string[][]>(getLines());
  
  // Recalculate lines when capitalization changes
  useEffect(() => {
    setAllLines(getLines());
  }, [capitalizationStyle]);
  
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(0);

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
  }, [activeLineIndex, allLines]);

  return (
    <Box sx={{ 
      textAlign: 'center',
      lineHeight: '1.1',
      maxWidth: '100%',
    }}>
      {allLines.map((line, lineIndex) => {
        if (lineIndex !== activeLineIndex) {
          return null; // Only show the current active line
        }
        
        return (
          <Box key={lineIndex} sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2px',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '100%',
          }}>
            {line.map((word, wordIndex) => {
              const isActive = wordIndex === activeWordIndex;
              
              return (
                <Box
                  key={wordIndex}
                  sx={{
                    color: isActive ? '#00ff88' : 'rgba(0, 255, 136, 0.3)',
                    fontSize: 'clamp(0.35rem, 1.2vw, 0.5rem)',
                    fontWeight: 700,
                    textShadow: isActive 
                      ? '0 0 5px #00ff88, 0 0 10px #00ff88'
                      : 'none',
                    fontFamily: 'Arial Black, sans-serif',
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {word}
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};

// Bold Style Component - word by word display (like Basker)
export const BoldSubtitleStyle = ({ capitalizationStyle = 'uppercase' }: { capitalizationStyle?: string }) => {
  const baseText = 'THE QUICK BROWN FOX JUMPS OVER';
  
  const getInitialWords = () => {
    const text = applyCapitalization(baseText, capitalizationStyle);
    return text.split(' ');
  };
  
  const [words, setWords] = useState<string[]>(getInitialWords());
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  
  // Recalculate words when capitalization changes
  useEffect(() => {
    const text = applyCapitalization(baseText, capitalizationStyle);
    setWords(text.split(' '));
    setActiveWordIndex(0); // Reset to first word when capitalization changes
  }, [capitalizationStyle]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => {
        if (prev < words.length - 1) {
          return prev + 1;
        }
        return 0;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [words]);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: '100%',
    }}>
      {words.map((word, index) => {
        if (index !== activeWordIndex) {
          return null;
        }
        return (
          <Box
            key={index}
            sx={{
              color: '#ff3366',
              fontSize: 'clamp(0.4rem, 1.3vw, 0.55rem)',
              fontWeight: 900,
              fontFamily: 'Arial Black, sans-serif',
              textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8), 0 0 3px rgba(255, 51, 102, 0.5)',
              transition: 'all 0.3s ease',
            }}
          >
            {word}
          </Box>
        );
      })}
    </Box>
  );
};

// Minimal Style Component - word by word display (like Basker)
export const MinimalSubtitleStyle = ({ capitalizationStyle = 'lowercase' }: { capitalizationStyle?: string }) => {
  const baseText = 'the quick brown fox jumps over';
  
  const getInitialWords = () => {
    const text = applyCapitalization(baseText, capitalizationStyle);
    return text.split(' ');
  };
  
  const [words, setWords] = useState<string[]>(getInitialWords());
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  
  // Recalculate words when capitalization changes
  useEffect(() => {
    const text = applyCapitalization(baseText, capitalizationStyle);
    setWords(text.split(' '));
    setActiveWordIndex(0); // Reset to first word when capitalization changes
  }, [capitalizationStyle]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => {
        if (prev < words.length - 1) {
          return prev + 1;
        }
        return 0;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [words]);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: '100%',
    }}>
      {words.map((word, index) => {
        if (index !== activeWordIndex) {
          return null;
        }
        return (
          <Box
            key={index}
            sx={{
              color: '#cccccc',
              fontSize: 'clamp(0.35rem, 1.1vw, 0.5rem)',
              fontWeight: 400,
              fontFamily: 'Helvetica Neue, sans-serif',
              letterSpacing: '2px',
              transition: 'all 0.3s ease',
            }}
          >
            {word}
          </Box>
        );
      })}
    </Box>
  );
};

export const berfinSubtitleStyles = [
  { label: "No captions", icon: <Block sx={{ fontSize: 32, color: 'rgba(255, 255, 255, 0.7)' }} /> },
  { label: "Beast", icon: <ShortSubtitleStyleBeast capitalizationStyle="uppercase" selected={() => {}} id="beast" /> },
  { label: "Classic", icon: <ShortSubtitleStyleClassic capitalizationStyle="lowercase" selected={() => {}} id="classic" /> },
  { label: "Bobby", icon: <ShortSubtitleStyleBobby capitalizationStyle="uppercase" selected={() => {}} id="bobby" /> },
  { label: "Basker", icon: <ShortSubtitleStyleBasker capitalizationStyle="title" selected={() => {}} id="basker" /> },
  { label: "Neon", icon: <NeonSubtitleStyle /> },
  { label: "Bold", icon: <BoldSubtitleStyle /> },
  { label: "Minimal", icon: <MinimalSubtitleStyle /> }
];

