import React from 'react';
import { Box, IconButton } from '@mui/material';
import {
  VerticalAlignTop,
  VerticalAlignCenter,
  VerticalAlignBottom
} from '@mui/icons-material';

interface SubtitlePositionSelectionProps {
  subtitlePosition: 'top' | 'middle' | 'bottom';
  onPositionChange: (position: 'top' | 'middle' | 'bottom') => void;
}

const SubtitlePositionSelection: React.FC<SubtitlePositionSelectionProps> = ({
  subtitlePosition,
  onPositionChange
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mr: 1, flexShrink: 0 }}>
      <IconButton
        size="small"
        onClick={() => onPositionChange('top')}
        sx={{
          bgcolor: subtitlePosition === 'top' ? '#000000' : 'white',
          color: subtitlePosition === 'top' ? 'white' : '#6b7280',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          width: 32,
          height: 32,
          '&:hover': {
            bgcolor: subtitlePosition === 'top' ? '#000000' : '#f5f5f5'
          }
        }}
      >
        <VerticalAlignTop sx={{ fontSize: 16 }} />
      </IconButton>
      
      <IconButton
        size="small"
        onClick={() => onPositionChange('middle')}
        sx={{
          bgcolor: subtitlePosition === 'middle' ? '#000000' : 'white',
          color: subtitlePosition === 'middle' ? 'white' : '#6b7280',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          width: 32,
          height: 32,
          '&:hover': {
            bgcolor: subtitlePosition === 'middle' ? '#000000' : '#f5f5f5'
          }
        }}
      >
        <VerticalAlignCenter sx={{ fontSize: 16 }} />
      </IconButton>
      
      <IconButton
        size="small"
        onClick={() => onPositionChange('bottom')}
        sx={{
          bgcolor: subtitlePosition === 'bottom' ? '#000000' : 'white',
          color: subtitlePosition === 'bottom' ? 'white' : '#6b7280',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          width: 32,
          height: 32,
          '&:hover': {
            bgcolor: subtitlePosition === 'bottom' ? '#000000' : '#f5f5f5'
          }
        }}
      >
        <VerticalAlignBottom sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
};

export default SubtitlePositionSelection;

