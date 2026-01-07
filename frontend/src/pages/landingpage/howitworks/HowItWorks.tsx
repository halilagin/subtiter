import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid
} from '@mui/material';

interface StepItem {
  title: string;
  description: string;
  imagePlaceholder?: React.ReactNode;
}

interface HowItWorksSectionProps {
  id?: string;
  title?: string;
  steps?: StepItem[];
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const defaultSteps: StepItem[] = [
  {
    title: 'Start by uploading a video',
    description: 'Simply paste a link to your YouTube video, or upload a video file. Our rule of thumb: a one-minute long video produces about 5 video clips.'
  },
  {
    title: 'Let Klippers\' AI magically create vertical videos',
    description: 'Just sit back and relax, while Klippers does all the work for you. In a matter of minutes, we will give you multiple viral-worthy clips.'
  },
  {
    title: 'Post your videos and grow your followers',
    description: 'After you make any final touches, you\'re all set to export them in high-resolution and share them on your other social channels.'
  }
];

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ 
  id = "how-it-works",
  title = "How Klippers works?",
  steps = defaultSteps,
  bgColor = '#f5f5f5',
  textColor = '#000000',
  accentColor = '#132436',
  maxWidth = 'xl'
}) => {
  return (
    <Box id={id} sx={{ bgcolor: bgColor, py: 16 }}>
      <Container maxWidth={maxWidth}>
        <Box sx={{ textAlign: 'center', mb: 12 }}>
          <Typography variant="h2" sx={{ fontWeight: '800', mb: 4, color: textColor }}>
            {title}
          </Typography>
          <Typography variant="h6" sx={{ color: textColor, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>
            Follow these simple steps to create viral content in minutes
          </Typography>
        </Box>
        <Grid container spacing={6} alignItems="flex-start">
          {steps.map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box sx={{ textAlign: 'left' }}>
                <Box sx={{ 
                  height: 250, 
                  bgcolor: '#ffffff',
                  borderRadius: 4, 
                  mb: 4, 
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000000',
                  fontSize: '1.1rem',
                  fontWeight: '500'
                }}>
                  {step.imagePlaceholder || `Step ${index + 1} Visual`}
                </Box>
                <Typography variant="body1" sx={{ color: '#000000', lineHeight: 1.7, fontSize: '1.1rem' }}>
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HowItWorksSection; 