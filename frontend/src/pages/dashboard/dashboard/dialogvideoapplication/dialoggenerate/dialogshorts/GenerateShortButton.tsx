import React from 'react';
import { Box, Button } from '@mui/material';
import VideoProcessProgressBar from '@/components/VideoProcessProgressBar/VideoProcessProgressBar';
import { VideoProcessingApplication } from '@/api/models/VideoProcessingApplication';
import { ShortConfigJsonInput } from '@/api/models';
import { EventType } from '@/events';

interface GenerateShortButtonProps {
  
}

const GenerateShortButton: React.FC<GenerateShortButtonProps> = ({   }) => {
  
  const handleGenerate = () => {
    window.dispatchEvent(new CustomEvent(EventType.START_SHORTS_GENERATION, { }));
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
          Generate Shorts
        </Button>
      
    </Box>
  );
};

export default GenerateShortButton;

