import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Slider,
  CardMedia
} from '@mui/material';
import { VideoItem } from '../../../generatedvideolist/model/GeneratedVideoListModel';
import { EventType } from '@/events';
import { TrimConfiguration } from '@/api/models';

// Local event constants for trimming
const TRIM_CARD_TOGGLE = 'trim-card-toggle';

interface TrimSectionProps {
  video?: VideoItem;
}

const convertSecondsToMMSS = (durationInSeconds: number) => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const TrimSection: React.FC<TrimSectionProps> = ({ 
  video
}) => {
  const originalVideoDurationInSeconds = video?.videoDuration ?? 0;
  const [trimValue, setTrimValue] = useState([0, originalVideoDurationInSeconds / 2]);

  useEffect(() => {
    if (originalVideoDurationInSeconds > 0) {
      setTrimValue([0, originalVideoDurationInSeconds / 2]);
    }
  }, [originalVideoDurationInSeconds]);

  const handleSliderChange = (newTrimValue: number[]) => {
    setTrimValue(newTrimValue);
  };

  const handleAddTrim = () => {
    // Validate that start < end
    if (trimValue[0] >= trimValue[1]) {
      alert('Start time must be less than end time');
      return;
    }
    
    // Create a trim configuration with unique ID
    const trimConfig: TrimConfiguration = {
      id: `trim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      trimStartInSeconds: trimValue[0],
      trimEndInSeconds: trimValue[1]
    };
    
    // Dispatch event to add trim configuration
    const event = new CustomEvent(TRIM_CARD_TOGGLE, {
      detail: {
        isCurrentlySelected: false,
        trimConfiguration: trimConfig
      }
    });
    window.dispatchEvent(event);
  };

  const formatDuration = (durationInSeconds: number) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
    
  return (
    <Box sx={{ mb: 0.5, bgcolor: '#f5f5f5', p: 0.8, borderRadius: 2 }}>
      {video && (
        <Box sx={{ mb: 1.5, p: 0.8 }}>
          <Box sx={{ 
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 0.8,
            bgcolor: '#000',
            width: 140,
            height: 80,
            mx: 'auto'
          }}>
            <CardMedia
              component="img"
              height="80"
              image={video?.videoThumbnailUrl || 'https://via.placeholder.com/140x80/000000/FFFFFF?text=Video+Preview'}
              alt="Video preview"
              sx={{ objectFit: 'cover' }}
            />
            <Box sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.7rem'
            }}>
              {video?.videoDuration ? formatDuration(video.videoDuration) : '0:00'}
            </Box>
          </Box>
        </Box>
      )}

      <Typography variant="h6" sx={{ fontWeight: '600', color: '#2f2e2c', mb: 0.8, display: 'flex', alignItems: 'center', gap: 1, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', ml: 1 }}>
        Trim
      </Typography>

      <Box sx={{ px: 0.8, mt: 0.5 }}>
        <Slider
          value={trimValue}
          onChange={(_, newValue) => {
            const newTrimValue = newValue as number[];
            handleSliderChange(newTrimValue);
          }}
          min={0}
          max={originalVideoDurationInSeconds}
          step={1}
          valueLabelDisplay="on"
          valueLabelFormat={(value) => convertSecondsToMMSS(value)}
          sx={{
            color: '#000000',
            '& .MuiSlider-thumb': {
              bgcolor: '#000000'
            },
            '& .MuiSlider-track': {
              bgcolor: '#000000'
            },
            '& .MuiSlider-valueLabel': {
              bgcolor: '#000000',
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 500,
              transform: 'translateY(35px)',
              '&::before': {
                display: 'none'
              }
            }
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleAddTrim}
          disabled={trimValue[0] >= trimValue[1]}
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
            },
            '&:disabled': {
              bgcolor: '#d1d5db',
              color: '#9ca3af'
            }
          }}
        >
          Add Trim
        </Button>
      </Box>


    </Box>
  );
};

export default TrimSection;

