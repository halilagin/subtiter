import React from 'react';
import { Box, Button } from '@mui/material';
import { SubtitleApplication } from '@/api/models';
import { VideoProcessingApplication } from '@/api/models/VideoProcessingApplication';
import { EventType } from '@/events';

interface GenerateSubtitlesButtonProps {
  videoId: string;
  selectedSubtitles: SubtitleApplication['subtitleConfiguration'];
}

const GenerateSubtitlesButton: React.FC<GenerateSubtitlesButtonProps> = ({ 
  videoId, 
  selectedSubtitles 
}) => {
  const handleGenerateSubtitles = (): void => {
    console.log('handleGenerateSubtitles');
    console.log('selectedSubtitles', selectedSubtitles);
    const subtitleApplication: SubtitleApplication = {
      subtitleConfiguration: selectedSubtitles
    };
    const event = new CustomEvent(EventType.GENERATION_STARTED, { 
      detail: {
        application: VideoProcessingApplication.ApplySubtitles, 
        videoId: videoId, 
        subtitleApplication: subtitleApplication 
      } 
    });
    window.dispatchEvent(event);
  };

  return (
    <Box>
      <button onClick={() => handleGenerateSubtitles()}>Generate Subtitles</button>
    </Box>
  );
};

export default GenerateSubtitlesButton;

