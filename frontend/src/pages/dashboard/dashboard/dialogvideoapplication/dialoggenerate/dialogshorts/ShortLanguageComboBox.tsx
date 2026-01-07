import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import {
  
} from '@mui/icons-material';
import { LANGUAGES } from './languages';
import { EventType } from '@/events';

import { ShortConfigJsonInput } from '@/api/models';

interface ShortLanguageComboBoxProps {
  shortConfig?: ShortConfigJsonInput;
}

const ShortLanguageComboBox: React.FC<ShortLanguageComboBoxProps> = ({ shortConfig }) => {
  // Find the language name from the code
  const getLanguageName = (code: string) => {
    const lang = LANGUAGES.find(l => l.code === code);
    return lang ? lang.name : 'English';
  };
  const language = shortConfig?.videoLanguageCode ?? 'en';
  return (
    <Box sx={{ mb: 0.5, bgcolor: '#f5f5f5', p: 0.8, borderRadius: 2, minHeight: '48px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: '600', color: '#2f2e2c', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', ml: 1 }}>
            Language
          </Typography>
          
        </Box>
        <FormControl size="small">
          <Select
            value={language}
            displayEmpty
            renderValue={(value) => getLanguageName(value as string)}
            onChange={(e) => {
                const val = e.target.value;
                const event = new CustomEvent(EventType.UPDATE_SHORT_CONFIG, { 
                    detail: { 
                        videoLanguageCode: val,
                        videoId: shortConfig?.videoId
                    } 
                });
                window.dispatchEvent(event);
            }}
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
            {LANGUAGES.map((language) => (
              <MenuItem key={language.code} value={language.code}>
                {language.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  )
}

export default ShortLanguageComboBox;

