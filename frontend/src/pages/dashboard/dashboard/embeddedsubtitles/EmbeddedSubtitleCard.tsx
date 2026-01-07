import React, { useRef, useState, useEffect } from "react";
import { Box, Typography, IconButton, Grid, Button } from "@mui/material";
import { SubtitleConfigurationUI } from "@/api";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Share } from '@mui/icons-material';
import AppConfig from "@/AppConfig";
import { EventType } from "@/events";
import ShareModal from "@/components/modals/ShareModal";

interface EmbeddedSubtitleCardProps {
    subtitle: SubtitleConfigurationUI;
    index: number;
    onPublish: () => void;
    onEdit: () => void;
    onDownload: () => void;
}

const EmbeddedSubtitleCard = ({ subtitle, index, onPublish, onEdit, onDownload }: EmbeddedSubtitleCardProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const progressBarRef = useRef<HTMLDivElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [openShareModal, setOpenShareModal] = useState(false);

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

    // Listen for pause events from other videos
    useEffect(() => {
        const handlePauseOtherVideos = (event: CustomEvent) => {
            // Only pause if this is not the video that triggered the event
            if (event.detail.videoUrl !== subtitle.videoUrl && videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        };

        window.addEventListener(EventType.PAUSE_OTHER_VIDEOS, handlePauseOtherVideos as EventListener);

        return () => {
            window.removeEventListener(EventType.PAUSE_OTHER_VIDEOS, handlePauseOtherVideos as EventListener);
        };
    }, [subtitle.videoUrl]);

    const handlePlay = () => {
        if (videoRef.current) {
            // Dispatch event to pause all other videos
            const pauseEvent = new CustomEvent(EventType.PAUSE_OTHER_VIDEOS, { detail: { videoUrl: subtitle.videoUrl } });
            window.dispatchEvent(pauseEvent);
            
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleToggle = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            // Dispatch event to pause all other videos
            const pauseEvent = new CustomEvent(EventType.PAUSE_OTHER_VIDEOS, { detail: { videoUrl: subtitle.videoUrl } });
            window.dispatchEvent(pauseEvent);
            
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const getProgressFromEvent = (e: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent | React.TouchEvent<HTMLDivElement>): number => {
        if (!progressBarRef.current) return 0;
        const rect = progressBarRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : ('clientX' in e ? e.clientX : 0);
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        return percentage * duration;
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || !progressBarRef.current) return;
        const newTime = getProgressFromEvent(e);
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return;
        setIsDragging(true);
        const wasPlaying = !videoRef.current.paused;
        videoRef.current.pause();
        setIsPlaying(false);
        
        const newTime = getProgressFromEvent(e);
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);

        const handleMouseMove = (e: MouseEvent) => {
            if (!videoRef.current) return;
            const newTime = getProgressFromEvent(e);
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            if (wasPlaying && videoRef.current) {
                videoRef.current.play();
                setIsPlaying(true);
            }
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!videoRef.current) return;
        setIsDragging(true);
        const wasPlaying = !videoRef.current.paused;
        videoRef.current.pause();
        setIsPlaying(false);
        
        const newTime = getProgressFromEvent(e);
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);

        const handleTouchMove = (e: TouchEvent) => {
            if (!videoRef.current) return;
            const newTime = getProgressFromEvent(e);
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        };

        const handleTouchEnd = () => {
            setIsDragging(false);
            if (wasPlaying && videoRef.current) {
                videoRef.current.play();
                setIsPlaying(true);
            }
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };

        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
    };

    return (
        <Box 
            id={`subtitle-${index}`}
            sx={{ 
                maxWidth: '1200px',
                mx: 'auto',
                width: '100%',
                pt: index === 0 ? 4 : 10,
                pb: { xs: 12, lg: 12 },
                px: 3,
                scrollMarginTop: '20px'
            }}
        >
            <Grid container spacing={8}>
                {/* Video Preview Column */}
                <Grid item xs={12} lg={4} sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%'
                    }}>
                <Box sx={{ 
                    position: 'relative',
                    width: '100%',
                    minHeight: { xs: '300px', md: '400px' },
                    bgcolor: 'white',
                    borderRadius: 8,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    zIndex: 1
                }}>
                {subtitle.videoUrl ? (
                    <>
                        <video
                            ref={videoRef}
                            src={AppConfig.baseApiUrl +"/api/v1"+ subtitle.videoUrl}
                            poster={subtitle.thumbnailUrl}
                            loop
                            playsInline
                            onClick={handleToggle}
                            onEnded={() => setIsPlaying(false)}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                objectPosition: 'center'
                            }}
                        />

                        {!isPlaying && (
                            <Box sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(0,0,0,0.2)'
                            }}>
                                <IconButton 
                                    onClick={handlePlay}
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        bgcolor: 'rgba(0,0,0,0.6)',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                                    }}
                                >
                                    <PlayArrowIcon sx={{ fontSize: 36 }} />
                                </IconButton>
                            </Box>
                        )}

                        {/* Progress bar and time indicator at the bottom */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                            p: 1,
                            pb: 1.5,
                            px: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            zIndex: 3
                        }}>
                            {/* Progress bar */}
                            <Box 
                                ref={progressBarRef}
                                onClick={handleProgressClick}
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleTouchStart}
                                sx={{
                                    width: '100%',
                                    height: 4,
                                    bgcolor: 'rgba(255,255,255,0.3)',
                                    borderRadius: 2,
                                    overflow: 'visible',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    userSelect: 'none'
                                }}
                            >
                                <Box sx={{
                                    height: '100%',
                                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                                    bgcolor: 'white',
                                    transition: isDragging ? 'none' : 'width 0.1s linear',
                                    borderRadius: 2,
                                    position: 'relative'
                                }}>
                                    {/* Circle thumb */}
                                    <Box sx={{
                                        position: 'absolute',
                                        right: -6,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: 12,
                                        height: 12,
                                        bgcolor: 'white',
                                        borderRadius: '50%',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                        pointerEvents: 'none'
                                    }} />
                                </Box>
                            </Box>

                            {/* Time display */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                px: 0.5
                            }}>
                                <Typography variant="caption" sx={{
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                                }}>
                                    {formatTime(currentTime)}
                                </Typography>
                                <Typography variant="caption" sx={{
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                                }}>
                                    {formatTime(duration)}
                                </Typography>
                            </Box>
                        </Box>
                    </>
                ) : (
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        Video Preview Container
                    </Typography>
                )}
                </Box>

                {/* Action Buttons */}
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 3,
                    mt: 2,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Button 
                        variant="contained" 
                        onClick={onDownload}
                        sx={{ 
                            bgcolor: '#000000',
                            color: 'white',
                            borderRadius: 12,
                            py: 1.6,
                            px: 2.5,
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            textTransform: 'none',
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
                    width: '100%',
                    mx: 'auto',
                    textAlign: 'center',
                    mb: { xs: 2, md: 0 }
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
                </Box>
            </Grid>

            {/* Content Column */}
            <Grid item xs={12} lg={8} sx={{ position: 'relative', zIndex: 2, mt: { xs: 0, lg: 0 } }}>
                <Box sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(70vw * 16/9)',
                    overflow: 'visible'
                }}>
                    <Box sx={{
                        flex: 1,
                        overflow: 'visible',
                        pr: 2,
                        pb: { xs: 2, lg: 0 }
                    }}>
                        <Typography variant="h5" sx={{ fontWeight: '700', color: '#2f2e2c', mb: 3, mt: { xs: -8, lg: 0 }, fontFamily: "'Inter', sans-serif" }}>
                            Subtitle Configuration {index + 1}
                        </Typography>
                        
                        {subtitle.subtitleConfiguration && (
                            <Box sx={{
                                bgcolor: 'white',
                                p: 3,
                                borderRadius: 8,
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                mb: 4
                            }}>
                                <Typography variant="h6" sx={{ 
                                    fontWeight: '600', 
                                    color: '#2f2e2c', 
                                    fontSize: '1rem', 
                                    mb: 2,
                                    fontFamily: "'Inter', sans-serif" 
                                }}>
                                    Configuration Details
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ 
                                        color: '#6B7280', 
                                        lineHeight: 1.6, 
                                        fontSize: '1rem', 
                                        fontWeight: '300',
                                        mb: 1.5,
                                        fontFamily: "'Inter', sans-serif" 
                                    }}>
                                        <strong>Position:</strong> {subtitle.subtitleConfiguration.subtitlePosition || 'Default'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                        color: '#6B7280', 
                                        lineHeight: 1.6, 
                                        fontSize: '1rem', 
                                        fontWeight: '300',
                                        mb: 1.5,
                                        fontFamily: "'Inter', sans-serif" 
                                    }}>
                                        <strong>Style:</strong> {subtitle.subtitleConfiguration.subtitleStyle || 'Default'}
                                    </Typography>
                                    {subtitle.subtitleConfiguration.color && (
                                        <Typography variant="body2" sx={{ 
                                            color: '#6B7280', 
                                            lineHeight: 1.6, 
                                            fontSize: '1rem', 
                                            fontWeight: '300',
                                            mb: 1.5,
                                            fontFamily: "'Inter', sans-serif" 
                                        }}>
                                            <strong>Color:</strong> {subtitle.subtitleConfiguration.color}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Grid>
        </Grid>

        <ShareModal
            open={openShareModal}
            onClose={() => setOpenShareModal(false)}
            videoTitle={subtitle.subtitleConfiguration?.subtitleStyle || `Subtitle Configuration #${index + 1}`}
            videoUrl={subtitle.videoUrl || ""}
        />
    </Box>
    );
};

export default EmbeddedSubtitleCard;

