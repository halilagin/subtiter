import React from 'react';
import { Box, Typography } from '@mui/material';

interface ViralityScoreProps {
  viralityScore: number;
  viralityDescription: string;
  id: number;
}

const ViralityScore: React.FC<ViralityScoreProps> = ({ viralityScore, viralityDescription, id }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{
        bgcolor: 'white',
        p: 3,
        borderRadius: 8,
        border: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: '600', 
          color: '#2f2e2c', 
          fontSize: '1rem', 
          fontFamily: "'Inter', sans-serif" 
        }}>
          #{id} Virality score ({viralityScore}/100)
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#6B7280', 
          lineHeight: 1.6, 
          fontSize: '1rem', 
          fontWeight: '300', 
          fontFamily: "'Inter', sans-serif" 
        }}>
          {viralityDescription}
        </Typography>
      </Box>
    </Box>
  );
};

export default ViralityScore; 