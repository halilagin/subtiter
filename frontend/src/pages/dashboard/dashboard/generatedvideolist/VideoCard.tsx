import React, { useState, useEffect } from 'react';
import { Card, CardMedia, Grid, IconButton, Menu, MenuItem, Box, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { VideoItem } from './model/GeneratedVideoListModel';
import { WebSocketMessagingComponent } from '../WebSocketManager';
import VideoProcessProgressBar from '@/components/VideoProcessProgressBar/VideoProcessProgressBar';
import { ShortConfigJsonInput, ShortConfigJsonInputToJSON, SubtitleApplication, TrimApplication } from '@/api/models';
import { UserShortsApi, UserTrimmingApi, UserVideosApi } from '@/api/apis';
import { ResponseError } from '@/api/runtime';
import { createApiConfiguration } from '@/apiConfig';
import AppConfig from '@/AppConfig';
import { useNavigate } from 'react-router-dom';
import { VideoProcessingApplication } from '@/api/models/VideoProcessingApplication';
import { UserSubtitlingApi } from '@/api/apis';
import { AppDbModelDocumentVideoProcessingApplication } from '@/api/models';
import { EventType } from '@/events';

interface VideoCardProps {
    video: VideoItem;
    index: number;
    onCardClick: (video: VideoItem) => void;
    children?: React.ReactNode;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, index, onCardClick, children }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [videoProcessingFinished, setVideoProcessingFinished] = useState(false);
    const [videoProcessingProgressPercentage, setVideoProcessingProgressPercentage] = useState(1);
    const [videoProcessingMessage, setVideoProcessingMessage] = useState('');
    const [showVideoProcessProgressBar, setShowVideoProcessProgressBar] = useState(video.status === 'processing');
    const [clientId, setClientId] = useState( Math.random().toString(36) );
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
    const [videoApplicationApplied, setVideoApplicationApplied] = useState<string | null>(null);
    const navigate = useNavigate();



    const getApplicationLabel = (app?: AppDbModelDocumentVideoProcessingApplication): string => {
        if (!app) return '';
        
        switch (app) {
            case AppDbModelDocumentVideoProcessingApplication.GenerateShorts:
                return 'Shorts generated';
            case AppDbModelDocumentVideoProcessingApplication.GenerateSubtitling:
                return 'Subtitles embedded';
            case AppDbModelDocumentVideoProcessingApplication.ApplyTrim:
                return 'Trimmed';
            case AppDbModelDocumentVideoProcessingApplication.ApplySubtitles:
                return 'Subtitles generated';
            case AppDbModelDocumentVideoProcessingApplication.ApplyVoiceOver:
                return 'Voice Over';
            case AppDbModelDocumentVideoProcessingApplication.ApplyVlog:
                return 'Vlog';
            case AppDbModelDocumentVideoProcessingApplication.ApplyPodcastTemplate:
                return 'Podcast';
            default:
                return '';
        }
    };






const generate_shorts = async (videoId: string, config_json: any) => {
    console.log("generate_shorts");
    
    try {
        console.log("config_json", config_json);
        const userShortsApi = new UserShortsApi(createApiConfiguration());
        
        const data = await userShortsApi.generateShortsApiV1UserShortsGenerateShortsVideoIdPost({
            videoId: videoId,
            requestBody: { config_json: config_json }
        });
        
        // console.log("Generate shorts API response:", data);
    } catch (error) {
        console.error('Generate shorts error:', error);
        if (error instanceof ResponseError && error.response.status === 551) {
            
            setShowVideoProcessProgressBar(false);
            setShowUpgradeDialog(true);
        }
    }
}
  //onGenerateShortsClicked(video.videoId, config);
  const handleGenerateShortsClicked = (videoId: string, config: ShortConfigJsonInput) => {
    console.log("handleGenerateShortsClicked", videoId, config);
    const shorts_config = ShortConfigJsonInputToJSON(config);
    generate_shorts(videoId, shorts_config);
  }

  const handleApplySubtitlesClicked = async (videoId: string, subtitleApplication: SubtitleApplication) => {
    try {
        const userSubtitlingApi = new UserSubtitlingApi(createApiConfiguration());
        const data = await userSubtitlingApi.generateSubtitlingApiV1UserSubtitlingGenerateSubtitlingVideoIdPost  ({
            videoId: videoId,   
            subtitleApplication: subtitleApplication
        });
         
    } catch (error) {
        console.error('Apply subtitles error:', error);
    }
  }

  const handleApplyTrimClicked = async (videoId: string, trimApplication: TrimApplication) => {
    console.log("handleApplyTrimClicked", videoId, trimApplication);

    try {
        const userTrimApi = new UserTrimmingApi(createApiConfiguration());
        const data = await userTrimApi.generateTrimmingApiV1UserTrimmingGenerateTrimmingVideoIdPost  ({
            videoId: videoId,
            trimApplication: trimApplication
        });
    } catch (error) {
        console.error('Apply trim error:', error);
    }
  }

    useEffect(() => {
        const handleGenerationStarted = (event: CustomEvent) => {
               
            if (event.detail.videoId === video.videoId) {
                console.log("generation-started", event.detail); 
                setShowVideoProcessProgressBar(true);
                setTimeout(() => {
                    if (event.detail.application === VideoProcessingApplication.GenerateShorts) {
                        setVideoApplicationApplied(AppDbModelDocumentVideoProcessingApplication.GenerateShorts);
                        handleGenerateShortsClicked(event.detail.videoId, event.detail.config);
                    } else if (event.detail.application === VideoProcessingApplication.ApplySubtitles) {
                        setVideoApplicationApplied(AppDbModelDocumentVideoProcessingApplication.GenerateSubtitling);
                        handleApplySubtitlesClicked(event.detail.videoId, event.detail.subtitleApplication);
                    } else if (event.detail.application === VideoProcessingApplication.ApplyTrim) {
                        setVideoApplicationApplied(AppDbModelDocumentVideoProcessingApplication.ApplyTrim);
                        handleApplyTrimClicked(event.detail.videoId, event.detail.trimApplication);
                    }
                }, 500);
            }
        };

        window.addEventListener(EventType.GENERATION_STARTED, handleGenerationStarted as EventListener);

        return () => {
            window.removeEventListener(EventType.GENERATION_STARTED, handleGenerationStarted as EventListener);
        };
    }, [video.videoId]);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDeleteClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        setShowDeleteConfirmDialog(true);
    };


    const handleDownloadClick = async (videoId: string) => {
        try {
            console.log("handleDownloadClick", videoId);
            
            // Create the download URL
            const downloadUrl = `${AppConfig.baseApiUrl}/api/v1/user-videos/video-download-original/${videoId}`;
            
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
            link.download = `${videoId}.mp4`;
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

    const handleShareClick = async (videoId: string) => {
        console.log("handleShareClick", videoId);
    }

    const handleEditClick = async (videoId: string) => {
        console.log("handleEditClick", videoId);
    }

    const handleMenuItemClick = (action: string, videoId: string) => async (event: React.MouseEvent) => {
        event.stopPropagation();
        handleMenuClose();
        // TODO: Handle menu actions
        // if (action === 'delete') {
        //     setShowDeleteConfirmDialog(true);
        // }

        if (action === 'download') {
            handleDownloadClick(videoId);
        } else if (action === 'share') {
            handleShareClick(videoId);
        } else if (action === 'edit') {
            handleEditClick(videoId);
        }
    };

    const handleConfirmDelete = async () => {
        setShowDeleteConfirmDialog(false);
        try {
            const userVideosApi = new UserVideosApi(createApiConfiguration());
            const data = await userVideosApi.deleteVideoApiV1UserVideosDeleteVideoVideoIdGet({
                videoId: video.videoId
            }).then(() => {
                window.dispatchEvent(new CustomEvent(EventType.REFRESH_VIDEO_LIST));
            });
            console.log("Delete video API response:", data);
        } catch (error) {
            console.error('Delete video error:', error);
        }
    };


    const handleMessage = (message: any) => {
        if (!!!message)
            return;
    
        
        const [stepString, messageText] = message.message.split("___");
        const step = parseInt(stepString);
        const stepCount = 7;
        let stepPercentage = (1./stepCount) * step * 100;
        console.log("handleMessage", step, stepPercentage, messageText);
        if (step === stepCount){
            stepPercentage  = 100
            handleVideoProcessingFinished();
        }
        setVideoProcessingProgressPercentage(stepPercentage);
        setVideoProcessingMessage(messageText);
    
    
      }
          
    const handleVideoProcessingFinished = () => {

        setTimeout(() => {
            video.status = 'completed';
            setShowVideoProcessProgressBar(false);
            setVideoProcessingFinished(true);
            // navigate(`/in/list-shorts/${videoId}`);
            if (videoApplicationApplied === AppDbModelDocumentVideoProcessingApplication.GenerateShorts) {
                navigate(`/in/list-shorts/${video.videoId}`);
            } else if (videoApplicationApplied === AppDbModelDocumentVideoProcessingApplication.GenerateSubtitling) {
                navigate(`/in/list-subtitles/${video.videoId}`);
            }
          }, 1000); //1000ms delay to hide the progress bar
        
      }

    return (
        <Grid item xs={12} sm={6} md={3} lg={3} key={video.videoId || `video-${index}`}>
            {showVideoProcessProgressBar && <WebSocketMessagingComponent clientId={clientId} roomId={video.videoId} onMessage={handleMessage} />} 
            <Dialog
                open={showUpgradeDialog}
                onClose={() => setShowUpgradeDialog(false)}
                aria-labelledby="upgrade-dialog-title"
                aria-describedby="upgrade-dialog-description"
            >
                <DialogTitle id="upgrade-dialog-title">{"Usage Limit Reached"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="upgrade-dialog-description">
                        You have reached your usage limit. Please upgrade your subscription to continue generating shorts.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowUpgradeDialog(false)}>Cancel</Button>
                    <Button onClick={() => {
                        setShowUpgradeDialog(false);
                        navigate('/in/subscription');
                    }} autoFocus>
                        Upgrade
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={showDeleteConfirmDialog}
                onClose={() => setShowDeleteConfirmDialog(false)}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">{"Delete Video"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete this video? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteConfirmDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Card
                sx={{
                    width: '100%',
                    cursor: showVideoProcessProgressBar ? 'default' : 'pointer',
                    transition: 'transform 0.2s ease-in-out',
                    borderRadius: '16px',
                    border: '1px solid #f0f0f0',
                    backgroundColor: 'white',
                    position: 'relative',
                    '&:hover': showVideoProcessProgressBar ? {} : {
                        transform: 'translateY(-4px)',
                        '& .action-icons': {
                            opacity: 1,
                        },
                        '& .hover-message': {
                            opacity: 1,
                        },
                    },
                }}
                onClick={() => { if (!showVideoProcessProgressBar) onCardClick(video) }}
                elevation={0}
            >
                <Box sx={{ position: 'relative' }}>
                    <CardMedia
                        component="img"
                        height="270"
                        width="480"
                        image={video.videoThumbnailUrl || '/public/video-thumbnail.png'}
                        alt={video.videoTitle}
                        sx={{
                            objectFit: 'cover',
                            bgcolor: 'grey.100',
                            borderRadius: '16px',
                            width: '100%',
                            height: 'auto',
                            aspectRatio: '16/9'
                        }}
                        onError={(e) => {
                            // const target = e.target as HTMLImageElement;
                            // target.src = '/public/placeholder-video.jpg';
                        }}
                    />

                    {showVideoProcessProgressBar && <VideoProcessProgressBar onFinished={handleVideoProcessingFinished} progress={videoProcessingProgressPercentage} isProcessing={true} message={videoProcessingMessage} showPercentage={true} />}

                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}>
                            {video.videoId.substring(0, 6)}...
                        </Typography>
                    </Box>
                    {/* Three-dot menu - Top Right */}
                    <IconButton
                        className="action-icons"
                        onClick={handleMenuClick}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            opacity: 0,
                            transition: 'opacity 0.2s ease-in-out',
                            zIndex: 2,
                            pointerEvents: showVideoProcessProgressBar ? 'none' : 'auto',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 1)',
                            },
                        }}
                        size="small"
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>

                    {/* Delete icon - Bottom Right */}
                    <IconButton
                        className="action-icons"
                        onClick={handleDeleteClick}
                        sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            opacity: 0,
                            transition: 'opacity 0.2s ease-in-out',
                            zIndex: 2,
                            pointerEvents: showVideoProcessProgressBar ? 'none' : 'auto',
                            '&:hover': {
                                backgroundColor: 'rgba(244, 67, 54, 0.9)',
                                color: 'white',
                            },
                        }}
                        size="small"
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>

                    {/* Application Label - Bottom Right */}
                    {video.appliedApplication && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                zIndex: 1,
                                pointerEvents: 'none',
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                {getApplicationLabel(video.appliedApplication)}
                            </Typography>
                        </Box>
                    )}

                    {/* Hover message - Bottom Center */}
                    <Box
                        className="hover-message"
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                            color: 'white',
                            padding: '12px',
                            paddingRight: '56px', // Leave space for delete icon
                            textAlign: 'center',
                            borderBottomLeftRadius: '16px',
                            borderBottomRightRadius: '16px',
                            opacity: showVideoProcessProgressBar ? 0 : 0,
                            transition: 'opacity 0.2s ease-in-out',
                            pointerEvents: 'none',
                            zIndex: 1,
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {
                                video.status === 'uploaded' ? 'Click to generate the shorts' : 'Click to see the shorts'
                            }
                        </Typography>
                    </Box>
                </Box>

                {/* Dropdown Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    onClick={(e) => e.stopPropagation()}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={handleMenuItemClick('edit', video.videoId)} data-video-id={video.videoId}>Edit</MenuItem>
                    <MenuItem onClick={handleMenuItemClick('share', video.videoId)} data-video-id={video.videoId}>Share</MenuItem>
                    <MenuItem onClick={handleMenuItemClick('download', video.videoId)} data-video-id={video.videoId}>Download</MenuItem>
                </Menu>
            </Card>
        </Grid>
    );
};

export default VideoCard;


