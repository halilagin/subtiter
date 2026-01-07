import React from 'react';
import { Box, Typography } from '@mui/material';

interface BerfinCaptionStyleSegmentProps {
  children: React.ReactNode;
  label: string;
  isHighlighted?: boolean;
  isHovered?: boolean;
  showClickAnimation?: boolean;
}

const BerfinCaptionStyleSegment: React.FC<BerfinCaptionStyleSegmentProps> = ({ 
  children, 
  label, 
  isHighlighted = false,
  isHovered = false,
  showClickAnimation = false
}) => {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0.5
    }}>
      <Box sx={{ 
        bgcolor: '#000000', 
        borderRadius: 2, 
        p: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50px',
        maxHeight: '50px',
        width: '100%',
        border: isHovered ? '2px solid rgba(255, 255, 255, 0.8)' : '2px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
        transform: showClickAnimation ? 'scale(0.95)' : 'scale(1)',
        boxShadow: showClickAnimation ? '0 2px 8px rgba(255, 255, 255, 0.3)' : 'none'
      }}>
        {children}
      </Box>
      <Typography sx={{ 
        color: 'rgba(255, 255, 255, 0.85)', 
        fontSize: '0.75rem', 
        textAlign: 'center'
      }}>
        {label}
      </Typography>
    </Box>
  );
};

export default BerfinCaptionStyleSegment;

