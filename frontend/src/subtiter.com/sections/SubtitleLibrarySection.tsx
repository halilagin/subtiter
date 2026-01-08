import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Grid, IconButton, Slider, Tabs, Tab } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

interface SubtitleLibrarySectionProps {
  onNext: () => void;
  onPrevious: () => void;
  onSubtitleSelected: (subtitle: any) => void;
  uploadedVideo?: File | null;
}

// Generate 36 subtitle styles (2 pages x 18 cards)
const generateSubtitleStyles = () => {
  const baseStyles = [
    { id: 'default', name: 'Default' },
    { id: 'regular', name: 'Regular' },
    { id: 'rounded_box', name: 'Rounded Box' },
    { id: 'message_box', name: 'Message Box' },
    { id: 'classic', name: 'Classic' },
    { id: 'modern', name: 'Modern' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'bold', name: 'Bold' },
    { id: 'elegant', name: 'Elegant' },
    { id: 'vibrant', name: 'Vibrant' },
    { id: 'subtle', name: 'Subtle' },
    { id: 'dynamic', name: 'Dynamic' },
    { id: 'clean', name: 'Clean' },
    { id: 'stylish', name: 'Stylish' },
    { id: 'sleek', name: 'Sleek' },
    { id: 'refined', name: 'Refined' },
    { id: 'sophisticated', name: 'Sophisticated' },
    { id: 'contemporary', name: 'Contemporary' },
    { id: 'timeless', name: 'Timeless' },
    { id: 'premium', name: 'Premium' },
    { id: 'artistic', name: 'Artistic' },
    { id: 'creative', name: 'Creative' },
    { id: 'professional', name: 'Professional' },
    { id: 'cinematic', name: 'Cinematic' },
    { id: 'dramatic', name: 'Dramatic' },
    { id: 'playful', name: 'Playful' },
    { id: 'retro', name: 'Retro' },
    { id: 'neon', name: 'Neon' },
    { id: 'vintage', name: 'Vintage' },
    { id: 'futuristic', name: 'Futuristic' },
    { id: 'handwritten', name: 'Handwritten' },
    { id: 'typewriter', name: 'Typewriter' },
    { id: 'comic', name: 'Comic' },
    { id: 'graffiti', name: 'Graffiti' },
    { id: 'glitch', name: 'Glitch' },
    { id: 'gradient', name: 'Gradient' },
  ];

  return baseStyles.map((style) => ({
    ...style,
    description: `${style.name} subtitle style`,
    preview: style.name,
  }));
};

const subtitleStyles = generateSubtitleStyles();

// Add some popular styles from the image
const popularStyles = [
  { id: 'karaoke', name: 'Karaoke', isNew: false },
  { id: 'beasty', name: 'Beasty', isNew: false },
  { id: 'deep_diver', name: 'Deep Diver', isNew: false },
  { id: 'youshaei', name: 'Youshaei', isNew: false },
  { id: 'pod_p', name: 'Pod P', isNew: false },
  { id: 'mozi', name: 'Mozi', isNew: false },
  { id: 'popline', name: 'Popline', isNew: false },
  { id: 'glitch_infinite', name: 'Glitch Infinite', isNew: true },
  { id: 'seamless_bounce', name: 'Seamless Bounce', isNew: true },
];

const allStyles = [...popularStyles, ...subtitleStyles.filter(s => !popularStyles.find(p => p.id === s.id))];

