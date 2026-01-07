import { Bolt, InsertLink } from '@mui/icons-material';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    keyframes,
    AppBar,
    Toolbar,
    TextField
  } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPageVideoInput = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [videoLink, setVideoLink] = useState('');
  const navigate = useNavigate();

  const handleGenerateClick = () => {
    navigate('/create-account');
  };

  useEffect(() => {
    const handleScroll = () => {
      // Mobil cihazlarda sticky olmasın (768px altı)
      if (window.innerWidth < 768) {
        setIsSticky(false);
        return;
      }

      const scrollPosition = window.scrollY;
      // GetStarted section'ını bul - sadece bu section'a kadar sticky olsun
      const getStartedSection = document.getElementById('get-started-section');
      
      if (getStartedSection) {
        const rect = getStartedSection.getBoundingClientRect();
        const sectionTop = window.pageYOffset + rect.top;
        
        // GetStarted section'ına ulaşıldığında veya geçildiğinde sticky input bar gizlensin
        if (scrollPosition >= sectionTop - 200) {
          setIsSticky(false);
          return;
        }
      }
      
      // 300px scroll'dan sonra sticky ol (GetStarted section'ından önce)
      if (scrollPosition > 300) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll); // Ekran boyutu değiştiğinde de kontrol et
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <>
    {/* Input Bar */}
    <Box sx={{ 
            maxWidth: '500px', 
            mx: 'auto', 
            animation: 'fadeInUp 1s ease-out 0.6s both',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1))',
            borderRadius: 24,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: isSticky ? 'fixed' : 'static',
            bottom: isSticky ? 20 : 'auto',
            left: isSticky ? '50%' : 'auto',
            transform: isSticky ? 'translateX(-50%)' : 'none',
            zIndex: isSticky ? 10000 : 'auto',
            '&:hover': {
              border: '1px solid rgba(255, 255, 255, 0.4)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.15))',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            }
          }}>
            <InsertLink sx={{ fontSize: 18, color: '#000000', ml: 1 }} />
            <TextField
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              placeholder="Drop a video link"
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: {
                  color: '#000000',
                  fontFamily: "'Kelson', 'Inter', sans-serif",
                  fontWeight: 300,
                  fontSize: '1rem',
                  '&::placeholder': {
                    color: '#000000',
                    opacity: 0.8
                  }
                }
              }}
              sx={{
                flex: 1,
                '& .MuiInputBase-root': {
                  padding: 0
                }
              }}
            />
            <Button 
              variant="contained" 
              startIcon={<Bolt sx={{ fontSize: 10, color: '#dafe52' }} />}
              onClick={handleGenerateClick}
              className="button-hover-effect"
              sx={{ 
                borderRadius: 12,
                px: 3,
                py: 1,
                bgcolor: '#000000',
                color: 'white',
                fontWeight: '700',
                fontSize: '0.9rem',
                fontFamily: "'Inter', sans-serif",
                textTransform: 'none',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#000000',
                  boxShadow: 'none',
                },
                '&:focus': {
                  bgcolor: '#000000',
                  outline: 'none !important',
                  boxShadow: 'none !important',
                },
                '&:focus-visible': {
                  outline: 'none !important',
                  boxShadow: 'none !important',
                },
                '&.Mui-focusVisible': {
                  outline: 'none !important',
                  boxShadow: 'none !important',
                },
                '&:focus-visible .MuiButton-focusVisible': {
                  outline: 'none !important',
                  boxShadow: 'none !important',
                }
              }}
            >
               Go Viral 
            </Button>
          </Box>
    </>
  );
};

export default LandingPageVideoInput;