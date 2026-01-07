import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Grid,
  Chip,
  TextField,
  Divider
} from '@mui/material';
import {
  Close,
  Share,
  LinkedIn,
  WhatsApp,
  Instagram,
  YouTube,
  Link
} from '@mui/icons-material';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  videoTitle?: string;
  videoUrl?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  open, 
  onClose, 
  videoTitle = "Check out this amazing video!",
  videoUrl = "https://example.com/video"
}) => {
  const [copied, setCopied] = useState(false);

  const socialPlatforms = [
    {
      name: 'LinkedIn',
      icon: <LinkedIn sx={{ fontSize: 24, color: '#0A66C2' }} />,
      color: '#0A66C2'
    },
    {
      name: 'WhatsApp',
      icon: <WhatsApp sx={{ fontSize: 24, color: '#25D366' }} />,
      color: '#25D366'
    },
    {
      name: 'Instagram',
      icon: <Instagram sx={{ fontSize: 24, color: '#E4405F' }} />,
      color: '#E4405F'
    },
    {
      name: 'YouTube',
      icon: <YouTube sx={{ fontSize: 24, color: '#FF0000' }} />,
      color: '#FF0000'
    }
  ];

  const handleSocialShare = (platform: string) => {
    const message = encodeURIComponent(videoTitle);
    const url = encodeURIComponent(videoUrl);
    
    let shareUrl = '';
    switch (platform.toLowerCase()) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${message}%20${url}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
        navigator.clipboard.writeText(`${videoTitle}\n\n${videoUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      case 'youtube':
        // YouTube doesn't support direct URL sharing, so we'll copy to clipboard
        navigator.clipboard.writeText(`${videoTitle}\n\n${videoUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };



  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 2,
        pt: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Share sx={{ color: '#5a4eff', fontSize: 24 }} />
          <Typography variant="h6" sx={{ 
            fontWeight: '600', 
            color: '#2f2e2c',
            fontFamily: "'Inter', sans-serif"
          }}>
            Share Video
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 8 }}>

        {/* Social Media Platforms */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ 
            fontWeight: '500', 
            color: '#6B7280',
            mb: 2,
            fontFamily: "'Inter', sans-serif"
          }}>
            Share on Social Media
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            {socialPlatforms.map((platform) => (
              <Button
                key={platform.name}
                variant="outlined"
                startIcon={platform.icon}
                onClick={() => handleSocialShare(platform.name)}
                sx={{
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  color: '#2f2e2c',
                  bgcolor: 'white',
                  borderRadius: 12,
                  py: 1.5,
                  px: 4,
                  textTransform: 'none',
                  fontWeight: '600',
                  minWidth: 480,
                  '&:hover': {
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                    bgcolor: 'rgba(0, 0, 0, 0.05)'
                  }
                }}
              >
                {platform.name}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Copy Link */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Link />}
            onClick={handleCopyLink}
            sx={{
              borderColor: 'rgba(0, 0, 0, 0.1)',
              color: '#2f2e2c',
              borderRadius: 12,
              py: 1.5,
              px: 4,
              textTransform: 'none',
              fontWeight: '600',
              minWidth: 480,
              '&:hover': {
                borderColor: 'rgba(0, 0, 0, 0.2)',
                bgcolor: 'rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            {copied ? 'Link Copied!' : 'Copy Link'}
          </Button>
        </Box>
      </DialogContent>


    </Dialog>
  );
};

export default ShareModal; 