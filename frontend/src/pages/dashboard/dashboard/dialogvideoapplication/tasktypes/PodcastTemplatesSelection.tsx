import React from 'react';
import { Box, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface PodcastTemplatesSelectionProps {
  // Add props if needed
}

const PodcastTemplatesSelection: React.FC<PodcastTemplatesSelectionProps> = () => {
  const rows = [
    { id: 1, title: 'Default', beforeVideo: '', afterImages: ['', ''] },
    { id: 2, title: 'Meet', beforeVideo: '', afterImages: ['', ''] },
    { id: 3, title: 'Focus', beforeVideo: '', afterImages: ['', ''] },
    { id: 4, title: 'Panel', beforeVideo: '', afterImages: ['', ''] },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {rows.map((row) => (
        <Box
          key={row.id}
          sx={{
            bgcolor: '#f5f5f5',
            borderRadius: 2,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1rem',
              fontFamily: 'Inter, sans-serif',
              mb: 0,
            }}
          >
            {row.title}
          </Typography>

          {/* Before and After Boxes */}
          <Box
            sx={{
              display: 'flex',
              gap: 4,
              alignItems: 'center',
              justifyContent: 'center',
              mt: -0.5,
            }}
          >
          {/* Before Box - 16:9 Aspect Ratio */}
          <Box
            sx={{
              position: 'relative',
              aspectRatio: '16 / 9',
              width: '200px',
              bgcolor: '#000000',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              component="video"
              src="https://peralabs.co.uk/assets/klippers/podcasttaskvideo.mp4"
              autoPlay
              loop
              muted
              playsInline
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>

          {/* Arrow Icon */}
          <ChevronRightIcon
            sx={{
              fontSize: 32,
              color: 'text.primary',
            }}
          />

          {/* After Box - 9:16 Aspect Ratio */}
          {row.id <= 2 ? (
            // First two rows: Single video
            <Box
              sx={{
                aspectRatio: '9 / 16',
                width: '120px',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: '#000000',
              }}
            >
              <Box
                component="video"
                src={`/podcastemp${row.id}.mp4`}
                autoPlay
                loop
                muted
                playsInline
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          ) : row.id === 3 ? (
            // Meet row: Split with videos
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                aspectRatio: '9 / 16',
                width: '120px',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Top Video */}
              <Box
                sx={{
                  flex: 1,
                  bgcolor: '#000000',
                  overflow: 'hidden',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}
              >
                <Box
                  component="video"
                  src="/podcastwoman.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>

              {/* Bottom Video */}
              <Box
                sx={{
                  flex: 1,
                  bgcolor: '#000000',
                  overflow: 'hidden',
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  component="video"
                  src="/podcast.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            </Box>
          ) : row.id === 4 ? (
            // Panel row: Split with videos
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                aspectRatio: '9 / 16',
                width: '120px',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Top Video */}
              <Box
                sx={{
                  flex: 1,
                  bgcolor: '#000000',
                  overflow: 'hidden',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}
              >
                <Box
                  component="video"
                  src="/podcastwoman.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>

              {/* Bottom Video */}
              <Box
                sx={{
                  flex: 1,
                  bgcolor: '#000000',
                  overflow: 'hidden',
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                }}
              >
                <Box
                  component="video"
                  src="/soap.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Box>
          ) : (
            // Other rows: Split vertically
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                aspectRatio: '9 / 16',
                width: '120px',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Top Image */}
              <Box
                sx={{
                  flex: 1,
                  bgcolor: '#000000',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: '#ffffff',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.75rem',
                  }}
                >
                  After Top
                </Typography>
              </Box>

              {/* Bottom Image */}
              <Box
                sx={{
                  flex: 1,
                  bgcolor: '#000000',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: '#ffffff',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.75rem',
                  }}
                >
                  After Bottom
                </Typography>
              </Box>
            </Box>
          )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default PodcastTemplatesSelection;

