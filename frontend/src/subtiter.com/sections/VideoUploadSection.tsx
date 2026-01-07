import React, { useRef, useState } from 'react';
import { Box, Typography, Button, keyframes } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VideoFileIcon from '@mui/icons-material/VideoFile';

interface VideoUploadSectionProps {
  onNext: () => void;
  onVideoUploaded: (file: File) => void;
}

export const VideoUploadSection: React.FC<VideoUploadSectionProps> = ({
  onNext,
  onVideoUploaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedFile(file);
      onVideoUploaded(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedFile(file);
      onVideoUploaded(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const fadeInUp = keyframes`
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '600px',
        px: 3,
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: '100%',
        position: 'relative',
      }}
    >
      {/* Price Circle */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 80, sm: 120 },
          right: { xs: -200, sm: -210 },
          width: { xs: '100px', sm: '120px' },
          height: { xs: '100px', sm: '120px' },
          borderRadius: '50%',
          bgcolor: '#e8f5a5',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontSize: { xs: '0.5rem', sm: '0.6rem' },
            fontWeight: 400,
            color: '#ef5d64',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Each Subtitle
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            fontWeight: 700,
            color: '#ef5d64',
            lineHeight: 1,
          }}
        >
          $0.99
        </Typography>
      </Box>
      
      <Typography
        sx={{
          fontFamily: "'Inter', sans-serif",
          fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3rem' },
          fontWeight: 600,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          animation: `${fadeInUp} 1s ease-out`,
        }}
      >
        Add Subtitles to Your Videos
      </Typography>

      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          width: '100%',
          minHeight: '120px',
          border: `2px dashed ${isDragging ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'}`,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          px: 3,
          py: 2,
          '&:hover': {
            borderColor: '#ffffff',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
          },
        }}
      >
        {uploadedFile ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <VideoFileIcon sx={{ fontSize: 24, color: '#ffffff' }} />
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    color: '#ffffff',
                  }}
                >
                  {uploadedFile.name}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  {formatFileSize(uploadedFile.size)}
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <CloudUploadIcon sx={{ fontSize: 24, color: '#ffffff' }} />
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    color: '#ffffff',
                  }}
                >
                  Drag and drop your video here or click to browse
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    mt: 0.5,
                  }}
                >
                  MP4, MOV, AVI, MKV
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {uploadedFile && (
        <Button
          variant="contained"
          onClick={onNext}
          sx={{
            bgcolor: '#f16838',
            color: '#ffffff',
            borderRadius: 1,
            px: 4,
            py: 1,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: '0.875rem',
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#d95a30',
            },
          }}
        >
          Continue
        </Button>
      )}
    </Box>
  );
};
