import React, { useState } from 'react';
import { Box, Typography, Button, Grid, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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

const categories = ['Trending', 'Popular', 'New', 'Classic'];

export const SubtitleLibrarySection: React.FC<SubtitleLibrarySectionProps> = ({
  onNext,
  onPrevious,
  onSubtitleSelected,
  uploadedVideo,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Trending');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  
  const itemsPerPage = 18;
  const totalPages = Math.ceil(subtitleStyles.length / itemsPerPage);
  const displayedStyles = subtitleStyles.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  React.useEffect(() => {
    if (uploadedVideo) {
      const url = URL.createObjectURL(uploadedVideo);
      setVideoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [uploadedVideo]);

  const handleSelect = (style: any) => {
    setSelectedStyle(style.id);
    onSubtitleSelected(style);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          width: { xs: 'calc(100% - 24px)', sm: 'calc(100% - 48px)' },
          maxWidth: { xs: '100%', sm: '1200px' },
          mx: { xs: 1.5, sm: 3 },
          height: { xs: '55vh', sm: '60vh' },
          maxHeight: '500px',
        }}
      >
        {/* Video Preview */}
        <Box
          sx={{
            width: '350px',
            flexShrink: 0,
            borderRadius: 1,
            border: '1px solid #e5e5e5',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#000000',
          }}
        >
          {videoPreviewUrl ? (
            <video
              src={videoPreviewUrl}
              controls
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <Typography
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
                color: '#666666',
              }}
            >
              No video uploaded
            </Typography>
          )}
        </Box>

        {/* Subtitle Selection */}
        <Box
          data-subtitle-area="true"
          sx={{
            flex: 1,
            bgcolor: 'transparent',
            borderRadius: 1,
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
      {/* Title */}
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontSize: { xs: '1.5rem', sm: '2rem' },
            fontWeight: 400,
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          Choose a subtitle
        </Typography>
      </Box>
      
      {/* Top Filter Labels */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: 'none',
          bgcolor: 'transparent',
          justifyContent: 'center',
        }}
      >
        {categories.map((category) => (
          <Box
            key={category}
            onClick={() => setSelectedCategory(category)}
            sx={{
              cursor: 'pointer',
              px: 2,
              py: 0.75,
              borderRadius: 6,
              bgcolor: selectedCategory === category ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${selectedCategory === category ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                fontWeight: selectedCategory === category ? 500 : 400,
                color: '#ffffff',
                transition: 'all 0.15s ease',
              }}
            >
              {category}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Subtitle Cards with Navigation Arrows */}
      <Box
        sx={{
          flex: 1,
          p: 1.5,
          overflow: 'hidden',
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {/* Left Arrow */}
        <IconButton
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          sx={{
            color: '#ffffff',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-disabled': {
              color: 'rgba(255, 255, 255, 0.3)',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <ArrowBackIosIcon sx={{ fontSize: '1.5rem' }} />
        </IconButton>

        {/* Grid Container */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Grid container spacing={0.75} sx={{ display: 'flex', flexWrap: 'wrap', margin: 0, flex: 1, alignContent: 'flex-start' }}>
            {displayedStyles.map((style) => (
            <Grid 
              item 
              key={style.id}
              onClick={() => handleSelect(style)}
              sx={{
                width: 'calc(16.666% - 4.16px)',
                flex: '0 0 calc(16.666% - 4.16px)',
                maxWidth: 'calc(16.666% - 4.16px)',
                minWidth: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '4 / 3',
                  border: `1px solid ${selectedStyle === style.id ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'}`,
                  borderRadius: 1.5,
                  bgcolor: '#000000',
                  mb: 0.25,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#ffffff',
                  },
                }}
              >
                {selectedStyle === style.id && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0.5,
                      right: 0.5,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#1a1a1a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 4, color: '#ffffff' }} />
                  </Box>
                )}
                <Box
                  sx={{
                    width: '40%',
                    height: '40%',
                    bgcolor: '#fafafa',
                    borderRadius: 0.5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.3rem',
                      color: '#666666',
                      textAlign: 'center',
                      lineHeight: 1,
                    }}
                  >
                    {style.preview}
                  </Typography>
                </Box>
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.4rem',
                  fontWeight: 400,
                  color: '#ffffff',
                  textAlign: 'center',
                  lineHeight: 1.1,
                }}
              >
                {style.name}
              </Typography>
            </Grid>
          ))}
        </Grid>
        {selectedStyle && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={onNext}
              sx={{
                bgcolor: '#f16838',
                color: '#ffffff',
                borderRadius: 1,
                px: 4,
                py: 1,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
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

        {/* Right Arrow */}
        <IconButton
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
          sx={{
            color: '#ffffff',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-disabled': {
              color: 'rgba(255, 255, 255, 0.3)',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: '1.5rem' }} />
        </IconButton>
      </Box>
      </Box>
      </Box>
    </Box>
  );
};
