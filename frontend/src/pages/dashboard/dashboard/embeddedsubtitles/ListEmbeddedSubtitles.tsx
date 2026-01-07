import React, { useState, useEffect } from "react";
import { Box, Grid, } from "@mui/material";
import { SubtitleConfigurationUI, UserSubtitlingApi } from "@/api";
import { createApiConfiguration } from "@/apiConfig";
import EmbeddedSubtitleCard from "./EmbeddedSubtitleCard";
import VideoClipSegmentsFlow from "../subtitershort/generatedvideo/VideoClipSegmentsFlow";




const ListEmbeddedSubtitlesComponent = ({subtitles}: {subtitles: SubtitleConfigurationUI[]}) => {
    const [openPublishModal, setOpenPublishModal] = useState(false);
    const handlePublish = () => {
      setOpenPublishModal(true);
    };
  
    const handleEdit = () => {
      // Handle edit functionality
      console.log('Edit clicked');
    };
  
    const handleDownload = () => {
      // Handle download functionality
      console.log('Download clicked');
    };

    const handleSegmentClick = (index: number) => {
      const subtitleElement = document.getElementById(`subtitle-${index}`);
      if (subtitleElement) {
        subtitleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    useEffect(() => {
      console.log('subtitles', subtitles);
    }, [subtitles]);

    return (
      <>
      {subtitles && subtitles.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 0, 
              width: '100%', 
              pb: { xs: 0, lg: 8 }
            }}>
              {/* Render global header and top flow bar once */}
              <Box sx={{ mt: 0, mb: 0, width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
                <VideoClipSegmentsFlow 
                  filename={subtitles[0]?.videoUrl ? subtitles[0].videoUrl.split('/').pop() || 'Video' : 'Video'} 
                  segmentCount={subtitles.length}
                  onSegmentClick={handleSegmentClick}
                />
              </Box>

              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 0, 
                width: '100%'
              }}>
                {subtitles.map((subtitle, index) => (
                  <EmbeddedSubtitleCard
                    key={"subtitle-" + index}
                    subtitle={subtitle}
                    index={index}
                    onPublish={handlePublish}
                    onEdit={handleEdit}
                    onDownload={handleDownload}
                  />
                ))}
              </Box>
            </Box>
          )}
      </>
    );
  };



interface ListEmbeddedSubtitlesViewProps {
    videoId: string;
    onClose: () => void;
    onPublish: () => void;
    onEdit: () => void;
    onDownload: () => void;
}


export const ListEmbeddedSubtitlesView = ({videoId, onClose, onPublish, onEdit, onDownload}: ListEmbeddedSubtitlesViewProps) => {
    const [subtitles, setSubtitles] = useState<SubtitleConfigurationUI[]>([]);
    const userSubtitlingApi = new UserSubtitlingApi(createApiConfiguration());

    useEffect(() => {
        const fetchSubtitles = async () => {
            const response = await userSubtitlingApi.getGeneratedShortsInfoApiV1UserSubtitlingGeneratedSubtitlingInfoVideoIdGet({
                videoId: videoId
            });
            console.log("response", response);
            
            // Response is directly an array of SubtitleConfigurationUI
            setSubtitles(response);
        };
        fetchSubtitles();
    }, [videoId]);

    return (
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
          height: '100%',
          bgcolor: '#f5f5f5'
        }}>
            <ListEmbeddedSubtitlesComponent subtitles={subtitles} />
        </Box>
    )
}

//8f283f57-9481-49b4-ac0c-9d0fc060015b
export const ListEmbeddedSubtitlesViewTest = () => {
    return (
        <Box sx={{ 
          bgcolor: '#f5f5f5', 
          minHeight: '100vh',
          height: '100%',
          p: 0,
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}>
            <ListEmbeddedSubtitlesView 
                videoId="8f283f57-9481-49b4-ac0c-9d0fc060015b" 
                onClose={() => {}}
                onPublish={() => {}}
                onEdit={() => {}}
                onDownload={() => {}}
            />
        </Box>
    )
}


export default ListEmbeddedSubtitlesView;