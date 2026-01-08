import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Button, keyframes, LinearProgress, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';

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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const uploadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cancelUploadRef = useRef<boolean>(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const startUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setTimeRemaining(0);
    cancelUploadRef.current = false;
    
    // Simulate upload progress
    const totalTime = 5000; // 5 seconds for simulation
    const interval = 50; // Update every 50ms
    const increment = (100 / (totalTime / interval));
    let currentProgress = 0;
    let elapsed = 0;
    
    uploadIntervalRef.current = setInterval(() => {
      if (cancelUploadRef.current) {
        if (uploadIntervalRef.current) {
          clearInterval(uploadIntervalRef.current);
        }
        setIsUploading(false);
        setUploadProgress(0);
        setTimeRemaining(0);
        setUploadedFile(null);
        return;
      }
      
      elapsed += interval;
      currentProgress = Math.min(currentProgress + increment, 100);
      setUploadProgress(currentProgress);
      
      if (currentProgress > 0 && currentProgress < 100) {
        const remaining = totalTime - elapsed;
        setTimeRemaining(Math.max(0, Math.ceil(remaining / 1000)));
      }
      
      if (currentProgress >= 100) {
        if (uploadIntervalRef.current) {
          clearInterval(uploadIntervalRef.current);
        }
        setIsUploading(false);
        setUploadProgress(100);
        setTimeRemaining(0);
        setUploadedFile(file);
        onVideoUploaded(file);
      }
    }, interval);
  };

  const handleCancelUpload = () => {
    cancelUploadRef.current = true;
    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current);
    }
    setIsUploading(false);
    setUploadProgress(0);
    setTimeRemaining(0);
    setUploadedFile(null);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      startUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      startUpload(file);
    }
  };

  useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
      }
    };
  }, []);

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
        height: '100%',
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
        onClick={() => !isUploading && !uploadedFile && fileInputRef.current?.click()}
        sx={{
          width: '100%',
          minHeight: '120px',
          border: `2px dashed ${isDragging ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'}`,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'transparent',
          cursor: isUploading || uploadedFile ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          px: 3,
          py: 2,
          position: 'relative',
          '&:hover': {
            borderColor: isUploading || uploadedFile ? 'rgba(255, 255, 255, 0.5)' : '#ffffff',
            bgcolor: isUploading || uploadedFile ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
          },
        }}
      >
        {isUploading ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <VideoFileIcon sx={{ fontSize: 24, color: '#ffffff' }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    color: '#ffffff',
                  }}
                >
                  Uploading...
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                    sx={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#f16838',
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      minWidth: '45px',
                      textAlign: 'right',
                    }}
                  >
                    {Math.round(uploadProgress)}%
                  </Typography>
                </Box>
                {timeRemaining > 0 && (
                  <Typography
                    sx={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.7rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      mt: 0.5,
                    }}
                  >
                    {timeRemaining} second{timeRemaining !== 1 ? 's' : ''} remaining
                  </Typography>
                )}
              </Box>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelUpload();
                }}
                sx={{
                  color: '#ffffff',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <CancelIcon />
              </IconButton>
            </Box>
          </>
        ) : uploadedFile ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <VideoFileIcon sx={{ fontSize: 24, color: '#ffffff' }} />
              <Box sx={{ flex: 1 }}>
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
                    mt: 0.5,
                  }}
                >
                  {formatFileSize(uploadedFile.size)}
                </Typography>
              </Box>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                sx={{
                  color: '#ffffff',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
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

      {uploadedFile && !isUploading && (
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
