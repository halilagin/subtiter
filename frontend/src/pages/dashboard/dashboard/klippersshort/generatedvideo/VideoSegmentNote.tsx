import React from 'react';
import { Box, Typography } from '@mui/material';

const VideoSegmentNote = () => {
  return (
    <Box sx={{ 
      width: '85%',
      maxWidth: 280,
      mx: 0,
      ml: 2,
      textAlign: 'center'
    }}>
      <Typography variant="caption" sx={{ 
        color: '#6B7280', 
        fontStyle: 'normal',
        fontWeight: '400',
        fontSize: '0.9rem',
        lineHeight: 1.4,
        display: 'block'
      }}>
        Video appear glitchy? Don't worry, it
      </Typography>
      <Typography variant="caption" sx={{ 
        color: '#6B7280', 
        fontStyle: 'normal',
        fontWeight: '400',
        fontSize: '0.9rem',
        lineHeight: 1.4,
        display: 'block',
        pl: 2
      }}>
        won't when you download it.
      </Typography>
    </Box>
  );
};

export default VideoSegmentNote; 