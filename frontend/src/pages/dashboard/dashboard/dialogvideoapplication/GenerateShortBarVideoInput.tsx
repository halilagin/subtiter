import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Upload, 
  Bolt,
  VideoFile,
  PlayCircle,
  Close,
  Search,
  InsertLink
} from '@mui/icons-material';
import { VideoUploadApi } from '@/api';
import { createApiConfiguration } from '@/apiConfig';
import { useNavigate } from 'react-router-dom';
import { ResponseError } from '@/api/runtime';

interface UploadVideoInputBarProps {
    onUploadFinished: (user_video_id: string, video_id: string, thumbnail_url: string) => void;
}

const UploadVideoInputBar = ({ onUploadFinished }: UploadVideoInputBarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [canUpload, setCanUpload] = useState<boolean >(false);
  const navigate = useNavigate();

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        handleFileSelect(file);
      }
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setVideoTitle(file.name);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setVideoTitle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    
    try {




      const videoUploadApi = new VideoUploadApi(createApiConfiguration());

      const allowanceResponse = await videoUploadApi.checkUserAllowanceForUplaodApiV1VideouploadCheckUserAllowanceForUploadPost();
      

      if (allowanceResponse.result === false) {
        setCanUpload(false);
        setIsLoading(false);
        setShowUpgradePopup(true);
        return;
      } else {
        setCanUpload(true);

        
            const data = await videoUploadApi.uploadVideoApiV1VideouploadUploadPost({
                file: selectedFile
            });
            
            setIsLoading(false);
            setSelectedFile(null);
            setVideoTitle('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onUploadFinished(data.user_video_id, data.video_id, data.thumbnail_url as string);
        
      }


     
    } catch (error) {
      setIsLoading(false);
      if (error instanceof ResponseError && error.response.status === 551) {
        setShowUpgradePopup(true);
      } else {
        console.error('Upload error:', error);
      }
    }
  };

  return (
    <Box 
      sx={{ 
        width: '100%'
      }}
    >
      <Box 
        sx={{ 
          bgcolor: 'white',
          borderRadius: 16,
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          border: dragActive ? '2px dashed #2f2e2c' : '1px solid rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(15px)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
          }
        }}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <InsertLink sx={{ fontSize: 24, color: '#2f2e2c', ml: 1 }} />
        
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-start',
          color: '#2f2e2c',
          pl: 1
        }}>
          {selectedFile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
              <Button
                onClick={handleRemoveFile}
                sx={{
                  minWidth: 'auto',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  p: 0,
                  color: '#666',
                  '&:hover': {
                    color: '#2f2e2c',
                    bgcolor: 'rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <Close sx={{ fontSize: 16 }} />
              </Button>
              <Chip
                icon={<PlayCircle />}
                label={selectedFile.name}
                variant="outlined"
                sx={{
                  bgcolor: 'rgba(226, 244, 166, 0.3)',
                  borderColor: '#e2f4a6',
                  color: '#2f2e2c',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                  '& .MuiChip-icon': {
                    color: '#2f2e2c'
                  }
                }}
              />
            </Box>
          ) : (
            <Typography
              onClick={handleBrowseClick}
              sx={{
                fontSize: '1rem',
                color: 'rgba(0, 0, 0, 0.6)',
                fontWeight: '500',
                cursor: 'pointer',
                '&:hover': {
                  color: '#2f2e2c'
                }
              }}
            >
              {dragActive ? 'Drop video file here...' : 'Drop video file or click to browse'}
            </Typography>
          )}
        </Box>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
        
        {!selectedFile && (
          <Button 
            variant="contained"
            startIcon={<Search />}
            onClick={handleBrowseClick}
            sx={{ 
              borderRadius: 16,
              px: 3,
              py: 1.2,
              bgcolor: '#2f2e2c',
              color: '#ffffff',
              fontWeight: '600',
              textTransform: 'none',
              fontSize: '0.9rem',
              '& .MuiButton-startIcon svg': { color: 'inherit' },
              '&:hover': {
                bgcolor: '#1f1e1c'
              }
            }}
          >
            Browse
          </Button>
        )}
        
        {selectedFile && (
          <Button 
            variant="contained" 
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Bolt sx={{ fontSize: 10, color: '#dafe52' }} />}
            disabled={isLoading}
            onClick={handleUploadClick}
            sx={{ 
              borderRadius: 16,
              px: 3,
              py: 1.2,
              bgcolor: '#000000',
              color: 'white',
              fontWeight: '600',
              textTransform: 'none',
              fontSize: '0.9rem',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#000000',
                boxShadow: 'none',
              },
              '&:disabled': {
                bgcolor: '#6b7280',
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }}
          >
            {isLoading ? 'Uploading...' : 'Upload Video'}
          </Button>
        )}
      </Box>
      <Dialog
        open={showUpgradePopup}
        onClose={() => setShowUpgradePopup(false)}
        aria-labelledby="upgrade-dialog-title"
        aria-describedby="upgrade-dialog-description"
      >
        <DialogTitle id="upgrade-dialog-title">{"Usage Limit Reached"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="upgrade-dialog-description">
            You have reached the maximum limit for video uploads on your current plan. To continue uploading, please upgrade your subscription.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpgradePopup(false)}>Cancel</Button>
          <Button onClick={() => {
            setShowUpgradePopup(false);
            navigate('/in/subscription');
          }} autoFocus>
            Upgrade Subscription
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UploadVideoInputBar; 