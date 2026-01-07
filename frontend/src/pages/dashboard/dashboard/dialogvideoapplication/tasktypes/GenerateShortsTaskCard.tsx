import { Typography, Card, CardContent, Box } from "@mui/material";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import { useState } from "react";
import GenerateShortsAnimation from "./GenerateShortsAnimation";


interface GenerateShortsTaskCardProps {
    onClick: () => void;
}


const GenerateShortsTaskCard = ({ onClick }: GenerateShortsTaskCardProps) => {
    const [gifError, setGifError] = useState(false);

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
                    }}
                >
                    {!gifError ? (
                        <Box
                            component="img"
                            src="/generate-shorts-preview.gif"
                            alt="Generate Shorts Preview"
                            onError={() => setGifError(true)}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                borderRadius: 2,
                            }}
                        />
                    ) : (
                        <GenerateShortsAnimation />
                    )}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25, fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}>
                    Generate Shorts
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontFamily: 'Inter, sans-serif' }}>
                    Create engaging short-form videos from your content
                </Typography>
            </CardContent>
        </Card>
    );
};

export default GenerateShortsTaskCard;