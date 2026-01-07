import { Box } from "@mui/material";    
import { useState, useEffect } from "react";
import ShortExampleVideoUrls from "./ShortExampleVideoUrls";

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

type ViemoVideoPlayerProps = {
    url: string;
  }

const ViemoVideoPlayer = ({url}: ViemoVideoPlayerProps)  => {
    const autoplayUrl = url.includes('autoplay=') ? url : `${url}&autoplay=1`;
    return (
      <>
      <iframe 
      src={autoplayUrl} 
      width="200" 
      height="356" 
      frameBorder="0" 
      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
      referrerPolicy="strict-origin-when-cross-origin" 
      title="subtiter1"
    />
    </>
    )
}



type ShortExampleVideoProps = {
  url: string;
  thumbnail?: string;
}

export const ShortExampleVideo = ({ url, thumbnail }: ShortExampleVideoProps) => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  const handleVideoCanPlay = () => {
    // Video oynatılmaya hazır olduğunda thumbnail'i gizle
    setIsVideoReady(true);
  };
  
  return (
    <>
         <Box sx={{ 
              width: '200px',
              height: '356px',
              borderRadius: 8,
              overflow: 'hidden',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              flexShrink: 0,
              position: 'relative',
              backdropFilter: 'blur(15px)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                transform: 'scale(1.02)',
              }
            }}>
              {/* Thumbnail - always shown until video is ready to play */}
              {thumbnail && (
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

              
        </Box>
    </>
  );
};


export const ShortExampleVideoList = () => {
  // Videoları iki kez tekrarlayarak sonsuz döngü efekti yaratıyoruz
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
    <>
    <Box sx={{ 
          width: '100%', 
          mt: 0,
          animation: 'fadeInUp 1s ease-out 0.8s both',
          overflow: 'hidden',
          position: 'relative',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            width: '150px',
            height: '100%',
            zIndex: 2,
            pointerEvents: 'none',
          },
          '&::before': {
            left: 0,
            background: 'linear-gradient(to right, rgba(248, 249, 250, 1), rgba(248, 249, 250, 0))',
          },
          '&::after': {
            right: 0,
            background: 'linear-gradient(to left, rgba(248, 249, 250, 1), rgba(248, 249, 250, 0))',
          }
        }}>
        
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          animation: 'slideLeft 30s linear infinite',
          width: 'fit-content',
          '@keyframes slideLeft': {
            '0%': {
              transform: 'translateX(0)',
            },
            '100%': {
              transform: `translateX(-${(200 + 16) * ShortExampleVideoUrls.length}px)`, // 200px width + 16px gap
            },
          },
        }}>
            
            {duplicatedVideos.map((url, idx) => {
                const originalIndex = idx % ShortExampleVideoUrls.length;
                const thumbnail = thumbnailPaths[originalIndex];
                
                return url.includes('player.vimeo.com') ? (    
                    <ViemoVideoPlayer key={"viemo-video-player-"+idx} url={url} />
                ) : (
                    <ShortExampleVideo 
                      key={"short-example-video-"+idx} 
                      url={url} 
                      thumbnail={thumbnail}
                    />
                );
            })}
        </Box>
    </Box>
    </>
  );
};

export default ShortExampleVideoList;