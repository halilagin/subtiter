import React from 'react';
import { Box, Typography } from '@mui/material';

interface CaptionStyleSegmentProps {
  children: React.ReactNode;
  label: string;
  isHighlighted?: boolean;
  isHovered?: boolean;
}

const CaptionStyleSegment: React.FC<CaptionStyleSegmentProps> = ({ 
  children, 
  label, 
  isHighlighted = false,
  isHovered = false
}) => {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0.5
    }}>
      <Box sx={{ 
        bgcolor: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: 2, 
        p: 0.8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40px',
        maxHeight: '40px',
        width: '100%',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: isHovered ? '2px solid rgba(255, 255, 255, 0.8)' : '2px solid transparent',
        transition: 'all 0.3s ease'
      }}>
        {children}
      </Box>
      <Typography sx={{ 
        color: 'rgba(255, 255, 255, 0.85)', 
        fontSize: '0.65rem', 
        textAlign: 'center'
      }}>
        {label}
      </Typography>
    </Box>
  );
};

export default CaptionStyleSegment;

