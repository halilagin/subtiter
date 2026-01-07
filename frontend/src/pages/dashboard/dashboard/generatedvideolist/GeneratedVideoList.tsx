


import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Pagination
} from '@mui/material';
import { UserVideosApi } from '@/api';
import { createApiConfiguration } from '@/apiConfig';
import AppConfig from '@/AppConfig';
import { VideoItem } from './model/GeneratedVideoListModel';
import VideoCard from './VideoCard';
import { SchemaUserVideoCard } from '@/api/models/SchemaUserVideoCard';
import { AppDbModelDocumentVideoProcessingApplication, ShortConfigJsonInput } from '@/api/models';
// import GeneratePopupDialog from '../dialogvideoapplication/dialoggenerate/dialogshorts/GenerateShortPopupDialog';
import DialogTaskSelection from '../dialogvideoapplication/DialogApplicationSelection';
import { VideoProcessingApplication } from '@/api/models/VideoProcessingApplication';
import { EventType } from '@/events';



interface GeneratedVideoListProps {
    newlyUploadedVideo: VideoItem | null
}

const GeneratedVideoList = ({newlyUploadedVideo}:GeneratedVideoListProps) => {
    const navigate = useNavigate();
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
    const [showGenerateShortsPopup, setShowGenerateShortsPopup] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    


    useEffect(() => {
        if (newlyUploadedVideo) {
            // If we're on page 1, add the new video to the list
            // Otherwise, reset to page 1 to show the new video
            if (page === 1) {
                setVideos(prevVideos => [newlyUploadedVideo, ...prevVideos]);
            } else {
                setPage(1);
            }
        }
    }, [newlyUploadedVideo]);

    const userVideosApi = new UserVideosApi(createApiConfiguration());

    const fetchVideos = useCallback(async (currentPage: number) => {
        try {
            setLoading(true);
            setError(null);
            // Backend returns SchemaPaginatedUserVideoCards with:
            // - items: Array<SchemaUserVideoCard>
            // - total: number
            // - page: number
            // - page_size: number (converted to pageSize in frontend)
            // - total_pages: number (converted to totalPages in frontend)
            const paginatedResponse = await userVideosApi.getProcessedVideosInfoApiV1UserVideosProcessedVideosInfoGet({
                page: currentPage,
                pageSize: pageSize
            });
            
            console.log('API Response:', paginatedResponse);
            console.log('Items count:', paginatedResponse.items?.length);
            console.log('Total:', paginatedResponse.total);
            console.log('Total pages:', paginatedResponse.totalPages);

            if (paginatedResponse && paginatedResponse.items && Array.isArray(paginatedResponse.items)) {
                const videoItems: VideoItem[] = paginatedResponse.items.map((video) => ({
                    ...video,
                    videoThumbnailUrl: video.videoThumbnailUrl ? `${AppConfig.baseApiUrl}${video.videoThumbnailUrl}` : '/public/video-thumbnail.png'
                }));
                
                setVideos(videoItems);
                setTotalPages(paginatedResponse.totalPages || 1);
                setTotal(paginatedResponse.total || 0);
            } else {
                console.warn('Unexpected response format:', paginatedResponse);
                setVideos([]);
                setTotalPages(1);
                setTotal(0);
            }
                
        } catch (err) {
            console.error('Failed to fetch videos:', err);
            setError('Failed to load videos. Please try again later.');
            setVideos([]);
            setTotalPages(1);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);


    const handleCloseDialogApplicationSelection = () => {
        setShowGenerateShortsPopup(false);
    }

    useEffect(() => {
        window.addEventListener(EventType.CLOSE_DIALOG_APPLICATION_SELECTION, handleCloseDialogApplicationSelection as EventListener);
        return () => {
            window.removeEventListener(EventType.CLOSE_DIALOG_APPLICATION_SELECTION, handleCloseDialogApplicationSelection as EventListener);
        }
    }, []);

    useEffect(() => {
        const handleRefreshVideoList = () => {
            fetchVideos(page);
        };

        window.addEventListener(EventType.REFRESH_VIDEO_LIST, handleRefreshVideoList);
        return () => {
            window.removeEventListener(EventType.REFRESH_VIDEO_LIST, handleRefreshVideoList);
        };
    }, [page, fetchVideos]);

    useEffect(() => {
        fetchVideos(page);
    }, [page, fetchVideos]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleCardClick = (video: VideoItem) => {
        setSelectedVideo(video);
        console.log("handleCardClick:video:", video);
        // alert("handleCardClick:"+ video.status);
        if (video.status === 'uploaded') {
            setShowGenerateShortsPopup(true);
        } else {
            if (video.appliedApplication === AppDbModelDocumentVideoProcessingApplication.GenerateShorts) {
                navigate(`/in/list-shorts/${video.videoId}`);
            } else if (video.appliedApplication === AppDbModelDocumentVideoProcessingApplication.GenerateSubtitling) {
                navigate(`/in/list-subtitles/${video.videoId}`);
            } else if (video.appliedApplication === AppDbModelDocumentVideoProcessingApplication.ApplyTrim) {
                navigate(`/in/list-trim/${video.videoId}`);
            } else if (video.appliedApplication === AppDbModelDocumentVideoProcessingApplication.ApplySubtitles) {
                navigate(`/in/list-subtitles/${video.videoId}`);
            }
            // navigate(`/in/list-shorts/${video.videoId}`);
        }
        // navigate(`/in/list-shorts/${videoId}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }





   

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ width: '100%' }}>
            

                {videos.length === 0 ? (
                    <Box textAlign="center" py={8} sx={{ width: '100%' }}>
                        <Typography 
                            variant="h6" 
                            color="text.secondary"
                            sx={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            No videos found
                        </Typography>
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Your generated videos will appear here
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={1.5} sx={{ width: '100%' }}>
                        {videos.map((video, index) => (
                            <VideoCard
                                key={video.videoId || `video-${index}`}
                                video={video}
                                index={index}
                                onCardClick={handleCardClick}
                            >
                                
                            </VideoCard>
                        ))}
                    </Grid>
                )}
            </Box>

            {videos.length > 0 && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}

            {
                showGenerateShortsPopup && selectedVideo &&  <DialogTaskSelection
                    open={showGenerateShortsPopup}
                    onClose={() => setShowGenerateShortsPopup(false)}
                    video={selectedVideo}
                    
                    /> 
            }
        </Box>
    );
};

export default GeneratedVideoList;