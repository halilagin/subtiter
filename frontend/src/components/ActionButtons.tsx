import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { Share, Edit, GetApp } from '@mui/icons-material';
import ShareModal from './modals/ShareModal';


interface ActionButtonsProps {
  onPublish: () => void;
  onEdit: () => void;
  onDownload: () => void;
  videoTitle?: string;
  videoUrl?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onPublish, onEdit, onDownload, videoTitle, videoUrl }) => {
  const [openShareModal, setOpenShareModal] = useState(false);

  return (
    <>
      <Box sx={{
        display: 'flex',
        gap: 0.8, 
        justifyContent: 'center',
        width: '85%',
        maxWidth: 320,
        mx: 0,
        ml: 2,
        mb: 2
      }}>
        <Button
          variant="outlined"
          startIcon={<Share sx={{ fontSize: '16px !important' }} />}
          onClick={() => setOpenShareModal(true)}
          sx={{
            borderColor: 'rgba(0, 0, 0, 0.1)',
            color: '#2f2e2c',
            fontWeight: '600',
            textTransform: 'none',
            borderRadius: '12px !important',
            px: 2,
            py: 0.8,
            fontSize: '0.8rem',
            boxShadow: 'none',
            '&:hover': {
              borderColor: 'rgba(0, 0, 0, 0.2)',
              bgcolor: 'rgba(0, 0, 0, 0.05)',
              boxShadow: 'none'
            }
          }}
        >
          Share
        </Button>

        <Button
          variant="outlined"
          startIcon={<Edit sx={{ fontSize: '16px !important' }} />}
          onClick={onEdit}
          sx={{
            borderColor: 'rgba(0, 0, 0, 0.1)',
            color: '#2f2e2c',
            fontWeight: '600',
            textTransform: 'none',
            borderRadius: '12px !important',
            px: 2,
            py: 0.8,
            fontSize: '0.8rem',
            boxShadow: 'none',
            '&:hover': {
              borderColor: 'rgba(0, 0, 0, 0.2)',
              bgcolor: 'rgba(0, 0, 0, 0.05)',
              boxShadow: 'none'
            }
          }}
        >
          Edit
        </Button>

        <Button
          variant="contained"
          startIcon={<GetApp sx={{ fontSize: '16px !important' }} />}
          onClick={onDownload}
          sx={{
            bgcolor: '#2f2e2c',
            color: 'white',
            fontWeight: '600',
            textTransform: 'none',
            borderRadius: '12px !important',
            px: 2.5,
            py: 0.8,
            fontSize: '0.8rem',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#1a1a1a',
              boxShadow: 'none'
            }
          }}
        >
          Download
        </Button>
      </Box>

      <ShareModal
        open={openShareModal}
        onClose={() => setOpenShareModal(false)}
        videoTitle={videoTitle}
        videoUrl={videoUrl}
      />
    </>
  );
};

export default ActionButtons; 