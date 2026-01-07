import React from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  faqs?: FAQItem[];
  bgColor?: string;
  textColor?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const defaultFAQs: FAQItem[] = [
  {
    question: "How does AI detect viral moments?",
    answer: "Our AI analyzes facial expressions, speech patterns, engagement cues, and audio intensity to identify the most compelling moments in your videos."
  },
  {
    question: "What video formats are supported?",
    answer: "We support MP4, MOV, AVI, and most common video formats. Upload your video and we'll handle the rest."
  },
  {
    question: "Can I customize the generated clips?",
    answer: "Yes! You can edit the AI-generated clips, adjust timing, add text overlays, and customize them to match your brand."
  },
  {
    question: "How long does processing take?",
    answer: "Processing time depends on video length. A 1-hour video typically takes 5-10 minutes to analyze and generate clips."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your subscription."
  },
  {
    question: "Is my content secure?",
    answer: "Absolutely. We use enterprise-grade encryption and your videos are automatically deleted after processing."
  }
];

const LandingPageFAQSection: React.FC<FAQSectionProps> = ({
  id = "faq-section",
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know about Subtiter",
  faqs = defaultFAQs,
  bgColor = '#f5f5f5',
  textColor = '#000000',
  maxWidth = 'xl'
}) => {
  return (
    <Box id={id} sx={{ py: 16, bgcolor: bgColor }}>
      <Container maxWidth={maxWidth}>
        <Box sx={{ textAlign: 'center', mb: 12 }}>
          <Typography variant="h2" sx={{ fontWeight: '700', mb: 4, color: textColor, fontFamily: "'Kelson Sans', 'Inter', sans-serif" }}>
            {title}
          </Typography>
          <Typography variant="h6" sx={{ color: '#000000', maxWidth: '600px', mx: 'auto', fontWeight: '300' }}>
            {subtitle}
          </Typography>
        </Box>
        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                mb: 2,
                '&:before': { display: 'none' },
                boxShadow: 'none',
                bgcolor: 'transparent',
                border: 'none',
                borderRadius: 2,
                '&.Mui-expanded': {
                  border: 'none !important',
                  boxShadow: 'none !important'
                },
                '&:focus': {
                  border: 'none !important',
                  boxShadow: 'none !important',
                  outline: 'none !important'
                },
                '&:focus-visible': {
                  border: 'none !important',
                  boxShadow: 'none !important',
                  outline: 'none !important'
                },
                '& .MuiAccordionSummary-root:focus': {
                  border: 'none !important',
                  boxShadow: 'none !important',
                  outline: 'none !important'
                },
                '& .MuiAccordionSummary-root:focus-visible': {
                  border: 'none !important',
                  boxShadow: 'none !important',
                  outline: 'none !important'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: textColor }} />}
                sx={{
                  '& .MuiAccordionSummary-content': { my: 2 },
                  '&:hover': { bgcolor: 'transparent' },
                  '&:focus': {
                    border: 'none',
                    boxShadow: 'none',
                    outline: 'none'
                  },
                  '&:focus-visible': {
                    border: 'none',
                    boxShadow: 'none',
                    outline: 'none'
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: '400', color: textColor }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ color: '#000000', lineHeight: 1.6, fontWeight: '300' }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPageFAQSection; 