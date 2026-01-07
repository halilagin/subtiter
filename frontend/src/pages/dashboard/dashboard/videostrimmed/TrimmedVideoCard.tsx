import React, { useRef, useState, useEffect } from "react";
import { Box, Typography, IconButton, Card, CardContent, CardMedia, Button } from "@mui/material";
import { TrimConfigurationUI } from "@/api";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import AppConfig from "@/AppConfig";

interface TrimmedVideoCardProps {
    trimmedVideo: TrimConfigurationUI;
    index: number;
    onPublish: () => void;
    onEdit: () => void;
    onDownload: () => void;
}

const TrimmedVideoCard = ({ trimmedVideo, index, onPublish, onEdit, onDownload }: TrimmedVideoCardProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Update duration when video metadata is loaded
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, []);

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        video.currentTime = percentage * duration;
    };

    return (
        <Card 
            id={`trimmed-video-${index}`}
            sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                maxWidth: '1200px',
                mx: 'auto',
                width: '100%',
                boxShadow: 3,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'white'
            }}
        >
            {/* Video Player Section */}
            <Box sx={{ 
                position: 'relative',
                width: { xs: '100%', md: '400px' },
                minHeight: { xs: '300px', md: '400px' },
                bgcolor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <video
                    ref={videoRef}
                    src={AppConfig.baseApiUrl +"/api/v1"+ trimmedVideo.videoUrl}
                    

                    poster={trimmedVideo.thumbnailUrl}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }}
                    onEnded={() => setIsPlaying(false)}
                />
                
                {/* Play/Pause Overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0, 0, 0, 0.3)',
                        opacity: isPlaying ? 0 : 1,
                        transition: 'opacity 0.3s',
                        '&:hover': {
                            opacity: 1
                        },
                        cursor: 'pointer'
                    }}
                    onClick={togglePlayPause}
                >
                    <IconButton
                        sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover': {
                                bgcolor: 'white'
                            },
                            width: 64,
                            height: 64
                        }}
                    >
                        {isPlaying ? (
                            <PauseIcon sx={{ fontSize: 40, color: 'black' }} />
                        ) : (
                            <PlayArrowIcon sx={{ fontSize: 40, color: 'black' }} />
                        )}
                    </IconButton>
                </Box>

                {/* Progress Bar */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                        cursor: 'pointer'
                    }}
                    onClick={handleProgressClick}
                >
                    <Box
                        sx={{
                            height: '100%',
                            bgcolor: 'primary.main',
                            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                            transition: 'width 0.1s'
                        }}
                    />
                </Box>

                {/* Time Display */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem'
                    }}
                >
                    {formatTime(currentTime)} / {formatTime(duration)}
                </Box>
            </Box>

            {/* Content Section */}
            <Box sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <CardContent sx={{ flex: 1, p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Trimmed Video #{index + 1}
                    </Typography>
                    
                    {trimmedVideo.trimConfiguration && (
                        <Box sx={{ mt: 2 }}>
                            <Box key={trimmedVideo.trimConfiguration.id || index} sx={{ mb: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    <strong>Trim Configuration</strong>
                                </Typography>
                                {trimmedVideo.trimConfiguration.trimStartInSeconds !== undefined && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        <strong>Start:</strong> {formatTime(trimmedVideo.trimConfiguration.trimStartInSeconds)}
                                    </Typography>
                                )}
                                {trimmedVideo.trimConfiguration.trimEndInSeconds !== undefined && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        <strong>End:</strong> {formatTime(trimmedVideo.trimConfiguration.trimEndInSeconds)}
                                    </Typography>
                                )}
                                {trimmedVideo.trimConfiguration.trimStartInSeconds !== undefined && trimmedVideo.trimConfiguration.trimEndInSeconds !== undefined && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        <strong>Duration:</strong> {formatTime(trimmedVideo.trimConfiguration.trimEndInSeconds - trimmedVideo.trimConfiguration.trimStartInSeconds)}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    )}
                </CardContent>

                {/* Action Buttons */}
                <Box sx={{ 
                    p: 2, 
                    pt: 0,
                    display: 'flex', 
                    gap: 1,
                    flexWrap: 'wrap'
                }}>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={onDownload}
                        size="small"
                    >
                        Download
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={onEdit}
                        size="small"
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<ShareIcon />}
                        onClick={onPublish}
                        size="small"
                    >
                        Share
                    </Button>
                </Box>
            </Box>
        </Card>
    );
};

export default TrimmedVideoCard;

