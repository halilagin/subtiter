
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import { getSubtitleVideoBackground } from './SubtitlingVideoBackgrounds';
import { getPositionStyles, getPositionLabel, POSITION_OPTIONS } from './SubtitlingStyleDefinitionCards/SubtitlingPositionUtils';



interface SubtitlingStyleCardProps {
    id: string;
    name: string;
    isSelected: boolean;
    onSelect: (id: string) => void;
    position: 'top' | 'center' | 'bottom';
    capitalization?: 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words';
    children: React.ReactNode;
  }




const SubtitlingCard: React.FC<SubtitlingStyleCardProps> = ({ 
    id,
    name,
    isSelected, 
    onSelect,
    position,
    capitalization = 'uppercase',
    children
  }) => {
    const videoBackground = getSubtitleVideoBackground(id);


    

    return (
      <Box sx={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <Box
          sx={{
            width: 110, // slightly larger for better visibility
            aspectRatio: '5 / 6',
            cursor: 'pointer',
            border: isSelected ? '2px solid #000000' : '1px solid #e5e7eb',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              borderColor: '#000000'
            }
          }}
          onClick={() => onSelect(id)}
        >
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          >
            <source src={videoBackground} type="video/mp4" />
          </video>
          
          {/* Text Overlay */}
          <Box sx={{
            position: 'absolute',
            ...getPositionStyles(position),
            width: '100%',
            textAlign: 'center',
            px: 1,
            zIndex: 2
          }}>
            {children}
          </Box>

        </Box>
        
        {/* Subtitle name label */}
        <Typography
          variant="body2"
          sx={{
            color: isSelected ? '#2f2e2c' : '#6b7280',
            fontWeight: isSelected ? '600' : '400',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.8rem',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              color: '#2f2e2c'
            }
          }}
          onClick={() => onSelect(id)}
        >
          {name}
        </Typography>
      </Box>
    );
}


export default SubtitlingCard;
