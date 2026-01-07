import { Typography, Card, CardContent, Box } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import { useState } from "react";


interface GenerateVLogTaskCardProps {
    onClick: () => void;
}


const GenerateVLogTaskCard = ({ onClick }: GenerateVLogTaskCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Card 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
                cursor: 'not-allowed',
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
            <CardContent sx={{ p: 2, textAlign: 'center', position: 'relative' }}>
                {isHovered && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            zIndex: 1000,
                            padding: 3,
                        }}
                    >
                        <SentimentDissatisfiedIcon sx={{ color: '#000000', fontSize: 32 }} />
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: '#000000',
                                fontWeight: 600,
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '0.875rem',
                                textAlign: 'center',
                                lineHeight: 1.2,
                            }}
                        >
                            Sorry, we are working on it
                        </Typography>
                    </Box>
                )}
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
                    }}
                >
                    <VideocamIcon sx={{ fontSize: 32, color: 'text.primary' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25, fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}>
                    Generate Vlogs
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontFamily: 'Inter, sans-serif' }}>
                    Transform your content into a vlog format
                </Typography>
            </CardContent>
        </Card>
    );
};

export default GenerateVLogTaskCard;