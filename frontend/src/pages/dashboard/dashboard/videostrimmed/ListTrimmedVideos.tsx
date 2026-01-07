import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { TrimConfigurationUI, UserTrimmingApi } from "@/api";
import { createApiConfiguration } from "@/apiConfig";
import TrimmedVideoCard from "./TrimmedVideoCard";




const ListTrimmedVideosComponent = ({trimmedVideos}: {trimmedVideos: TrimConfigurationUI[]}) => {
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
      const trimmedVideoElement = document.getElementById(`trimmed-video-${index}`);
      if (trimmedVideoElement) {
        trimmedVideoElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    useEffect(() => {
      console.log('trimmedVideos', trimmedVideos);
    }, [trimmedVideos]);

    return (
      <>
      {trimmedVideos && trimmedVideos.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3, 
              width: '100%', 
              pb: { xs: 2, lg: 8 },
              px: { xs: 2, sm: 3, md: 4 },
              pt: 4
            }}>
              {trimmedVideos.map((trimmedVideo, index) => (
                <TrimmedVideoCard
                  key={"trimmed-video-" + index}
                  trimmedVideo={trimmedVideo}
                  index={index}
                  onPublish={handlePublish}
                  onEdit={handleEdit}
                  onDownload={handleDownload}
                />
              ))}
            </Box>
          )}
      </>
    );
  };



interface ListTrimmedVideosViewProps {
    videoId: string;
    onClose: () => void;
    onPublish: () => void;
    onEdit: () => void;
    onDownload: () => void;
}


export const ListTrimmedVideosView = ({videoId, onClose, onPublish, onEdit, onDownload}: ListTrimmedVideosViewProps) => {
    const [trimmedVideos, setTrimmedVideos] = useState<TrimConfigurationUI[]>([]);
    const userTrimmingApi = new UserTrimmingApi(createApiConfiguration());

    useEffect(() => {
        const fetchTrimmedVideos = async () => {
            const response = await userTrimmingApi.getGeneratedTrimmingInfoApiV1UserTrimmingGeneratedTrimmingInfoVideoIdGet({
                videoId: videoId
            });
            console.log("response", response);
            
            // Response is directly an array of TrimConfigurationUI
            setTrimmedVideos(response);
        };
        fetchTrimmedVideos();
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
            <ListTrimmedVideosComponent trimmedVideos={trimmedVideos} />
        </Box>
    )
}

//8f283f57-9481-49b4-ac0c-9d0fc060015b
export const ListTrimmedVideosViewTest = () => {
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
            <ListTrimmedVideosView 
                videoId="8f283f57-9481-49b4-ac0c-9d0fc060015b" 
                onClose={() => {}}
                onPublish={() => {}}
                onEdit={() => {}}
                onDownload={() => {}}
            />
        </Box>
    )
}


export default ListTrimmedVideosView;