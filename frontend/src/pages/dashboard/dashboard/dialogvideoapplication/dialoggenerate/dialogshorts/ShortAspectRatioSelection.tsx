import React, { useEffect } from 'react';
import { useState } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { videoDimentionNameToAspectRatioMap } from './ShortVideoAspectRatio';
import { FormControlLabel } from '@mui/material';
import { Typography } from '@mui/material';
import { Switch } from '@mui/material';
import { EventType } from '@/events';
import { ShortConfigJsonInput } from '@/api/models/ShortConfigJsonInput';
interface ShortAspectRatioSelectionProps {
  videoAspectRatioValue: string;
  reframeActive: boolean;
  shortConfig?: ShortConfigJsonInput;
}

const ShortAspectRatioSelection: React.FC<ShortAspectRatioSelectionProps> = ({
  videoAspectRatioValue: videoAspectRatioValue,
  reframeActive,
  shortConfig
}) => {

    const [localVideoAspectRatioValue, setLocalVideoAspectRatioValue] = useState(videoAspectRatioValue);

    useEffect(() => {
        setLocalVideoAspectRatioValue(videoAspectRatioValue);
    }, [videoAspectRatioValue]);

    const handleAspectRatioChange = (aspectRatioValue: string) => {
        setLocalVideoAspectRatioValue(aspectRatioValue);
        const event = new CustomEvent(EventType.UPDATE_SHORT_CONFIG, { 
            detail: { 
                videoAspectRatio: aspectRatioValue,
                videoId: shortConfig?.videoId
            } 
        });
        window.dispatchEvent(event);
    }

  return (
    <FormControl size="small">
      <Select 
        disabled={!reframeActive}
        value={localVideoAspectRatioValue}
        onChange={(e) => handleAspectRatioChange(e.target.value)}
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
        {Object.entries(videoDimentionNameToAspectRatioMap).map(([key, value]) => (
          <MenuItem key={key} value={value}>{key}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}


interface ShortAspectRatioSelectionswitcherProps {
  shortConfig?: ShortConfigJsonInput;
}


export const ShortAspectRatioSelectionSwitcher = ({ shortConfig }: ShortAspectRatioSelectionswitcherProps): React.ReactNode => {
    const aspectRatioName = shortConfig?.videoAspectRatio?.toString() ?? 'default';
    const [reframeActive, setReframeActive] = useState(aspectRatioName !== 'default');
    const [localAspectRatioName, setLocalAspectRatioName] = useState(aspectRatioName === 'default' ? '9:16' : aspectRatioName);
    
    useEffect(() => {
      console.log('ShortAspectRatioSelectionSwitcher.aspectRatioName:', aspectRatioName);
      if (aspectRatioName !== 'default') {
          setLocalAspectRatioName(aspectRatioName);
          setReframeActive(true);
      } else {
          setReframeActive(false);
      }
    }, [aspectRatioName]);

    
    const handleReframeChange = (reframeActive: boolean) => {
      setReframeActive(reframeActive);
      // Update config using event
      const newValue = reframeActive ? localAspectRatioName : 'default';
      const event = new CustomEvent(EventType.UPDATE_SHORT_CONFIG, { 
        detail: { 
            videoAspectRatio: newValue,
            videoId: shortConfig?.videoId
        } 
      });
      window.dispatchEvent(event);
    }

    const handleLocalAspectRatioChange = (aspectRatioName: string) => {
      // This callback is from the child ShortAspectRatioSelection which we also modified.
      // However, ShortAspectRatioSelection now dispatches the event itself!
      // So we don't need to do anything here regarding dispatch, but we might need to update local state?
      // Actually, ShortAspectRatioSelection uses internal state too.
      // And ShortAspectRatioSelectionSwitcher uses localAspectRatioName.
      // We should probably listen to the event? 
      // But wait, the child component ShortAspectRatioSelection dispatches the event.
      // Does it also notify parent? I removed onAspectRatioChange prop from ShortAspectRatioSelection.
      // So ShortAspectRatioSelectionSwitcher won't get a callback.
      // This means handleLocalAspectRatioChange won't be called by the child.
      // But wait, I need to update the JSX below where I render ShortAspectRatioSelection.
      setLocalAspectRatioName(aspectRatioName);
    }
  
return (
    <Box sx={{ mb: 0.5, bgcolor: '#f5f5f5', p: 0.8, borderRadius: 2, minHeight: '48px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, height: '100%' }}>
            <FormControlLabel   
              labelPlacement="start"
              sx={{ ml: 0 }}
              label={
                <Typography sx={{ fontWeight: '600', color: '#2f2e2c', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', ml: 1 }}>
                  Enable Reframe
                </Typography>
              }
              control={
                <Switch
                  checked={reframeActive}
                  onChange={(e) => handleReframeChange(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      '&.Mui-checked': {
                        color: '#8b5cf6',
                        '& + .MuiSwitch-track': {
                          backgroundColor: '#8b5cf6',
                          opacity: 1,
                        },
                      },
                      '&.Mui-disabled + .MuiSwitch-track': {
                        opacity: 0.3,
                      },
                    },
                    '& .MuiSwitch-thumb': {
                      backgroundColor: reframeActive ? '#ffffff' : '#9ca3af',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: reframeActive ? '#8b5cf6' : '#e5e7eb',
                      opacity: 1,
                      borderRadius: 12,
                    },
                  }}
                />
              }
              
            />
            {
              
              <ShortAspectRatioSelection reframeActive={reframeActive} videoAspectRatioValue={aspectRatioName} shortConfig={shortConfig} />
              
            }
          </Box>
        </Box>
)
}


export default ShortAspectRatioSelection;