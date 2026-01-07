import { SchemaUserSegmentVideo } from "@/api/models/SchemaUserSegmentVideo";
import { Box, Typography, IconButton } from "@mui/material";
import VideoSegmentPlayerActions from "./VideoSegmentPlayerActions";
import VideoNote from "@/components/generatedvideoold/VideoNote";
import VideoSegmentNote from "./VideoSegmentNote";
import VideoSegmentDescriptionView from "./VideoSegmentDescription";
import { useRef, useState, useEffect } from "react";
import AppConfig from "@/AppConfig";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { EventType } from "@/events";






interface VideoSegmentPlayerComponentProps {
    segment: SchemaUserSegmentVideo;    
}

export const VideoSegmentPlayerComponent = ({segment}: VideoSegmentPlayerComponentProps) =>    {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const progressBarRef = useRef<HTMLDivElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

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
            if (event.detail.videoUrl !== segment.videoUrl && videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        };

        window.addEventListener(EventType.PAUSE_OTHER_VIDEOS, handlePauseOtherVideos as EventListener);

        return () => {
            window.removeEventListener(EventType.PAUSE_OTHER_VIDEOS, handlePauseOtherVideos as EventListener);
        };
    }, [segment.videoUrl]);

    const handlePlay = () => {
      if (videoRef.current) {
        // Dispatch event to pause all other videos
        const pauseEvent = new CustomEvent(EventType.PAUSE_OTHER_VIDEOS, { detail: { videoUrl: segment.videoUrl } });
        window.dispatchEvent(pauseEvent);
        
        videoRef.current.play();
        setIsPlaying(true);
      }
    };

    const handleToggle = () => {
      if (!videoRef.current) return;
      if (videoRef.current.paused) {
        // Dispatch event to pause all other videos
        const pauseEvent = new CustomEvent(EventType.PAUSE_OTHER_VIDEOS, { detail: { videoUrl: segment.videoUrl } });
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
        <Box sx={{
          width: '85%',
          maxWidth: 320,
          mx: 0,
          ml: 0,
          aspectRatio: '9/16',
          bgcolor: 'white',
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          zIndex: 1
        }}>
          {segment.videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={AppConfig.baseApiUrl +"/api/v1"+ segment.videoUrl}
                loop
                playsInline
                onClick={handleToggle}
                onEnded={() => setIsPlaying(false)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
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
          {/* <VideoSegmentPlayerActions 
            segment={segment} 
            onPublish={() => {}}
            onEdit={() => {}}
            onDownload={() => {}}
          />
          <VideoSegmentNote /> */}
        </Box>
      );
}



export default VideoSegmentPlayerComponent;