


import React, { useState, useRef } from 'react';
import { Box, Container, Typography } from '@mui/material';
import AppConfig from '@/AppConfig';

import GeneratedVideoList from './generatedvideolist/GeneratedVideoList';

import UploadVideoInputBar from "./dialogvideoapplication/GenerateShortBarVideoInput";
import { VideoItem } from './generatedvideolist/model/GeneratedVideoListModel';
import { UserVideosApi } from "@/api";
import { createApiConfiguration } from "@/apiConfig";


export const MyVideosBoard = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const [newlyUploadedVideo, setNewlyUploadedVideo] = useState<VideoItem | null>(null);
  
  
const fetchUploadedVideoInfo = async (video_id: string): Promise<VideoItem> =>  {
    try {
      const userVideosApi = new UserVideosApi(createApiConfiguration());
      const data = await userVideosApi.getVideoInfoApiV1UserVideosVideoInfoVideoIdGet({
        videoId: video_id
      });
      
      console.log("Uploaded video info:", data);
      // API response is already in camelCase
      const videoItem: VideoItem = {
        videoId: data.videoId,
        videoThumbnailUrl: data.videoThumbnailUrl,
        videoUrl: data.videoUrl,
        videoTitle: data.videoTitle,
        videoDuration: data.videoDuration,
        videoAspectRatio: data.videoAspectRatio,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        status: data.status
      };
      return videoItem;
    } catch (error) {
      console.error('Failed to fetch uploaded video info:', error);
      throw error;
    }
  }

  
   //# /user-videos/video-thumbnail/a0d30dd3-8f30-4e57-be0f-93b6bf8f5fca
   const handleUploadFinished = (user_video_id: string, video_id: string, thumbnail_url: string) => {
    console.log("handleUploadFinished", user_video_id);
     
    fetchUploadedVideoInfo(video_id).then((videoItem: VideoItem) => {
        // Override videoThumbnailUrl with the one provided since it's already available
        const completeVideoItem: VideoItem = {
            ...videoItem,
            videoThumbnailUrl: `${AppConfig.baseApiUrl}${thumbnail_url}`
        };
        setNewlyUploadedVideo(completeVideoItem);
        }).catch((error) => {
        console.error("Error fetching video info:", error);
        alert("Error fetching video info:");
    });
    // setShowVideoProcessProgressBar(true);
    // generate_shorts(video_id, sample_config_json);//generate shorts, start progress bar
}





  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      width: '100%',
      height: '100%'
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 4,
        width: '100%'
      }}>
        <UploadVideoInputBar onUploadFinished={handleUploadFinished} />
        <GeneratedVideoList newlyUploadedVideo={newlyUploadedVideo} />
      </Box>
    </Box>
  );
};




export default MyVideosBoard;