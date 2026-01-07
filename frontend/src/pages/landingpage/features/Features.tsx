
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
} from '@mui/material';

const Features = () => {
  return (
    <Box sx={{ bgcolor: '#f5f5f5', py: 16 }}>
      <Container maxWidth="xl">
        {/* Feature 1: AI Viral Detection */}
        <Grid container spacing={8} alignItems="center" sx={{ mb: 24 }}>
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: '800', mb: 3, lineHeight: 1.3, color: '#000000' }}>
              Find viral moments effortlessly with <span style={{ color: '#fb923c', fontFamily: "'Inter', sans-serif" }}>AI Detection</span>
            </Typography>
            <Typography variant="h6" sx={{ color: '#000000', lineHeight: 1.6, fontWeight: '300' }}>
              Our advanced AI acts as your personal video editor, analyzing your content for emotional peaks, engaging dialogue, and viral-worthy moments. It automatically pinpoints the best segments, saving you hours of manual searching.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: '#000000', borderRadius: 4, p: 0, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '16px'
                }}
              >
                <source src="https://peralabs.co.uk/assets/klippers/klippers_ai_examples/feature1.smaller240.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Box>
          </Grid>
        </Grid>

        {/* Feature 2: 1-Click Creation */}
        <Grid container spacing={8} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }} sx={{ mb: 24 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: '#ffffff', borderRadius: 4, p: 4, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}>
              <Typography sx={{ color: '#000000' }}>Visual 2</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: '800', mb: 3, lineHeight: 1.3, color: '#000000' }}>
              Create & export viral clips in a <span style={{ color: '#fb923c', fontFamily: "'Inter', sans-serif" }}>single click</span>
            </Typography>
            <Typography variant="h6" sx={{ color: '#000000', lineHeight: 1.6, fontWeight: '300' }}>
              Transform your long-form content into multiple, ready-to-publish viral clips with just a single click. Our system handles the complex editing, so you can focus on creating.
            </Typography>
          </Grid>
        </Grid>

        {/* Feature 3: Smart Cropping */}
        <Grid container spacing={8} alignItems="center" sx={{ mb: 24 }}>
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: '800', mb: 3, lineHeight: 1.3, color: '#000000' }}>
              Perfectly frame your shots with <span style={{ color: '#fb923c', fontFamily: "'Inter', sans-serif" }}>smart cropping</span>
            </Typography>
            <Typography variant="h6" sx={{ color: '#000000', lineHeight: 1.6, fontWeight: '300' }}>
              Our intelligent cropping and reframing technology automatically keeps the main subject in focus. It ensures your videos look professionally shot and perfectly formatted for any vertical platform.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: '#ffffff', borderRadius: 4, p: 4, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}>
              <Typography sx={{ color: '#000000' }}>Visual 3</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Feature 4: Auto Subtitles */}
        <Grid container spacing={8} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: '#ffffff', borderRadius: 4, p: 4, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}>
              <Typography sx={{ color: '#000000' }}>Visual 4</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: '800', mb: 3, lineHeight: 1.3, color: '#000000' }}>
              Engage more viewers with <span style={{ color: '#fb923c', fontFamily: "'Inter', sans-serif" }}>automatic subtitles</span>
            </Typography>
            <Typography variant="h6" sx={{ color: '#000000', lineHeight: 1.6, fontWeight: '300' }}>
              Instantly generate and sync accurate, stylish subtitles for your clips. Boost engagement and make your content accessible to a wider audience with perfectly timed captions.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Features;