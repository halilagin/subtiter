import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import {
  
  AutoAwesome
} from '@mui/icons-material';
import { ShortConfigJsonInput } from '@/api/models/ShortConfigJsonInput';
import ShortDurationSegmentedButton from './ShortDurationSegmentButton';
import { durationMapinMinutes, durationMapToSeconds } from './ShortDurationMap';
import { EventType } from '@/events';
interface ShortDurationComboBoxProps {
  shortConfig: ShortConfigJsonInput;
}



const ShortDurationComboBox: React.FC<ShortDurationComboBoxProps> = ({ shortConfig }) => {
    const [duration, setDuration] = useState(durationMapinMinutes[shortConfig.targetShortVideoDurationInSeconds ?? -1]);

    useEffect(() => {
        console.log('shortConfig.targetShortVideoDurationInSeconds:', shortConfig.targetShortVideoDurationInSeconds);
        const seconds = shortConfig.targetShortVideoDurationInSeconds ?? -1;
        const newDuration = durationMapinMinutes[seconds];
        if (newDuration && newDuration !== duration) {
             setDuration(newDuration);
        }
    }, [shortConfig.targetShortVideoDurationInSeconds]);

    const handleDurationChange = (durationLabel: string) => {
        setDuration(durationLabel);
        // Convert the string label to seconds and pass it to onDurationChange
        const durationInSeconds = durationMapToSeconds[durationLabel];
        if (durationInSeconds !== undefined) {
            const event = new CustomEvent(EventType.UPDATE_SHORT_CONFIG, { 
                detail: { 
                    targetShortVideoDurationInSeconds: durationInSeconds,
                    videoId: shortConfig?.videoId
                } 
            });
            window.dispatchEvent(event);
        }
    }
  return (
    <Box sx={{ mb: 0.5, bgcolor: '#f5f5f5', p: 0.8, borderRadius: 2, minWidth: 0, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flexShrink: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: '600', color: '#2f2e2c', fontFamily: "'Inter', sans-serif", fontSize: { xs: '0.75rem', md: '0.85rem' }, ml: 1 }}>
            Shorts Duration
          </Typography>
          
        </Box>
        <Box sx={{ display: 'flex', gap: 0, flexShrink: 0, minWidth: 0 }}>
        <ShortDurationSegmentedButton
            label="0.5 min"
            value="0.5 min"
            isSelected={duration === '0.5 min'}
            onClick={handleDurationChange}
            position="left"
          />
          <ShortDurationSegmentedButton
            label="1 min"
            value="1 min"
            isSelected={duration === '1 min'}
            onClick={handleDurationChange}
            position="middle"
          />
         
          <ShortDurationSegmentedButton
            label="2 min"
            value="2 min"
            isSelected={duration === '2 min'}
            onClick={handleDurationChange}
            position="middle"
          />
          <ShortDurationSegmentedButton
            label="2.5 min"
            value="2.5 min"
            isSelected={duration === '2.5 min'}
            onClick={handleDurationChange}
            position="middle"
          />
          <ShortDurationSegmentedButton
            label="Auto"
            value="Auto"
            isSelected={duration === 'Auto'}
            onClick={handleDurationChange}
            position="right"
            startIcon={<AutoAwesome sx={{ fontSize: 16 }} />}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default ShortDurationComboBox;

