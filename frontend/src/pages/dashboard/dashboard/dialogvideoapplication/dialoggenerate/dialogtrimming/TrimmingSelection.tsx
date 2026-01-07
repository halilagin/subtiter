import React, { useState } from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import { TrimConfiguration } from '@/api/models';
import SelectedTrimmings from './SelectedTrimmings';
import TrimSection from './TrimSection';
import GenerateTrimmingsButton from './GenerateTrimmingsButton';
import { VideoItem } from '../../../generatedvideolist/model/GeneratedVideoListModel';

interface TrimmingSelectionProps {
  videoId: string;
  video: VideoItem;
}

const TrimmingSelection: React.FC<TrimmingSelectionProps> = ({ 
  videoId,
  video
}) => {
  const [selectedTrimmings, setSelectedTrimmings] = useState<TrimConfiguration[]>([]);


  return (
    <Box>
      <Box sx={{ 
        mb: 0.5, 
        bgcolor: '#f5f5f5', 
        p: 1, 
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Title */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 1.5,
          px: 1,
          py: 0.5,
          minWidth: 0,
          gap: 1
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: '600', 
              color: '#2f2e2c', 
              fontFamily: "'Inter', sans-serif",
              fontSize: { xs: '0.75rem', md: '0.85rem' },
              lineHeight: 1.5,
              flexShrink: 0
            }}
          >
            Trim Configuration
          </Typography>
        </Box>

        {/* Trim Section */}
        <Box sx={{ px: 1 }}>
          <TrimSection video={video} />
        </Box>
      </Box>
      
      <Box>
        <SelectedTrimmings onSelectedTrimmingsChange={setSelectedTrimmings} />
      </Box>
      
      <GenerateTrimmingsButton videoId={videoId} selectedTrimmings={selectedTrimmings} />
    </Box>
  );
};

export default TrimmingSelection;

