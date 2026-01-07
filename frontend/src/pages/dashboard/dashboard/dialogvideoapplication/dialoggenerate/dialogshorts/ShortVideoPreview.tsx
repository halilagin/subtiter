import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CardMedia,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import {
  FolderCopy
} from '@mui/icons-material';

import { ShortConfigJsonInput } from '@/api/models';

interface VideoPreviewProps {
  videoData?: {
    videoThumbnailUrl: string;
    videoDuration: number;
    videoTitle: string;
    videoId: string;
  };
  shortConfig?: ShortConfigJsonInput;
  
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoData, shortConfig }) => {
  const [videoType, setVideoType] = useState<'shorts' | 'vlog'>('shorts');



  const formatDuration = (durationInSeconds: number) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ mb: 0.5, bgcolor: 'white', p: 0.8 }}>
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
          image={videoData?.videoThumbnailUrl || 'https://via.placeholder.com/140x80/000000/FFFFFF?text=Video+Preview'}
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
          {videoData?.videoDuration ? formatDuration(videoData.videoDuration) : '0:00'}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 0.8 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: '600',
            color: '#2f2e2c',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.9rem'
          }}
        >
          New
        </Typography>
        <FormControl>
          <Select
            value={videoType}
            onChange={(e) => setVideoType(e.target.value as 'shorts' | 'vlog')}
            startAdornment={<FolderCopy sx={{ fontSize: 14, mr: 1, color: '#2f2e2c' }} />}
            sx={{
              bgcolor: 'transparent',
              color: '#2f2e2c',
              borderColor: '#e5e7eb',
              borderRadius: 2,
              fontWeight: '500',
              fontFamily: "'Inter', sans-serif",
              minHeight: 'auto',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e5e7eb'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db'
              },
              '& .MuiSelect-select': {
                py: 0.5,
                px: 2
              }
            }}
          >
            <MenuItem 
              value="shorts"
              sx={{
                fontFamily: "'Inter', sans-serif"
              }}
            >
              Shorts
            </MenuItem>
            <MenuItem 
              value="vlog"
              sx={{
                fontFamily: "'Inter', sans-serif"
              }}
            >
              Vlog
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Typography variant="body2" sx={{ color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, fontFamily: "'Inter', sans-serif" }}>
        {videoType === 'shorts' 
          ? 'Create up to 10 shorts from your video'
          : 'Create a single vlog from your video'
        }
      </Typography>
    </Box>
  );
};

export default VideoPreview;
