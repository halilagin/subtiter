import {
    Box,
  } from '@mui/material';
import { useState, useEffect } from 'react';

import HeroCenter from '@/pages/landingpage/hero/HeroCenter';
import ShortExampleVideoUrls from './ShortExampleVideoUrls';

// Thumbnail paths
const thumbnailPaths = [
  '/landingpageshortthumbnails/landingpageshort1thumbnail/landingpageshort1thumbnail_128w.avif',
  '/landingpageshortthumbnails/landingpageshort2thumbnail/landingpageshort2thumbnail_128w.avif',
  '/landingpageshortthumbnails/landingpageshort3thumbnail/landingpageshort3thumbnail_128w.avif',
  '/landingpageshortthumbnails/landingpageshort4thumbnail/landingpageshort4thumbnail_128w.avif',
  '/landingpageshortthumbnails/landingpageshort5thumbnail/landingpageshort5thumbnail_128w.avif',
  '/landingpageshortthumbnails/landingpageshort6thumbnail/landingpageshort6thumbnail_128w.avif',
  '/landingpageshortthumbnails/landingpageshort7thumbnail/landingpageshort7thumbnail_128w.avif',
];

const VerticalShortExampleVideo = ({ url, thumbnail }: { url: string; thumbnail?: string }) => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  const handleVideoCanPlay = () => {
    setIsVideoReady(true);
  };
  return (
    <Box sx={{ 
      width: { xs: '160px', md: '200px' },
      height: { xs: '280px', md: '356px' },
      borderRadius: 8,
      overflow: 'hidden',
      bgcolor: 'rgba(255, 255, 255, 0.9)',
      flexShrink: 0,
      position: 'relative',
      backdropFilter: 'blur(15px)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      mb: { xs: 4, md: 2 },
      '&:hover': {
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e5e7eb',
        transform: 'scale(1.02)',
      }
    }}>
      {/* Thumbnail - shown until video loads */}
      {thumbnail && !url.includes('player.vimeo.com') && (
        <Box
          component="img"
          src={thumbnail}
          alt="Video thumbnail"
          loading="eager"
          fetchPriority="high"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            transform: 'scale(1.1)',
            zIndex: 1,
            opacity: isVideoReady ? 0 : 1,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none'
          }}
        />
      )}
      
      {url.includes('player.vimeo.com') ? (
        <iframe 
          src={url.includes('autoplay=') ? url : `${url}&autoplay=1`} 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
          referrerPolicy="strict-origin-when-cross-origin" 
          title="klippers1"
        />
      ) : (
        <video
          src={url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={handleVideoCanPlay}
          onLoadedMetadata={handleVideoCanPlay}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            transform: 'scale(1.1)',
            opacity: isVideoReady ? 1 : 0,
            transition: 'opacity 0.3s ease',
            position: 'relative',
            zIndex: 2
          }}
        />
      )}
    </Box>
  );
};

const VerticalShortExampleVideoList = ({ direction = 'up' }: { direction?: 'up' | 'down' }) => {
  const duplicatedVideos = [...ShortExampleVideoUrls, ...ShortExampleVideoUrls];
  
  // Preload first few thumbnails for faster loading
  useEffect(() => {
    thumbnailPaths.slice(0, 4).forEach((path) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = path;
      document.head.appendChild(link);
    });
  }, []);
  
  return (
    <Box sx={{ 
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: { xs: 'row', md: 'column' },
      '&::before, &::after': {
        content: '""',
        position: 'absolute',
        left: 0,
        width: '100%',
        height: '150px',
        zIndex: 2,
        pointerEvents: 'none',
        display: { xs: 'none', md: 'block' }
      },
      '&::before': {
        top: 0,
        background: 'linear-gradient(to bottom, rgba(245, 245, 245, 1), rgba(245, 245, 245, 0))',
      },
      '&::after': {
        bottom: 0,
        background: 'linear-gradient(to top, rgba(245, 245, 245, 1), rgba(245, 245, 245, 0))',
      }
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'row', md: 'column' },
        animation: direction === 'up' 
          ? { xs: 'slideLeft 30s linear infinite', md: 'slideUp 40s linear infinite' }
          : { xs: 'slideRight 30s linear infinite', md: 'slideDown 40s linear infinite' },
        '@keyframes slideUp': {
          '0%': {
            transform: 'translateY(0)',
          },
          '100%': {
            transform: `translateY(-${(356 + 16) * ShortExampleVideoUrls.length}px)`,
          },
        },
        '@keyframes slideDown': {
          '0%': {
            transform: `translateY(-${(356 + 16) * ShortExampleVideoUrls.length}px)`,
          },
          '100%': {
            transform: 'translateY(0)',
          },
        },
        '@keyframes slideLeft': {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: `translateX(-${(160 + 32) * ShortExampleVideoUrls.length}px)`,
          },
        },
        '@keyframes slideRight': {
          '0%': {
            transform: `translateX(-${(160 + 32) * ShortExampleVideoUrls.length}px)`,
          },
          '100%': {
            transform: 'translateX(0)',
          },
        },
      }}>
        {duplicatedVideos.map((url, idx) => {
          const originalIndex = idx % ShortExampleVideoUrls.length;
          const thumbnail = thumbnailPaths[originalIndex];
          return (
            <VerticalShortExampleVideo 
              key={"vertical-short-" + idx} 
              url={url} 
              thumbnail={thumbnail}
            />
          );
        })}
      </Box>
    </Box>
  );
};

const LandingPageHero = () => {
  return (
    <Box sx={{ bgcolor: '#f5f5f5', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ 
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '100vh',
        py: { xs: 4, md: 12 },
        gap: { xs: 2, md: 4 }
      }}>
        {/* Left Video Column */}
        <Box sx={{ 
          width: { xs: '100%', md: '250px' },
          height: { xs: '200px', md: '100vh' },
          flexShrink: 0,
          display: { xs: 'none', md: 'flex' },
          justifyContent: 'center',
          alignItems: 'center',
          pl: { xs: 0, md: 4 }
        }}>
          <VerticalShortExampleVideoList direction="up" />
        </Box>

        {/* Center Hero Content */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 2, md: 4 },
          order: { xs: 1, md: 0 }
        }}>
          <HeroCenter />
        </Box>

        {/* Right Video Column */}
        <Box sx={{ 
          width: { xs: '100%', md: '250px' },
          height: { xs: '280px', md: '100vh' },
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pr: { xs: 0, md: 4 },
          order: { xs: 2, md: 0 },
          mt: { xs: -6, md: 0 }
        }}>
          <VerticalShortExampleVideoList direction="down" />
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPageHero;

