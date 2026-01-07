import React from 'react';
import { Box, Typography } from '@mui/material';
import ViralityScore from './ViralityScore';
import Transcript from './Transcript';

interface VideoInfoProps {
  title: string;
  viralityScore: number;
  viralityDescription: string;
  transcript: string;
  id: number;
}

const VideoInfo: React.FC<VideoInfoProps> = ({ title, viralityScore, viralityDescription, transcript, id }) => {
  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'calc(70vw * 16/9)',
      overflow: 'hidden'
    }}>
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        pr: 2
      }}>
        <Typography variant="h5" sx={{ fontWeight: '700', color: '#2f2e2c', mb: 3, fontFamily: "'Inter', sans-serif" }}>
          {title}
        </Typography>

        {/* Virality Score */}
        <ViralityScore
          viralityScore={viralityScore}
          viralityDescription={viralityDescription}
          id={id}
        />

        {/* Transcript */}
        <Transcript transcript={transcript} />
      </Box>
    </Box>
  );
};

export default VideoInfo; 