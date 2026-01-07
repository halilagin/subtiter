import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import { AutoAwesome} from '@mui/icons-material';
import { EventType } from '@/events';


import { ShortConfigJsonInput } from '@/api/models';

const AutoSelectionIcon = () => {

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>Auto</Typography>
            <AutoAwesome sx={{ fontSize: 16, ml: 0.5 }} />
        </Box>
    );
}   

interface ShortCountComboBoxProps {
  shortConfig?: ShortConfigJsonInput;
}

const ShortCountComboBox: React.FC<ShortCountComboBoxProps> = ({ shortConfig }) => {
  const [selectValue, setSelectValue] = useState<number>(shortConfig?.segmentCount ?? -1);
  const numberOfShorts = 10;

  useEffect(() => {
    setSelectValue(shortConfig?.segmentCount ?? -1);
  }, [shortConfig?.segmentCount]);

  const handleChange = (event: any) => {
    const newCount = event.target.value;
    setSelectValue(newCount);
    // onCountChange(newCount);
    console.log("count", newCount);
    const customEvent = new CustomEvent(EventType.UPDATE_SHORT_CONFIG, { 
        detail: { 
            segmentCount: newCount,
            videoId: shortConfig?.videoId
        } 
    });
    window.dispatchEvent(customEvent);
  };

  return (
    <Box sx={{ mb: 0.5, bgcolor: '#f5f5f5', p: 0.8, borderRadius: 2, minHeight: '48px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: '600', color: '#2f2e2c', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', ml: 1 }}>
            Number of Shorts
          </Typography>
          
        </Box>
        <FormControl size="small">
          <Select
            value={selectValue}
            onChange={handleChange}
            displayEmpty
            renderValue={(value: number) => value === -1 ? 'Auto' : value.toString()}
            sx={{
              minWidth: 140,
              bgcolor: 'white',
              borderRadius: 2,
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#2f2e2c',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e5e7eb',
                borderWidth: 1
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af',
                borderWidth: 2
              },
              '& .MuiSelect-select': {
                py: 1,
                px: 1.5
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 240,
                  boxShadow: 'none',
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  '& .MuiList-root': {
                    padding: 0
                  },
                  '& .MuiMenuItem-root': {
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }
                }
              }
            }}
          >
           <MenuItem key={-1} value={-1}>
                <AutoSelectionIcon />
              </MenuItem>
            {Array.from({ length: numberOfShorts }, (_, index) => (
              <MenuItem key={index + 1} value={index + 1}>
                {index + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default ShortCountComboBox;
