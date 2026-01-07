
import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import { getSubtitleVideoBackground } from './ShortSubtitleVideoBackgrounds';
import { getPositionStyles, getPositionLabel, POSITION_OPTIONS } from './ShortSubtitleStyleDefinitionCards/ShortSubtitlePositionUtils';


interface SubtitleStyleCardProps {
    id: string;
    name: string;
    isSelected: boolean;
    onSelect: (id: string) => void;
    position: 'top' | 'middle' | 'bottom';
    children: React.ReactNode;
  }




const ShortSubtitleCard: React.FC<SubtitleStyleCardProps> = ({ 
    id,
    name,
    isSelected, 
    onSelect,
    position,
    children
  }) => {
    const videoBackground = getSubtitleVideoBackground(id);
  
    return (
      <Box sx={{ 
        flex: '0 0 auto', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 0.5
      }}>
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
              zIndex: 1
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
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'center',
            alignItems: 'center',
            height: position === 'top' ? 'auto' : position === 'bottom' ? 'auto' : '100%',
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


export default ShortSubtitleCard;
