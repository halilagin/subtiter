import React from 'react';
import { Box, Typography } from '@mui/material';

interface VideoPreviewProps {
  previewUrl?: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ previewUrl }) => {
  return (
    <Box sx={{
      width: '85%',
      maxWidth: 320,
      mx: 0,
      ml: 2,
      aspectRatio: '9/16',
      bgcolor: 'white',
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      mb: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    }}>
      {previewUrl ? (
        <video
          src={previewUrl}
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      ) : (
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Video Preview Container
        </Typography>
      )}
    </Box>
  );
};

export default VideoPreview; 