export const SubtitleLibrarySection: React.FC<SubtitleLibrarySectionProps> = ({
  onNext,
  onPrevious,
  onSubtitleSelected,
  uploadedVideo,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    if (uploadedVideo) {
      const url = URL.createObjectURL(uploadedVideo);
      setVideoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [uploadedVideo]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (video.videoWidth && video.videoHeight) {
        const aspectRatio = video.videoWidth / video.videoHeight;
        setVideoAspectRatio(aspectRatio);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleVolumeChange = () => {
      setVolume(video.muted ? 0 : video.volume);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    // Initialize volume
    if (video.volume === 0) {
      video.volume = 1;
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [videoPreviewUrl]);



  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (style: any) => {
    setSelectedStyle(style.id);
    onSubtitleSelected(style);
  };

  const renderCaptionPreview = (styleId: string) => {
    switch (styleId) {
      case 'no_captions':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '3px solid rgba(255, 255, 255, 0.5)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                  width: '80%',
                  height: '3px',
                  bgcolor: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            />
          </Box>
        );
      case 'karaoke':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 0.5, width: '100%', height: '100%', px: 2 }}>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 700, color: '#ffffff', textShadow: '2px 2px 0px #000000', lineHeight: 1 }}>TO GET</Typography>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 700, color: '#ffffff', textShadow: '2px 2px 0px #000000', lineHeight: 1 }}>STARTED</Typography>
          </Box>
        );
      case 'beasty':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 0.5, width: '100%', height: '100%', px: 2 }}>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 700, color: '#ffffff', textShadow: '2px 2px 0px #000000', lineHeight: 1 }}>TO GET</Typography>
          </Box>
        );
      case 'deep_diver':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', px: 2 }}>
            <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)', borderRadius: 1, px: 1.5, py: 0.75 }}>
              <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.5rem', fontWeight: 400, color: '#000000', lineHeight: 1 }}>To get started</Typography>
            </Box>
          </Box>
        );
      case 'youshaei':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 0.5, width: '100%', height: '100%', px: 2 }}>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 400, color: '#90EE90', lineHeight: 1 }}>TO GET STARTED</Typography>
          </Box>
        );
      case 'pod_p':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', px: 2 }}>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 700, color: '#FF69B4', textShadow: '2px 2px 0px #000000', lineHeight: 1 }}>STARTED</Typography>
          </Box>
        );
      case 'mozi':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 0.5, width: '100%', height: '100%', px: 2 }}>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 700, color: '#ffffff', textShadow: '2px 2px 0px #000000', lineHeight: 1 }}>TO GET</Typography>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 700, color: '#00FF00', textShadow: '2px 2px 0px #000000', lineHeight: 1 }}>STARTED</Typography>
          </Box>
        );
      case 'popline':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 0.5, width: '100%', height: '100%', px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 700, color: '#ffffff', textShadow: '2px 2px 0px #000000', lineHeight: 1 }}>TO</Typography>
              <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.45rem', fontWeight: 400, color: '#9370DB', lineHeight: 1 }}>get</Typography>
            </Box>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 700, color: '#ffffff', textShadow: '2px 2px 0px #000000', lineHeight: 1 }}>STARTED</Typography>
          </Box>
        );
      case 'glitch_infinite':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 0.5, width: '100%', height: '100%', px: 2 }}>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.55rem', fontWeight: 400, background: 'linear-gradient(135deg, #FF8C00, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '2px 2px 0px #FF0000', lineHeight: 1 }}>To get</Typography>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.55rem', fontWeight: 400, background: 'linear-gradient(135deg, #FF8C00, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '2px 2px 0px #FF0000', lineHeight: 1 }}>started</Typography>
          </Box>
        );
      case 'seamless_bounce':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 0.5, width: '100%', height: '100%', px: 2 }}>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.55rem', fontWeight: 400, color: '#90EE90', textShadow: '2px 2px 0px #006400', lineHeight: 1 }}>To get</Typography>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.55rem', fontWeight: 400, color: '#90EE90', textShadow: '2px 2px 0px #006400', lineHeight: 1 }}>started</Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', px: 2 }}>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.5rem', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center' }}>{styleId}</Typography>
          </Box>
        );
    }
  };

  // Get selected subtitle style for preview
  const selectedSubtitleStyle = selectedStyle ? allStyles.find(s => s.id === selectedStyle) : null;

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        p: 3,
        justifyContent: 'space-between',
        overflow: 'hidden',
        overflowX: 'hidden',
        overflowY: 'hidden',
      }}
    >
      {/* Left Sidebar - Caption Settings */}
      <Box
        data-subtitle-area="true"
        sx={{
          width: '350px',
          flexShrink: 0,
          ml: 2,
          bgcolor: 'rgba(26, 26, 26, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100% - 24px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Caption Title */}
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Typography
              sx={{
                fontFamily: "'Inter', sans-serif",
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#ffffff',
              }}
            >
            Caption
            </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.6)',
                textTransform: 'none',
            fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
            fontWeight: 400,
                minHeight: 48,
                '&.Mui-selected': {
            color: '#ffffff',
                  fontWeight: 500,
                },
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#f16838',
              },
            }}
          >
            <Tab label="Presets" />
            <Tab label="Font" />
            <Tab label="Effects" />
          </Tabs>
      </Box>

        {/* Content based on active tab */}
        {activeTab === 0 && (
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          overflowX: 'hidden',
          overflowY: 'hidden',
          p: 1,
          }}
        >
            <Grid container spacing={2}>
              {allStyles.map((style) => (
                <Grid item xs={6} key={style.id}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Box
              onClick={() => handleSelect(style)}
              sx={{
                        aspectRatio: '4 / 3',
                        borderRadius: 3,
                        bgcolor: selectedStyle === style.id 
                          ? 'rgba(241, 104, 56, 0.15)' 
                          : '#2a2a2a',
                display: 'flex',
                flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                  position: 'relative',
                        p: 1,
                  '&:hover': {
                          transform: 'translateY(-2px)',
                          bgcolor: selectedStyle === style.id 
                            ? 'rgba(241, 104, 56, 0.2)' 
                            : '#333333',
                  },
                }}
              >
                {selectedStyle === style.id && (
                  <Box
                    sx={{
                      position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 16,
                            height: 16,
                      borderRadius: '50%',
                            bgcolor: '#f16838',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                            zIndex: 2,
                    }}
                  >
                          <CheckIcon sx={{ fontSize: 12, color: '#ffffff' }} />
                  </Box>
                )}
                      {(style as any).isNew && (
                <Box
                  sx={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            bgcolor: '#90EE90',
                            borderRadius: 0.75,
                            px: 0.5,
                            py: 0.15,
                            zIndex: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Inter', sans-serif",
                              fontSize: '0.45rem',
                              fontWeight: 600,
                              color: '#000000',
                      lineHeight: 1,
                    }}
                  >
                            New
                  </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                        {renderCaptionPreview(style.id)}
                </Box>
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                        fontSize: '0.65rem',
                  fontWeight: 400,
                  color: '#ffffff',
                  textAlign: 'center',
                }}
              >
                {style.name}
              </Typography>
                  </Box>
            </Grid>
          ))}
        </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ flex: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: "'Inter', sans-serif" }}>
              Font settings coming soon
            </Typography>
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ flex: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: "'Inter', sans-serif" }}>
              Effects settings coming soon
            </Typography>
          </Box>
        )}

        {/* Continue Button */}
        {selectedStyle && (
          <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Button
              variant="contained"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              sx={{
                bgcolor: '#f16838',
                color: '#ffffff',
                borderRadius: 1,
                py: 1.5,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: '0.875rem',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#d95a30',
                },
              }}
            >
              Continue
            </Button>
          </Box>
        )}
        </Box>

      {/* Right Side - Video Preview Container */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ml: 3,
        }}
      >
        <Box
          data-video-preview="true"
          sx={{
            width: videoAspectRatio 
              ? `min(750px, calc((100vh - 80px) * ${videoAspectRatio}))`
              : '750px',
            height: videoAspectRatio
              ? `min(calc(100vh - 80px), calc(750px / ${videoAspectRatio}))`
              : 'calc(100vh - 80px)',
            maxWidth: '750px',
            maxHeight: 'calc(100vh - 80px)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
        {videoPreviewUrl ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <video
              ref={videoRef}
              src={videoPreviewUrl}
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '12px',
              }}
            />
              
            {/* Caption Preview Overlay */}
            {selectedSubtitleStyle && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  px: 3,
                  py: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    color: '#ffffff',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  MULTIPLE LINES PER PAGE
                </Typography>
              </Box>
            )}

            {/* Demo Badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                px: 1.5,
                py: 0.5,
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#ffffff',
                }}
              >
                Demo
              </Typography>
            </Box>

            {/* Video Controls Overlay */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1.5,
              }}
            >
              {/* Play/Pause Button */}
        <IconButton
                onClick={() => {
                  const video = videoRef.current;
                  if (video) {
                    if (video.paused) {
                      video.play();
                    } else {
                      video.pause();
                    }
                  }
                }}
          sx={{
            color: '#ffffff',
                  '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {isPlaying ? (
                  <PauseIcon sx={{ fontSize: '1.5rem' }} />
                ) : (
                  <PlayArrowIcon sx={{ fontSize: '1.5rem' }} />
                )}
              </IconButton>
              
              {/* Timeline */}
              <Slider
                value={duration > 0 ? (currentTime / duration) * 100 : 0}
                onChange={(_, value) => {
                  const video = videoRef.current;
                  if (video && duration > 0) {
                    video.currentTime = ((value as number) / 100) * duration;
                  }
                }}
                sx={{
                  flex: 1,
                  color: '#f16838',
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                  },
                  '& .MuiSlider-track': {
                    height: 4,
                  },
                  '& .MuiSlider-rail': {
                    height: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              />
              
              {/* Volume Control */}
              <IconButton
                onClick={() => {
                  const video = videoRef.current;
                  if (video) {
                    video.muted = !video.muted;
                    setVolume(video.muted ? 0 : 1);
                  }
                }}
                sx={{
                  color: '#ffffff',
            '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
                {volume === 0 ? (
                  <VolumeOffIcon sx={{ fontSize: '1.25rem' }} />
                ) : (
                  <VolumeUpIcon sx={{ fontSize: '1.25rem' }} />
                )}
        </IconButton>
      </Box>
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              No video uploaded
            </Typography>
          </Box>
        )}
      </Box>
      </Box>
    </Box>
  );
};
