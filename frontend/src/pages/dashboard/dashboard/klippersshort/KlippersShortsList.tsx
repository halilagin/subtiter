import React, { useState, useEffect } from "react";
import { Box, Grid, } from "@mui/material";
import { UserShortsApi } from "@/api";
import { createApiConfiguration } from "@/apiConfig";
import { SchemaUserSegmentVideo } from "@/api/models/SchemaUserSegmentVideo";
import KlippersShortMain from "./KlippersShortMain";     
import VideoClipSegmentsFlow from "./generatedvideo/VideoClipSegmentsFlow";




const KlippersShortsListComponent = ({shorts}: {shorts: SchemaUserSegmentVideo[]}) => {
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
      const shortElement = document.getElementById(`short-${index}`);
      if (shortElement) {
        shortElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    useEffect(() => {
      console.log('shorts', shorts);
    }, [shorts]);

    return (
      <>
      {shorts && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, width: '100%', pb: { xs: 0, lg: 8 } }}>
              {/* Render global header and top flow bar once */}
              {shorts.length > 0 && (
                <Box sx={{ mt: 0, mb: 0, width: '100%' }}>
                  <VideoClipSegmentsFlow 
                    filename={shorts[0].name} 
                    segmentCount={shorts.length}
                    onSegmentClick={handleSegmentClick}
                  />
                </Box>
              )}

              {shorts.map((short, index) => (
                <KlippersShortMain
                  key={"short-" + index}
                  segment={short}
                  isFirst={index === 0}
                  isLast={index === shorts.length - 1}
                  index={index}
                />
              ))}
              </Box>
          )}
      </>
    );
  };



interface KlippersShortsListViewProps {
    videoId: string;
    onClose: () => void;
    onPublish: () => void;
    onEdit: () => void;
    onDownload: () => void;
}


export const KlippersShortsListView = ({videoId, onClose, onPublish, onEdit, onDownload}: KlippersShortsListViewProps) => {
    const [shorts, setShorts] = useState<SchemaUserSegmentVideo[]>([]);
    const userShortsApi = new UserShortsApi(createApiConfiguration());

    useEffect(() => {
        const fetchShorts = async () => {
            const response = await userShortsApi.getGeneratedShortsInfoApiV1UserShortsGeneratedShortsInfoVideoIdGet({
                videoId: videoId})
            // const response = await userShortsApi.getGeneratedShortsInfoApiV1UserShortsSimulateGeneratedShortsInfoVideoIdGet({
            //     videoId: videoId
            // });
            console.log("response", response);
            
            const sortedShorts = response.userSegmentVideos.sort((a, b) => b.segmentDetails.score - a.segmentDetails.score);
            setShorts(sortedShorts);
        };
        fetchShorts();
    }, [videoId]);

    return (
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
          height: '100%'
        }}>
            <KlippersShortsListComponent shorts={shorts} />
        </Box>
    )
}

//8f283f57-9481-49b4-ac0c-9d0fc060015b
export const KlippersShortsListViewTest = () => {
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
            <KlippersShortsListView 
                videoId="8f283f57-9481-49b4-ac0c-9d0fc060015b" 
                onClose={() => {}}
                onPublish={() => {}}
                onEdit={() => {}}
                onDownload={() => {}}
            />
        </Box>
    )
}


export default KlippersShortsListView;