import React from 'react';
import { Box, Typography } from '@mui/material';

interface TranscriptProps {
  transcript: string;
}

const Transcript: React.FC<TranscriptProps> = ({ transcript }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ 
        fontWeight: '600', 
        color: '#2f2e2c', 
        mb: 2, 
        fontSize: '1rem', 
        fontFamily: "'Inter', sans-serif" 
      }}>
        Transcript
      </Typography>
      <Typography variant="body1" sx={{ 
        color: '#6B7280', 
        lineHeight: 1.6, 
        fontSize: '1.1rem', 
        fontWeight: '300', 
        fontFamily: "'Inter', sans-serif" 
      }}>
        {transcript}
      </Typography>
    </Box>
  );
};

export default Transcript; 