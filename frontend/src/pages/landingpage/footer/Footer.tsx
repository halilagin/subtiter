import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid
} from '@mui/material';
import ComparisonTable from './ComparisonTable';
import ComparisonInputs from './ComparisonInputs';

interface FooterProps {
  id?: string;
  selectedAlternative: string | null;
  onAlternativeSelect: (alternative: string) => void;
  bgColor?: string;
  textColor?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Footer: React.FC<FooterProps> = ({
  id = "footer",
  selectedAlternative,
  onAlternativeSelect,
  bgColor = '#f5f5f5',
  textColor = '#000000',
  maxWidth = 'lg'
}) => {
  return (
    <>
      {/* Comparison Table Section - Temporarily disabled */}
      {/* <ComparisonTable selectedAlternative={selectedAlternative} /> */}

      {/* Footer */}
    <Box id={id} sx={{ 
      bgcolor: '#000000', 
      pt: { xs: 8, md: 16 },
      pb: { xs: 6, md: 12 },
      mb: 4,
      mt: { xs: 6, md: 12 },
      borderRadius: { xs: '20px', md: '40px' },
      maxWidth: '1475px',
      mx: 'auto',
      px: { xs: 2, md: 0 }
    }}>
      <Container maxWidth={maxWidth} sx={{ px: { xs: 3, md: 4 } }}>
        <Grid container justifyContent="space-between" sx={{ textAlign: 'left' }} spacing={{ xs: 3, md: 0 }}>
          {/* Brand Name */}
          <Grid item xs={12} md={2}>
               <Typography variant="h5" sx={{
                 fontWeight: '700',
                 color: '#ffffff',
                 mb: { xs: 2, md: 3 },
                 fontSize: { xs: '1.3rem', md: '1.5rem' },
                 fontFamily: "'Inter', sans-serif"
               }}>
                 Subtiter
               </Typography>
          </Grid>

          {/* Alternatives - ComparisonInputs - Temporarily disabled */}
          {/* <ComparisonInputs
            selectedAlternative={selectedAlternative}
            onAlternativeSelect={onAlternativeSelect}
            textColor="#ffffff"
          /> */}

          {/* Sağdaki 4 sütun */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" sx={{ 
              fontWeight: '600', 
              color: '#ffffff', 
              mb: { xs: 2, md: 3 },
              fontSize: { xs: '0.9rem', md: '1rem' },
              fontFamily: "'Inter', sans-serif"
            }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
              <Typography 
                component="a" 
                href="/pricing"
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  cursor: 'pointer', 
                  textDecoration: 'none',
                  '&:hover': { color: '#ffffff' } 
                }}
              >
                Pricing
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer', '&:hover': { color: '#ffffff' } }}>
                About Us
              </Typography>
              <Typography 
                component="a" 
                href="#features"
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  cursor: 'pointer', 
                  textDecoration: 'none',
                  '&:hover': { color: '#ffffff' } 
                }}
              >
                Features
              </Typography>
             
            </Box>
          </Grid>

          {/* For Creators */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" sx={{ 
              fontWeight: '600', 
              color: '#ffffff',
              mb: { xs: 2, md: 3 },
              fontSize: { xs: '0.9rem', md: '1rem' },
              fontFamily: "'Inter', sans-serif"
            }}>
              For Creators
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
              <Typography 
                component="a" 
                href="/create-account"
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  cursor: 'pointer', 
                  textDecoration: 'none',
                  '&:hover': { color: '#ffffff' } 
                }}
              >
                Get Started
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer', '&:hover': { color: '#ffffff' } }}>
                Creator Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer', '&:hover': { color: '#ffffff' } }}>
                Support
              </Typography>
            </Box>
          </Grid>

          {/* Content Types */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" sx={{ 
              fontWeight: '600', 
              color: '#ffffff',
              mb: { xs: 2, md: 3 },
              fontSize: { xs: '0.9rem', md: '1rem' },
              fontFamily: "'Inter', sans-serif"
            }}>
              Content Types
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer', '&:hover': { color: '#ffffff' } }}>
                TikTok Shorts
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer', '&:hover': { color: '#ffffff' } }}>
                Instagram Reels
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer', '&:hover': { color: '#ffffff' } }}>
                YouTube Shorts
              </Typography>
         
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" sx={{ 
              fontWeight: '600', 
              color: '#ffffff',
              mb: { xs: 2, md: 3 },
              fontSize: { xs: '0.9rem', md: '1rem' },
              fontFamily: "'Inter', sans-serif"
            }}>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                info@subtiter.ai
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                +44 7379 727922
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              124 City Road, London, United Kingdom, EC1V 2NX
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Footer - Copyright and Policies */}
        <Box sx={{ 
          mt: { xs: 6, md: 10 }, 
          pt: { xs: 4, md: 6 }, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          flexWrap: 'wrap', 
          gap: { xs: 3, md: 2 }
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            © 2024 Peralabs. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 }, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', cursor: 'pointer', '&:hover': { color: '#ffffff' } }}>
              Privacy Policy
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', cursor: 'pointer', '&:hover': { color: '#ffffff' } }}>
              Terms of Service
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', cursor: 'pointer', '&:hover': { color: '#ffffff' } }}>
              Cookie Policy
            </Typography>
          </Box>
        </Box>
        </Container>
      </Box>
    </>
  );
};

export default Footer; 