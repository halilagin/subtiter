import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Slider,
  TextField,
  CardMedia
} from '@mui/material';
import {
  Settings,
  
} from '@mui/icons-material';
import { VideoItem } from '../../../generatedvideolist/model/GeneratedVideoListModel';
import { EventType } from '@/events';

import { ShortConfigJsonInput } from '@/api/models';

interface TrimSectionProps {
  video?: VideoItem;
  shortConfig?: ShortConfigJsonInput;
}

const convertSecondsToMMSS = (durationInSeconds:number)  => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const TrimSection: React.FC<TrimSectionProps> = ({ 
  video,
  shortConfig
}) => {
    const originalVideoDurationInSeconds = video?.videoDuration ?? 0;
    const videoId = video?.videoId ?? '';
    const [trimValue, setTrimValue] = useState([0, originalVideoDurationInSeconds/2]);

    useEffect(() => {
        console.log('trimValue:', trimValue);
        console.log('originalVideoDurationInSeconds:', originalVideoDurationInSeconds);
    }, []);

    const handleTrimChange = (newTrimValue: number[]) => {
        setTrimValue(newTrimValue);
        const event = new CustomEvent(EventType.UPDATE_SHORT_CONFIG, { 
            detail: { 
                targetVideoTrimStartInSeconds: newTrimValue[0], 
                targetVideoTrimEndInSeconds: newTrimValue[1] 
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

      <Typography variant="h6" sx={{ fontWeight: '600', color: '#2f2e2c', mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', ml: 1 }}>
        Trim
      </Typography>

      <Box sx={{ px: 0.8, mt: 0.5, pb: 3 }}>
        <Slider
          value={trimValue}
          onChange={(_, newValue) => {
            const newTrimValue = newValue as number[];
            handleTrimChange(newTrimValue);
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
              transform: 'translateY(50px)',
              '&::before': {
                display: 'none'
              }
            }
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
        <Typography variant="body2" sx={{ color: '#6b7280', fontFamily: "'Inter', sans-serif" }}>
          Your plan lets you process up to 45 minutes. Upgrade for more.
        </Typography>
        <Button
          size="small"
          sx={{
            color: '#5a4eff',
            textTransform: 'none',
            fontWeight: '600',
            fontFamily: "'Inter', sans-serif",
            borderRadius: 6,
            '&:hover': {
              bgcolor: 'transparent'
            }
          }}
        >
          Upgrade
        </Button>
      </Box>
    </Box>
  );
};

export default TrimSection;
