import React from 'react';
import {
  Box,
  Typography,
  Grid
} from '@mui/material';

interface ComparisonInputsProps {
  selectedAlternative: string | null;
  onAlternativeSelect: (alternative: string) => void;
  textColor?: string;
}

const ComparisonInputs: React.FC<ComparisonInputsProps> = ({
  selectedAlternative,
  onAlternativeSelect,
  textColor = '#000000'
}) => {
  return (
    <Grid item xs={12} md={2}>
      <Typography variant="h6" sx={{
        fontWeight: '600',
        color: textColor,
        mb: { xs: 2, md: 3 },
        fontSize: { xs: '0.9rem', md: '1rem' },
        fontFamily: "'Inter', sans-serif"
      }}>
        Alternatives
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography
          variant="body2"
          onClick={() => onAlternativeSelect('opus-clip')}
          sx={{
            color: selectedAlternative === 'opus-clip' ? '#e05a29' : textColor,
            cursor: 'pointer',
            '&:hover': { color: '#e05a29' }
          }}
        >
          Opus Clip
        </Typography>
        <Typography
          variant="body2"
          onClick={() => onAlternativeSelect('kapwing')}
          sx={{
            color: selectedAlternative === 'kapwing' ? '#5a4eff' : textColor,
            cursor: 'pointer',
            '&:hover': { color: '#5a4eff' }
          }}
        >
          Kapwing
        </Typography>
        <Typography
          variant="body2"
          onClick={() => onAlternativeSelect('veed')}
          sx={{
            color: selectedAlternative === 'veed' ? '#5a4eff' : textColor,
            cursor: 'pointer',
            '&:hover': { color: '#5a4eff' }
          }}
        >
          Veed.io
        </Typography>
        <Typography
          variant="body2"
          onClick={() => onAlternativeSelect('pictory')}
          sx={{
            color: selectedAlternative === 'pictory' ? '#5a4eff' : textColor,
            cursor: 'pointer',
            '&:hover': { color: '#5a4eff' }
          }}
        >
          Pictory
        </Typography>
      </Box>
    </Grid>
  );
};

export default ComparisonInputs; 