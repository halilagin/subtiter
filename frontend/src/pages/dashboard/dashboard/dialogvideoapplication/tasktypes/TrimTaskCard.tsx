import { Typography, Card, CardContent, Box } from "@mui/material";
import MovieFilterIcon from "@mui/icons-material/MovieFilter";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import { useState } from "react";


interface TrimTaskCardProps {
    onClick: () => void;
}


const TrimTaskCard = ({ onClick }: TrimTaskCardProps) => {
    const [gifError, setGifError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [smallVideosReady, setSmallVideosReady] = useState<{ [key: number]: boolean }>({});

    return (
        <Card 
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.3s ease',
                border: 'none',
                borderRadius: 4,
                boxShadow: 'none',
                bgcolor: '#f5f5f5',
                position: 'relative',
                '&:hover': {
                    bgcolor: '#f5f5f5',
                }
            }}
        >
            <CardContent sx={{ p: 2, px: 3, textAlign: 'center', position: 'relative' }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        position: 'relative',
                        width: '100%',
                        maxWidth: '280px',
                        height: '135px',
                        overflow: 'visible',
                    }}
                >
                    {!gifError ? (
                        <Box
                            component="img"
                            src="/trim-video-preview.gif"
                            alt="Trim Video Preview"
                            onError={() => setGifError(true)}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                borderRadius: 2,
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.75,
                                overflow: 'visible',
                            }}
                        >
                            {/* Main Black Box with Yellow Border */}
                            <Box
                                sx={{
                                    position: 'relative',
                                    bgcolor: '#000000',
                                    borderTop: '4px solid rgb(255, 239, 95)',
                                    borderBottom: '4px solid rgb(255, 239, 95)',
                                    borderLeft: '8px solid rgb(255, 239, 95)',
                                    borderRight: '8px solid rgb(255, 239, 95)',
                                    borderRadius: 3,
                                    padding: '8px',
                                    display: 'flex',
                                    gap: '3px',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    animation: 'trimVideo 3s ease-in-out infinite',
                                    '@keyframes trimVideo': {
                                        '0%': {
                                            width: '240px',
                                        },
                                        '40%': {
                                            width: '240px',
                                        },
                                        '70%': {
                                            width: '120px',
                                        },
                                        '85%': {
                                            width: '120px',
                                        },
                                        '100%': {
                                            width: '240px',
                                        },
                                    },
                                }}
                            >
                                {/* Left Arrow */}
                                <ChevronLeftIcon
                                    sx={{
                                        position: 'absolute',
                                        left: '2px',
                                        color: '#ffffff',
                                        fontSize: '20px',
                                        zIndex: isHovered ? 1 : 10,
                                    }}
                                />
                                
                                {/* 9:16 Aspect Ratio Small Videos */}
                                {[1, 2, 3, 4, 5, 6].map((index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            width: '32px',
                                            height: '56px', // 9:16 aspect ratio
                                            borderRadius: '3px',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            boxShadow: '0 0 2px rgba(255, 255, 255, 0.1)',
                                            position: 'relative',
                                        }}
                                    >
                                        {/* Thumbnail for small videos */}
                                        {!smallVideosReady[index] && (
                                            <Box
                                                component="img"
                                                src="/landingpageshortthumbnails/landingpagefeature2thumbnail/landingpagefeature2thumbnail_128w.avif"
                                                alt="Small video thumbnail"
                                                loading="lazy"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    zIndex: 1,
                                                    opacity: smallVideosReady[index] ? 0 : 1,
                                                    transition: 'opacity 0.3s ease'
                                                }}
                                            />
                                        )}
                                        <video
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            preload="auto"
                                            onCanPlay={() => setSmallVideosReady(prev => ({ ...prev, [index]: true }))}
                                            onLoadedMetadata={() => setSmallVideosReady(prev => ({ ...prev, [index]: true }))}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block',
                                                opacity: smallVideosReady[index] ? 1 : 0,
                                                transition: 'opacity 0.3s ease',
                                                position: 'relative',
                                                zIndex: 2
                                            }}
                                        >
                                            <source src="https://cdn.midjourney.com/video/f96bcd37-1a0e-42ba-b91e-096d4e7024e1/2.mp4" type="video/mp4" />
                                        </video>
                                    </Box>
                                ))}
                                
                                {/* Right Arrow */}
                                <ChevronRightIcon
                                    sx={{
                                        position: 'absolute',
                                        right: '2px',
                                        color: '#ffffff',
                                        fontSize: '20px',
                                        zIndex: isHovered ? 1 : 10,
                                    }}
                                />
                            </Box>
                            
                            {/* Trim Bar - Synced with Video */}
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: '180px',
                                    height: '4px',
                                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                                    borderRadius: 2,
                                    overflow: 'visible',
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        height: '100%',
                                        width: '180px',
                                        bgcolor: '#000000',
                                        borderRadius: 2,
                                        animation: 'trimBar 3s ease-in-out infinite',
                                        overflow: 'visible',
                                        cursor: 'default',
                                        '@keyframes trimBar': {
                                            '0%': {
                                                width: '180px',
                                            },
                                            '20%': {
                                                width: '180px',
                                            },
                                            '40%': {
                                                width: '90px',
                                            },
                                            '60%': {
                                                width: '90px',
                                            },
                                            '80%': {
                                                width: '180px',
                                            },
                                            '100%': {
                                                width: '180px',
                                            },
                                        },
                                    }}
                                >
                                    {/* Drag Handle Circle */}
                                    <Box
                                        onClick={(e) => e.stopPropagation()}
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: 0,
                                            transform: 'translate(50%, -50%)',
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            bgcolor: '#000000',
                                            cursor: 'pointer',
                                            pointerEvents: 'auto',
                                            zIndex: isHovered ? 1 : 100,
                                        }}
                                    />
                                    {/* Cursor Icon */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '60%',
                                            right: '-2px',
                                            transform: 'translate(50%, -30%)',
                                            pointerEvents: 'none',
                                            zIndex: isHovered ? 1 : 101,
                                        }}
                                    >
                                        <TouchAppIcon 
                                            sx={{ 
                                                fontSize: '20px', 
                                                color: '#ffeb3b',
                                            }} 
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25, fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}>
                    Trim Video
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontFamily: 'Inter, sans-serif' }}>
                    Cut and trim your video to the perfect length
                </Typography>
            </CardContent>
        </Card>
    );
};

export default TrimTaskCard;