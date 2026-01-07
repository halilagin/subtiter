import React, { useState } from 'react';
import {
  Box,
  Typography,
  Slider
} from '@mui/material';
import { AutoAwesome, InfoOutlined } from '@mui/icons-material';


const AutoSelectionIcon = () => {

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>Auto</Typography>
            <AutoAwesome sx={{ fontSize: 16 }} />
        </Box>
    );
}   

interface ShortCountComboBoxProps {
  numberOfShorts: number;
  onCountChange: (count: string | 'auto') => void;
}

const ShortCountComboBox: React.FC<ShortCountComboBoxProps> = ({ numberOfShorts, onCountChange }) => {
  const [value, setValue] = useState<number>(0);

  // Create marks for numbers 0 to 10
  const marks = Array.from({ length: numberOfShorts }, (_, index) => ({
    value: index,
    label: index === 0 ? <AutoSelectionIcon /> : (index+1).toString()
  }));

  const handleChange = (event: Event, newValue: number | number[]) => {
    const count = newValue as number;
    setValue(count);
    onCountChange(count.toString());
  };

  return (
    <Box sx={{ mb: 1, bgcolor: '#f5f5f5', p: 2, borderRadius: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: '600', color: '#2f2e2c', fontFamily: "'Inter', sans-serif", fontSize: '1rem' }}>
          Number of Shorts
        </Typography>
        <InfoOutlined sx={{ fontSize: 16, color: '#6b7280' }} />
      </Box>
      <Box sx={{ px: 1 }}>
        <Slider
          value={value}
          onChange={handleChange}
          aria-label="Number of shorts"
          step={1}
          min={0}
          max={9}
          marks={marks}
        //   valueLabelDisplay="auto"
        />
      </Box>
    </Box>
  );
};

export default ShortCountComboBox;
