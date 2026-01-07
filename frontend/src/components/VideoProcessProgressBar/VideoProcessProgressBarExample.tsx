import React, { useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import VideoProcessProgressBar from './VideoProcessProgressBar';

const VideoProcessProgressBarExample: React.FC = () => {
    const [progress1, setProgress1] = useState(0);
    const [progress2, setProgress2] = useState(0);
    const [isProcessing1, setIsProcessing1] = useState(false);
    const [isProcessing2, setIsProcessing2] = useState(false);

    const simulateProgress = (setter: React.Dispatch<React.SetStateAction<number>>, setProcessing: React.Dispatch<React.SetStateAction<boolean>>) => {
        setProcessing(true);
        setter(0);
        const interval = setInterval(() => {
            setter(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setProcessing(false);
                    return 100;
                }
                return prev + Math.random() * 15 + 5;
            });
        }, 500);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Video Process Progress Bar Examples
            </Typography>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Example 1: Determinate Progress
                </Typography>
                <VideoProcessProgressBar
                    progress={progress1}
                    isProcessing={isProcessing1}
                    message={isProcessing1 ? "Processing video..." : "Processing complete!"}
                />
                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        onClick={() => simulateProgress(setProgress1, setIsProcessing1)}
                        disabled={isProcessing1}
                        sx={{ mr: 2 }}
                    >
                        Start Processing
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setProgress1(0);
                            setIsProcessing1(false);
                        }}
                    >
                        Reset
                    </Button>
                </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Example 2: Indeterminate Progress (No Percentage)
                </Typography>
                <VideoProcessProgressBar
                    isProcessing={isProcessing2}
                    message="Analyzing video content..."
                    showPercentage={false}
                />
                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setIsProcessing2(!isProcessing2);
                        }}
                        sx={{ mr: 2 }}
                    >
                        {isProcessing2 ? 'Stop' : 'Start'} Processing
                    </Button>
                </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Example 3: Custom Message
                </Typography>
                <VideoProcessProgressBar
                    progress={100}
                    message="Generating video clips..."
                />
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom>
                    Example 4: Completed State
                </Typography>
                <VideoProcessProgressBar
                    progress={100}
                    message="Video processing completed successfully!"
                />
            </Box>
        </Container>
    );
};

export default VideoProcessProgressBarExample;
