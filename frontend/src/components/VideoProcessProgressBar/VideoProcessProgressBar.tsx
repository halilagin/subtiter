


import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface VideoProcessProgressBarProps {
    progress?: number; // Optional progress value (0-100)
    isProcessing?: boolean; // Whether the video is currently processing
    message?: string; // Custom message to display
    showPercentage?: boolean; // Whether to show percentage text
    onFinished?: () => void;
}

const VideoProcessProgressBar: React.FC<VideoProcessProgressBarProps> = ({
    progress = 0,
    isProcessing = false,
    message = "Processing...",
    showPercentage = true,
    onFinished = () => {},
}) => {
    const [displayProgress, setDisplayProgress] = useState(progress);

    useEffect(() => {
        // Smoothly update progress
        if (displayProgress < progress) {
            const timer = setTimeout(() => {
                setDisplayProgress(prev => Math.min(prev + 2, progress));
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [displayProgress, progress]);

    useEffect(() => {
        if (progress === 100) {
            onFinished();
        }
    }, [progress, onFinished]);

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                borderRadius: '16px', // Match the card's border radius
                p: 2,
                textAlign: 'center'
            }}
        >
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <CircularProgress
                    variant="determinate"
                    value={displayProgress}
                    size={60}
                    thickness={4}
                    sx={{ color: 'primary.main' }}
                />
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {showPercentage && (
                        <Typography variant="caption" component="div" color="white" sx={{ fontWeight: 'bold' }}>
                            {`${Math.round(displayProgress)}%`}
                        </Typography>
                    )}
                </Box>
            </Box>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: '500' }}>
                {message}
            </Typography>
        </Box>
    );
};

export default VideoProcessProgressBar;