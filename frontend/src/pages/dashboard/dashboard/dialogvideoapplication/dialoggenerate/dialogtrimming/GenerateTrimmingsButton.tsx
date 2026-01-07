import React from 'react';
import { Box, Button } from '@mui/material';
import { TrimApplication } from '@/api/models';
import { VideoProcessingApplication } from '@/api/models/VideoProcessingApplication';
import { EventType } from '@/events';

interface GenerateTrimmingsButtonProps {
  videoId: string;
  selectedTrimmings: TrimApplication['trimConfigurations'];
}

const GenerateTrimmingsButton: React.FC<GenerateTrimmingsButtonProps> = ({ 
  videoId, 
  selectedTrimmings 
}) => {
  const handleGenerateTrimming = (): void => {
    console.log('handleGenerateTrimming');
    console.log('selectedTrimmings', selectedTrimmings);
    const trimApplication: TrimApplication = {
      trimConfigurations: selectedTrimmings
    };
    const event = new CustomEvent(EventType.GENERATION_STARTED, { 
      detail: {
        application: VideoProcessingApplication.ApplyTrim, 
        videoId: videoId, 
        trimApplication: trimApplication 
      } 
    });
    console.log('GenerateTrimmingsButton.event', event);
    window.dispatchEvent(event);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button 
        onClick={() => handleGenerateTrimming()}
        variant="contained"
        sx={{
          bgcolor: '#000000',
          color: 'white',
          textTransform: 'none',
          fontWeight: '600',
          fontFamily: "'Inter', sans-serif",
          px: 3,
          py: 1,
          borderRadius: 2,
          '&:hover': {
            bgcolor: '#333333'
          }
        }}
      >
        Generate Trimmed Video
      </Button>
    </Box>
  );
};

export default GenerateTrimmingsButton;

