import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Avatar, Rating, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight, FormatQuote } from '@mui/icons-material';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const testimonials = [
    {
      id: 1,
      name: "Denis Slavska",
      role: "CTO, Ailitic",
      company: "Ailitic",
      location: "New York City, New York",
      avatar: "DS",
      text: "They tailor their solutions to our specific needs and goals.",
      companyLogo: "A"
    },
    {
      id: 2,
      name: "Jahan Melad",
      role: "Project Manager, Buildwave",
      company: "BUILDWAVE",
      location: "New York City, New York",
      avatar: "JM",
      text: "They organized their work and internal management was outstanding.",
      companyLogo: "B"
    },
    {
      id: 3,
      name: "Jim Halpert",
      role: "Lead Engineer, InHive Space",
      company: "InHive",
      location: "New York City, New York",
      avatar: "JH",
      text: "Working with them was a great experience.",
      companyLogo: "I"
    },
    {
      id: 4,
      name: "Sarah Mitchell",
      role: "Marketing Director, TechFlow",
      company: "TechFlow",
      location: "San Francisco, California",
      avatar: "SM",
      text: "Their innovative approach exceeded our expectations completely.",
      companyLogo: "T"
    },
    {
      id: 5,
      name: "Michael Roberts",
      role: "Founder, StartupLab",
      company: "StartupLab", 
      location: "Austin, Texas",
      avatar: "MR",
      text: "The results speak for themselves. Highly recommended.",
      companyLogo: "S"
    },
    {
      id: 6,
      name: "Emily Davis",
      role: "Product Manager, InnovateCorp",
      company: "InnovateCorp",
      location: "Seattle, Washington",
      avatar: "ED",
      text: "Professional service with outstanding attention to detail.",
      companyLogo: "I"
    }
  ];

  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5', 
      py: 10,
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 8 }}>
          <Box>
        
            
            <Typography variant="h1" sx={{ 
              fontWeight: '700', 
              color: '#000000',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1.2,
              fontFamily: "'Kelson Sans', 'Inter', sans-serif",
              mb: 0
            }}>
              What Our{' '}
              Clients
              {' '}Say
            </Typography>
          </Box>

          {/* Navigation Arrows */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              sx={{
                bgcolor: '#000000',
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': {
                  bgcolor: '#1a1a1a'
                },
                '&:disabled': {
                  bgcolor: '#e5e7eb',
                  color: '#9ca3af'
                }
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton 
              onClick={() => setCurrentIndex(Math.min(testimonials.length - 3, currentIndex + 1))}
              disabled={currentIndex >= testimonials.length - 3}
              sx={{
                bgcolor: '#000000',
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': {
                  bgcolor: '#1a1a1a'
                },
                '&:disabled': {
                  bgcolor: '#e5e7eb',
                  color: '#9ca3af'
                }
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>

        {/* Testimonials Grid */}
        <Grid container spacing={2}>
          {testimonials.slice(currentIndex, currentIndex + 3).map((testimonial) => (
            <Grid item xs={12} md={4} key={testimonial.id}>
              <Box sx={{
                bgcolor: 'white',
                p: 4,
                borderRadius: 3,
                height: '300px',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #e5e7eb',
                position: 'relative'
              }}>
                {/* Quote Icon */}
                <Box sx={{ mb: 3 }}>
                  <FormatQuote sx={{ 
                    fontSize: 32, 
                    color: '#8b5cf6',
                    transform: 'rotate(180deg)'
                  }} />
                </Box>

                {/* Testimonial Text */}
                <Typography variant="h6" sx={{
                  color: '#000000',
                  lineHeight: 1.4,
                  mb: 4,
                  flex: 1,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '1.1rem',
                  fontWeight: '500'
                }}>
                  {testimonial.text}
                </Typography>

                {/* Author Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                  <Avatar sx={{
                    bgcolor: '#000000',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    width: 48,
                    height: 48
                  }}>
                    {testimonial.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{
                      fontWeight: '600',
                      color: '#000000',
                      fontSize: '0.95rem',
                      fontFamily: "'Inter', sans-serif",
                      mb: 0.5
                    }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#6b7280',
                      fontSize: '0.8rem',
                      fontFamily: "'Inter', sans-serif",
                      lineHeight: 1.3
                    }}>
                      {testimonial.role}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#9ca3af',
                      fontSize: '0.75rem',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {testimonial.location}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Testimonials;
