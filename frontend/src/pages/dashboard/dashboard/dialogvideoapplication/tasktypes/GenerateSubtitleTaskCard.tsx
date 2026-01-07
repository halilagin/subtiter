import { Typography, Card, CardContent, Box } from "@mui/material";
import SubtitlesIcon from "@mui/icons-material/Subtitles";
import { useState, useEffect } from "react";
import { ShortSubtitleStyleBeast } from "../dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBeast";
import { ShortSubtitleStyleClassic } from "../dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleClassic";
import { ShortSubtitleStyleBobby } from "../dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBobby";
import { ShortSubtitleStyleBasker } from "../dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBasker";


interface GenerateSubtitleTaskCardProps {
    onClick: () => void;
}

const subtitleStyles = [
    { label: "Beast", icon: <ShortSubtitleStyleBeast capitalizationStyle="uppercase" selected={() => {}} id="beast" /> },
    { label: "Classic", icon: <ShortSubtitleStyleClassic capitalizationStyle="lowercase" selected={() => {}} id="classic" /> },
    { label: "Bobby", icon: <ShortSubtitleStyleBobby capitalizationStyle="uppercase" selected={() => {}} id="bobby" /> },
    { label: "Basker", icon: <ShortSubtitleStyleBasker capitalizationStyle="title" selected={() => {}} id="basker" /> }
];

const GenerateSubtitleTaskCard = ({ onClick }: GenerateSubtitleTaskCardProps) => {
    const [gifError, setGifError] = useState(false);
    const [autoHoverIndex, setAutoHoverIndex] = useState(0);

    // Auto hover effect - cycles through each subtitle
    useEffect(() => {
        const interval = setInterval(() => {
            setAutoHoverIndex((prev) => (prev + 1) % subtitleStyles.length);
        }, 2000); // Change every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <Card 
            onClick={onClick}
            sx={{
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.3s ease',
                border: 'none',
                borderRadius: 4,
                boxShadow: 'none',
                bgcolor: '#f5f5f5',
                '&:hover': {
                    bgcolor: '#f5f5f5',
                }
            }}
        >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        position: 'relative',
                        width: '100%',
                        maxWidth: '240px',
                        height: '135px',
                        overflow: 'hidden',
                        borderRadius: 2,
                        bgcolor: '#000',
                    }}
                >
                    {!gifError ? (
                        <Box
                            component="img"
                            src="/generate-subtitles-preview.gif"
                            alt="Generate Subtitles Preview"
                            onError={() => setGifError(true)}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
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
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {/* Video Container */}
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                }}
                            >
                                <source src="https://peralabs.co.uk/assets/klippers/landingpagevideo1.smaller240.mp4" type="video/mp4" />
                            </video>
                            
                            {/* Subtitle Overlay */}
                            {autoHoverIndex >= 0 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: '12px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        zIndex: 10,
                                        maxWidth: '85%',
                                        textAlign: 'center',
                                    }}
                                >
                                    {subtitleStyles[autoHoverIndex].icon}
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25, fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}>
                    Generate Subtitles
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontFamily: 'Inter, sans-serif' }}>
                    Add accurate subtitles and captions to your video
                </Typography>
            </CardContent>
        </Card>
    );
};

export default GenerateSubtitleTaskCard;