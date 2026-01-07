import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface SummarySectionProps {
  onNext: () => void;
  onPrevious: () => void;
  video: File | null;
  subtitle: any;
  onSummaryReady: (data: any) => void;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  onNext,
  onPrevious,
  video,
  subtitle,
  onSummaryReady,
}) => {
  const handleConfirm = () => {
    const summaryData = {
      video: video,
      subtitle: subtitle,
      timestamp: new Date(),
    };
    onSummaryReady(summaryData);
    onNext();
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '600px',
        px: 3,
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          Review & Confirm
        </Typography>
      </Box>

      <Box
        sx={{
          bgcolor: '#fafafa',
          borderRadius: 1,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              color: '#999999',
              mb: 0.5,
            }}
          >
            Video File
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 400,
              color: '#1a1a1a',
            }}
          >
            {video?.name || 'No video selected'}
          </Typography>
        </Box>

        <Box>
          <Typography
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              color: '#999999',
              mb: 0.5,
            }}
          >
            Subtitle Style
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 400,
              color: '#1a1a1a',
            }}
          >
            {subtitle?.name || 'No style selected'}
          </Typography>
        </Box>

        <Box
          sx={{
            pt: 2.5,
            borderTop: '1px solid #e5e5e5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              color: '#1a1a1a',
            }}
          >
            Total
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.25rem',
              fontWeight: 400,
              color: '#1a1a1a',
            }}
          >
            $9.99
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={handleConfirm}
          sx={{
            bgcolor: '#f16838',
            color: '#ffffff',
            borderRadius: 1,
            px: 4,
            py: 1,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: '0.875rem',
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#d95a30',
            },
          }}
        >
          Confirm & Proceed to Payment
        </Button>
      </Box>
    </Box>
  );
};
