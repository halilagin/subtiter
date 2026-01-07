import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button
} from '@mui/material';
import { TrimConfiguration } from '@/api/models';

// Local event constants for trimming
const TRIM_CARD_TOGGLE = 'trim-card-toggle';
const TRIM_SELECTION_CHANGED = 'trim-selection-changed';

const convertSecondsToMMSS = (durationInSeconds: number) => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const SelectedTrimmings = ({ onSelectedTrimmingsChange }: { onSelectedTrimmingsChange: (trimmings: TrimConfiguration[]) => void }) => {
  const [selectedTrimmings, setSelectedTrimmings] = useState<TrimConfiguration[]>([]);

  const handleUnselect = (trimId: string) => {
    console.log('[SelectedTrimmings] Unselecting trim:', trimId);
    
    setSelectedTrimmings((prev) => {
      const updated = prev.filter(item => item.id !== trimId);
      console.log('[SelectedTrimmings] After unselect, updated:', updated);
      
      // Dispatch update event asynchronously to notify other components
      setTimeout(() => {
        const updateEvent = new CustomEvent(TRIM_SELECTION_CHANGED, {
          detail: { selectedIds: updated.map(item => item.id) }
        });
        window.dispatchEvent(updateEvent);
        console.log('[SelectedTrimmings] Dispatched trim-selection-changed with ids:', updated.map(item => item.id));
      }, 0);
      
      return updated;
    });
  };

  useEffect(() => {
    onSelectedTrimmingsChange(selectedTrimmings);
  }, [selectedTrimmings, onSelectedTrimmingsChange]);

  useEffect(() => {
    console.log('[SelectedTrimmings] Component mounted, setting up event listeners');
    
    const handleToggleSelection = (event: CustomEvent) => {
      const { 
        isCurrentlySelected,
        trimConfiguration
      } = event.detail;
      
      console.log('[SelectedTrimmings] Received trim-card-toggle:', {
        isCurrentlySelected,
        trimConfiguration
      });
      
      setSelectedTrimmings((prev) => {
        console.log('[SelectedTrimmings] Current selection:', prev);
        
        if (isCurrentlySelected) {
          // Remove from selection
          const updated = prev.filter(item => item.id !== trimConfiguration.id);
          console.log('[SelectedTrimmings] Removing from selection, updated:', updated);
          
          // Dispatch update event asynchronously to avoid state update during render
          setTimeout(() => {
            const updateEvent = new CustomEvent(TRIM_SELECTION_CHANGED, {
              detail: { selectedIds: updated.map(item => item.id) }
            });
            window.dispatchEvent(updateEvent);
            console.log('[SelectedTrimmings] Dispatched trim-selection-changed with ids:', updated.map(item => item.id));
          }, 0);
          
          return updated;
        } else {
          // Check if max limit reached
          if (prev.length >= 3) {
            console.log('[SelectedTrimmings] Max limit reached!');
            alert('Maximum selection reached! You can only select up to 3 trim configurations.');
            return prev;
          }
          
          // Add to selection with trim configuration from event
          const updated = [...prev, trimConfiguration];
          console.log('[SelectedTrimmings] Adding to selection, updated:', updated);
          
          // Dispatch update event asynchronously to avoid state update during render
          setTimeout(() => {
            const updateEvent = new CustomEvent(TRIM_SELECTION_CHANGED, {
              detail: { selectedIds: updated.map(item => item.id) }
            });
            window.dispatchEvent(updateEvent);
            console.log('[SelectedTrimmings] Dispatched trim-selection-changed with ids:', updated.map(item => item.id));
          }, 0);
          
          return updated;
        }
      });
    };

    window.addEventListener(TRIM_CARD_TOGGLE, handleToggleSelection as EventListener);
    console.log('[SelectedTrimmings] Event listeners attached');

    return () => {
      console.log('[SelectedTrimmings] Cleaning up event listeners');
      window.removeEventListener(TRIM_CARD_TOGGLE, handleToggleSelection as EventListener);
    };
  }, []);

  if (selectedTrimmings.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e5e7eb' }}>
      <Typography sx={{ fontWeight: '600', color: '#2f2e2c', fontSize: '0.9rem', mb: 1.5 }}>
        Selected Trimmings ({selectedTrimmings.length}/3)
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {selectedTrimmings.map((trim) => (
          <Box 
            key={trim.id} 
            sx={{ 
              p: 2, 
              bgcolor: '#f5f5f5', 
              borderRadius: 2, 
              border: '1px solid #e5e7eb',
              minWidth: '200px'
            }}
          >
            <Typography sx={{ fontWeight: '600', color: '#2f2e2c', fontSize: '0.85rem', mb: 1 }}>
              Trim Configuration
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography sx={{ color: '#6b7280', fontSize: '0.75rem', mb: 0.5 }}>
                Start Time:
              </Typography>
              <Typography sx={{ fontWeight: '600', color: '#2f2e2c', fontSize: '0.9rem' }}>
                {trim.trimStartInSeconds !== undefined ? convertSecondsToMMSS(trim.trimStartInSeconds) : '0:00'}
              </Typography>
            </Box>
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ color: '#6b7280', fontSize: '0.75rem', mb: 0.5 }}>
                End Time:
              </Typography>
              <Typography sx={{ fontWeight: '600', color: '#2f2e2c', fontSize: '0.9rem' }}>
                {trim.trimEndInSeconds !== undefined ? convertSecondsToMMSS(trim.trimEndInSeconds) : '0:00'}
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => handleUnselect(trim.id || '')}
              sx={{
                width: '100%',
                bgcolor: '#ef4444',
                color: 'white',
                textTransform: 'none',
                fontSize: '0.75rem',
                py: 0.5,
                '&:hover': {
                  bgcolor: '#dc2626'
                }
              }}
            >
              Remove
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SelectedTrimmings;

