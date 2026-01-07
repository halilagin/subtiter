import { SchemaUserSegmentVideo } from "@/api/models/SchemaUserSegmentVideo";
import { Box, Typography } from "@mui/material";
import { Button } from "@mui/material";
import { useState } from "react";
import { Share } from "@mui/icons-material";
import ShareModal from "@/components/modals/ShareModal";
import SubscribeModal from "@/components/modals/SubscribeModal";
import { UserVideosApi } from "@/api";
import { createApiConfiguration } from "@/apiConfig";
import AppConfig from "@/AppConfig";

interface VideoSegmentPlayerActionsProps {
    onPublish: () => void;
    onEdit: () => void;
    onDownload: () => void;
    segment: SchemaUserSegmentVideo;
    segmentIndex: number;
  }
  
export const VideoSegmentPlayerActions = ({ onPublish, onEdit, onDownload, segment, segmentIndex }: VideoSegmentPlayerActionsProps) => {
    const [openShareModal, setOpenShareModal] = useState(false);
    const [openSubscribeModal, setOpenSubscribeModal] = useState(false);


    const downloadVideo = async () => {
        try {
            // alert(JSON.stringify(segment));
            // alert(segmentIndex);
            // Create a link element to trigger the download
            const downloadUrl = `${AppConfig.baseApiUrl}/api/v1/user-videos/video-download/${segment.parentVideoId}/${segmentIndex+1}`;
            
            // Get the access token for authentication
            const accessToken = localStorage.getItem("access_token");
            
            // Fetch the video file
            const response = await fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to download video');
            }
            
            // Get the blob from the response
            const blob = await response.blob();
            
            // Create a temporary URL for the blob
            const blobUrl = window.URL.createObjectURL(blob);
            
            // Create a temporary anchor element and trigger download
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${segment.parentVideoId}___segment_${segmentIndex}.mp4`;
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Error downloading video:', error);
            // You might want to show an error message to the user here
        }
    }
  
    return (
      <>
        <Box sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          width: '85%',
          maxWidth: 320,
          mx: 0,
          ml: 2
        }}>
          <Button 
            variant="contained" 
            onClick={() => downloadVideo()}
            sx={{ 
              bgcolor: '#000000',
              color: 'white',
              borderRadius: 12,
              py: 1.6,
              px: 1.5,
              fontSize: '0.9rem',
              fontWeight: '600',
              textTransform: 'none',
              flex: 0.75,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#333333',
                transform: 'scale(1.05)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
              }
            }}
          >
            Download HD
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => setOpenShareModal(true)}
            sx={{ 
              bgcolor: 'white',
              color: '#2f2e2c',
              borderRadius: 12,
              px: 1.5,
              py: 1.6,
              minWidth: 'auto',
              width: 48,
              height: 48,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              '&:hover': {
                bgcolor: '#f5f5f5',
                color: '#2f2e2c',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            <Share sx={{ fontSize: 16 }} />
          </Button>
        </Box>

        <Box sx={{ 
          width: '85%',
          maxWidth: 320,
          mx: 'auto',
          ml: 0,
          textAlign: 'center',
          mb: 8
        }}>
          <Typography variant="caption" sx={{ 
            color: '#6B7280', 
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '0.9rem',
            lineHeight: 1.4,
            display: 'block'
          }}>
            Video appear glitchy? Don't worry, it
          </Typography>
          <Typography variant="caption" sx={{ 
            color: '#6B7280', 
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '0.9rem',
            lineHeight: 1.4,
            display: 'block',
            pl: 2
          }}>
            won't when you download it.
          </Typography>
        </Box>
  
        <ShareModal
          open={openShareModal}
          onClose={() => setOpenShareModal(false)}
          videoTitle={segment.name}
          videoUrl={segment.videoUrl || ""}
        />
        
        <SubscribeModal
          open={openSubscribeModal}
          onClose={() => setOpenSubscribeModal(false)}
        />
      </>
    );
  };

  export default VideoSegmentPlayerActions;