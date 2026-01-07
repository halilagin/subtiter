import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import klippersLogoGif from '../../../public/logogif.gif';

interface KlippersAdAnimationProps {
  onComplete?: () => void;
  duration?: number; // Total duration in seconds
}

const KlippersAdAnimation: React.FC<KlippersAdAnimationProps> = ({ 
  onComplete, 
  duration = 15 
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const scenes = [
    {
      title: 'Klippers AI',
      subtitle: 'Your AI-powered video assistant',
      icon: '🎬',
      duration: 2.5,
    },
    {
      title: 'Create Shorts',
      subtitle: 'Transform long videos into engaging shorts',
      icon: '✂️',
      duration: 2.5,
    },
    {
      title: 'Smart Subtitles',
      subtitle: 'Auto-generate and style subtitles',
      icon: '📝',
      duration: 2.5,
    },
    {
      title: 'AI Detection',
      subtitle: 'Intelligent scene and object recognition',
      icon: '🤖',
      duration: 2.5,
    },
    {
      title: 'Perfect Trim',
      subtitle: 'Precise video editing made simple',
      icon: '🎯',
      duration: 2.5,
    },
    {
      title: 'Get Started',
      subtitle: 'Experience the future of video creation',
      icon: '🚀',
      duration: 2.5,
    },
  ];

  useEffect(() => {
    let sceneIndex = 0;
    const interval = setInterval(() => {
      sceneIndex++;
      if (sceneIndex < scenes.length) {
        setCurrentScene(sceneIndex);
      } else {
        setIsVisible(false);
        clearInterval(interval);
        if (onComplete) {
          setTimeout(() => onComplete(), 500);
        }
      }
    }, scenes[0].duration * 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  const currentSceneData = scenes[currentScene];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, 
            rgba(99, 102, 241, 0.3) 0%, 
            rgba(168, 85, 247, 0.3) 50%, 
            rgba(236, 72, 153, 0.3) 100%)`,
          animation: 'gradientShift 8s ease infinite',
          backgroundSize: '200% 200%',
          '@keyframes gradientShift': {
            '0%': {
              backgroundPosition: '0% 50%',
            },
            '50%': {
              backgroundPosition: '100% 50%',
            },
            '100%': {
              backgroundPosition: '0% 50%',
            },
          },
        }}
      />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: 4,
            height: 4,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.3)',
            left: `${(i * 5) % 100}%`,
            top: `${(i * 7) % 100}%`,
            animation: `float${i % 3} ${3 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
            '@keyframes float0': {
              '0%, 100%': {
                transform: 'translateY(0) translateX(0)',
                opacity: 0.3,
              },
              '50%': {
                transform: 'translateY(-30px) translateX(20px)',
                opacity: 0.6,
              },
            },
            '@keyframes float1': {
              '0%, 100%': {
                transform: 'translateY(0) translateX(0)',
                opacity: 0.2,
              },
              '50%': {
                transform: 'translateY(30px) translateX(-20px)',
                opacity: 0.5,
              },
            },
            '@keyframes float2': {
              '0%, 100%': {
                transform: 'translateY(0) translateX(0)',
                opacity: 0.4,
              },
              '50%': {
                transform: 'translateY(-20px) translateX(-15px)',
                opacity: 0.7,
              },
            },
          }}
        />
      ))}

      {/* Main Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          px: 4,
          animation: 'fadeInScale 0.8s ease-out',
          '@keyframes fadeInScale': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.9)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1)',
            },
          },
        }}
      >
        {/* Logo - First Scene Only */}
        {currentScene === 0 && (
          <Box
            sx={{
              mb: 4,
              animation: 'logoPulse 2s ease-in-out infinite',
              '@keyframes logoPulse': {
                '0%, 100%': {
                  transform: 'scale(1)',
                },
                '50%': {
                  transform: 'scale(1.05)',
                },
              },
            }}
          >
            <Box
              component="img"
              src={klippersLogoGif}
              alt="Klippers Logo"
              sx={{
                width: { xs: '120px', sm: '150px' },
                height: 'auto',
                filter: 'drop-shadow(0 4px 20px rgba(255, 255, 255, 0.3))',
              }}
            />
          </Box>
        )}

        {/* Icon */}
        {currentScene > 0 && (
          <Box
            sx={{
              fontSize: { xs: '80px', sm: '100px' },
              mb: 3,
              animation: 'iconBounce 1s ease-in-out',
              '@keyframes iconBounce': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(-20px) scale(0.8)',
                },
                '50%': {
                  transform: 'translateY(0) scale(1.1)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0) scale(1)',
                },
              },
            }}
          >
            {currentSceneData.icon}
          </Box>
        )}

        {/* Title */}
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            color: '#ffffff',
            fontFamily: "'Kelson Sans', 'Inter', sans-serif",
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
            mb: 2,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            animation: 'slideInUp 0.6s ease-out',
            '@keyframes slideInUp': {
              '0%': {
                opacity: 0,
                transform: 'translateY(30px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          {currentSceneData.title}
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
            lineHeight: 1.6,
            maxWidth: '600px',
            mx: 'auto',
            animation: 'slideInUp 0.6s ease-out 0.2s both',
            '@keyframes slideInUp': {
              '0%': {
                opacity: 0,
                transform: 'translateY(30px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          {currentSceneData.subtitle}
        </Typography>

        {/* Progress Indicator */}
        <Box
          sx={{
            mt: 6,
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          {scenes.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === currentScene 
                  ? 'rgba(255, 255, 255, 1)' 
                  : 'rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
                transform: index === currentScene ? 'scale(1.2)' : 'scale(1)',
                boxShadow: index === currentScene 
                  ? '0 0 10px rgba(255, 255, 255, 0.5)' 
                  : 'none',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Scene Transition Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: '#000000',
          opacity: 0,
          animation: 'sceneTransition 2.5s ease-in-out infinite',
          pointerEvents: 'none',
          '@keyframes sceneTransition': {
            '0%, 90%, 100%': {
              opacity: 0,
            },
            '95%': {
              opacity: 0.3,
            },
          },
        }}
      />
    </Box>
  );
};

export default KlippersAdAnimation;

