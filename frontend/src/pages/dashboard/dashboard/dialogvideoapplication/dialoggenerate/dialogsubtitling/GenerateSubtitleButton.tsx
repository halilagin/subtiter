import React from 'react';
import { Box, Button } from '@mui/material';
import { EventType } from '@/events';
import { VideoProcessingApplication } from '@/api/models/VideoProcessingApplication';
import { SubtitleApplication } from '@/api/models';

interface GenerateSubtitleButtonProps {
  videoId: string;
  subtitleApplication: SubtitleApplication;
}

const GenerateSubtitleButton: React.FC<GenerateSubtitleButtonProps> = ({ 
  videoId,
  subtitleApplication
}) => {
  
  const handleGenerate = () => {
    const event = new CustomEvent(EventType.GENERATION_STARTED, {
      detail: {
        application: VideoProcessingApplication.ApplySubtitles,
        videoId: videoId,
        subtitleApplication: subtitleApplication
      }
    });
    window.dispatchEvent(event);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent(EventType.CLOSE_DIALOG_APPLICATION_SELECTION, {}));
    }, 100);
  }

  return (
    <Box sx={{ 
      bgcolor: 'white', 
      pt: 0.2, 
      mt: 0.2, 
      p: 1
    }}>
      <Button
        fullWidth
        variant="contained"
        onClick={handleGenerate}
        sx={{
          py: 1.2,
          bgcolor: '#000000',
          color: 'white',
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: '600',
          fontSize: '0.9rem',
          fontFamily: "'Inter', sans-serif",
          '&:hover': {
            bgcolor: '#000000'
          }
        }}
      >
        Generate Subtitles
      </Button>
    </Box>
  );
};

export default GenerateSubtitleButton;

