import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { 
  Upload, 
  Bolt,
  InsertLink
} from '@mui/icons-material';

interface VideoInputBarProps {
  inputValue: string;
  isLoading: boolean;
  previewData: any;
  dragActive: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileUpload: (file: File) => void;
  onGenerate: () => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onPaste: (e: React.ClipboardEvent) => void;
}

const VideoInputBar = ({
  inputValue,
  isLoading,
  previewData,
  dragActive,
  onInputChange,
  onFileUpload,
  onGenerate,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onPaste
}: VideoInputBarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
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
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }
      }}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <InsertLink sx={{ fontSize: 20, color: '#2f2e2c', ml: 1 }} />
      
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        color: '#2f2e2c',
        pl: 1,
        '& input::placeholder': {
          color: 'rgba(0, 0, 0, 0.5)'
        }
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          onPaste={onPaste}
          placeholder="Paste YouTube link or drop a file"
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            width: '100%',
            fontSize: '1rem',
            color: inputValue ? '#2f2e2c' : 'rgba(0, 0, 0, 0.7)',
            fontWeight: '500',
            cursor: 'text'
          }}
        />
      </Box>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onFileUpload(e.target.files[0]);
          }
        }}
      />
      
      <Button 
        variant="contained" 
        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Bolt sx={{ fontSize: 10, color: '#dafe52' }} />}
        disabled={isLoading || (!inputValue && !previewData)}
        onClick={onGenerate}
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
        {isLoading ? 'Processing...' : 'Generate'}
      </Button>
    </Box>
  );
};

export default VideoInputBar; 