import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid
} from '@mui/material';
import {
  Speed,
  AutoAwesome,
  TrendingUp,
  StarBorder,
  Star
} from '@mui/icons-material';

interface StatsSectionProps {
  id?: string;
}

const StatsSection: React.FC<StatsSectionProps> = ({ id = "stats-section" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const statsSection = document.getElementById(id);
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => {
      observer.disconnect();
    };
  }, [id]);

  return (
    <Box id={id} sx={{ bgcolor: '#f5f5f5', py: 8 }}>
      <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
        <Box sx={{ mb: 16 }}>
          <Grid container spacing={4} justifyContent="center" alignItems="stretch">
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                bgcolor: '#eea0ff',
                color: 'white',
                border: '1px solid #eea0ff',
                borderRadius: 4,
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#eea0ff'
                }
                }}>
                                    <Speed sx={{ fontSize: 48, color: '#e2f4a6', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: '700', mb: 2, color: 'white' }}>
                  3x Faster
                  </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                    From hours to minutes. Create clips at unparalleled speed.
                  </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                bgcolor: '#eea0ff',
                color: 'white',
                border: '1px solid #eea0ff',
                borderRadius: 4,
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#eea0ff'
                }
                }}>
                                    <AutoAwesome sx={{ fontSize: 48, color: '#e2f4a6', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: '700', mb: 2, color: 'white' }}>
                  Better AI
                  </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Advanced algorithms that understand what makes content viral.
                  </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                bgcolor: '#9c90fc',
                color: 'white',
                border: '1px solid #9c90fc',
                borderRadius: 4,
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#9c90fc'
                }
                }}>
                                    <TrendingUp sx={{ fontSize: 48, color: '#e2f4a6', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: '700', mb: 2, color: 'white' }}>
                    Go Viral
                  </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Optimized for maximum reach and engagement on all platforms.
                  </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                bgcolor: '#9c90fc',
                color: 'white',
                border: '1px solid #9c90fc',
                borderRadius: 4,
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#9c90fc'
                }
                }}>
                                    <Star sx={{ fontSize: 48, color: '#e2f4a6', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: '700', mb: 2, color: 'white' }}>
                    Top Rated
                  </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Trusted by creators worldwide for professional results.
                  </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default StatsSection; 