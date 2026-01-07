import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import { 
  VideoLibrary, 
  School, 
  Business, 
  Campaign
} from '@mui/icons-material';

const UseCases = () => {
  const useCases = [
    {
      icon: <VideoLibrary sx={{ fontSize: 32, color: '#000000' }} />,
      title: "Content Creators",
      description: "Transform your long-form content into engaging short clips for TikTok, Instagram Reels, and YouTube Shorts. Automatically identify your most viral moments."
    },
    {
      icon: <Business sx={{ fontSize: 32, color: '#000000' }} />,
      title: "Marketing Teams",
      description: "Create compelling marketing content from webinars, product demos, and company events. Scale your content production without increasing resources."
    },
    {
      icon: <School sx={{ fontSize: 32, color: '#000000' }} />,
      title: "Educational Content",
      description: "Convert lectures, tutorials, and educational videos into bite-sized learning content. Perfect for online courses and educational platforms."
    }
  ];

  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5', 
      py: 12,
      minHeight: '80vh'
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography variant="h2" sx={{ 
            fontWeight: '700', 
            mb: 4, 
            color: '#000000',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            lineHeight: 1.2,
            fontFamily: "'Kelson Sans', 'Inter', sans-serif"
          }}>
            Perfect for Every Use Case
          </Typography>
          <Typography variant="h6" sx={{ 
            color: '#6b7280', 
            maxWidth: '600px', 
            mx: 'auto',
            fontWeight: '300',
            fontSize: '1.1rem',
            lineHeight: 1.6
          }}>
            From content creators to marketing teams, Subtiter adapts to your workflow and amplifies your impact.
          </Typography>
        </Box>

        {/* Use Cases Grid - 3 Cards Centered */}
        <Grid container spacing={4} justifyContent="center" maxWidth="1020px" mx="auto">
          {useCases.map((useCase, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box sx={{
                bgcolor: '#1a1a1a',
                borderRadius: 4,
                p: 6,
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
                }
              }}>
                {/* Icon */}
                <Box sx={{ mb: 3 }}>
                  {React.cloneElement(useCase.icon, { sx: { fontSize: 32, color: '#ffffff' } })}
                </Box>

                {/* Title */}
                <Typography variant="h5" sx={{
                  fontWeight: '600',
                  color: '#ffffff',
                  mb: 3,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '1.25rem'
                }}>
                  {useCase.title}
                </Typography>

                {/* Description */}
                <Typography variant="body1" sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: 1.6,
                  fontSize: '0.95rem',
                  flex: 1
                }}>
                  {useCase.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default UseCases;
