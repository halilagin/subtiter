import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button
} from '@mui/material';
import { RoundedBoxPreviewCard } from './SubtitlingStyleDefinitionCards/SubtitlingStyleRoundedBox';
import { RegularPreviewCard } from './SubtitlingStyleDefinitionCards/SubtitlingStyleRegular';
import { MessageBoxPreviewCard } from './SubtitlingStyleDefinitionCards/SubtitlingStyleMesageBox';
import { SubtitleConfiguration } from '@/api/models';
import { EventType } from '@/events';
import { subtitleMessageBoxColorOptions as messageBoxColorOptions, roundedBoxColorOptions, subtitleRegularColorOptions as regularColorOptions } from '@/constants/SubtitleColors';

const SelectedSubtitles = ({ onSelectedSubtitlesChange }: { onSelectedSubtitlesChange: (subtitles: SubtitleConfiguration[]) => void }) => {
  const [selectedSubtitles, setSelectedSubtitles] = useState<SubtitleConfiguration[]>([]);

  const handleUnselect = (subtitleId: string) => {
    console.log('[SelectedSubtitles] Unselecting subtitle:', subtitleId);
    
    setSelectedSubtitles((prev) => {
      const updated = prev.filter(item => item.id !== subtitleId);
      console.log('[SelectedSubtitles] After unselect, updated:', updated);
      
      // Dispatch update event asynchronously to notify other components
      setTimeout(() => {
        const updateEvent = new CustomEvent(EventType.SUBTITLE_SELECTION_CHANGED, {
          detail: { selectedIds: updated.map(item => item.id) }
        });
        window.dispatchEvent(updateEvent);
        console.log('[SelectedSubtitles] Dispatched subtitle-selection-changed with ids:', updated.map(item => item.id));
      }, 0);
      
      return updated;
    });
  };

  useEffect(() => {
    onSelectedSubtitlesChange(selectedSubtitles);
  }, [selectedSubtitles]);

  useEffect(() => {
    console.log('[SelectedSubtitles] Component mounted, setting up event listeners');
    
    const handleToggleSelection = (event: CustomEvent) => {
      const { 
        isCurrentlySelected,
        subtitleConfiguration
      } = event.detail;
      
      console.log('[SelectedSubtitles] Received subtitle-card-toggle:', {
        isCurrentlySelected,
        subtitleConfiguration
      });
      
      setSelectedSubtitles((prev) => {
        console.log('[SelectedSubtitles] Current selection:', prev);
        
        if (isCurrentlySelected) {
          // Remove from selection
          const updated = prev.filter(item => item.id !== subtitleConfiguration.id);
          console.log('[SelectedSubtitles] Removing from selection, updated:', updated);
          
          // Dispatch update event asynchronously to avoid state update during render
          setTimeout(() => {
            const updateEvent = new CustomEvent(EventType.SUBTITLE_SELECTION_CHANGED, {
              detail: { selectedIds: updated.map(item => item.id) }
            });
            window.dispatchEvent(updateEvent);
            console.log('[SelectedSubtitles] Dispatched subtitle-selection-changed with ids:', updated.map(item => item.id));
          }, 0);
          
          return updated;
        } else {
          // Check if max limit reached
          if (prev.length >= 3) {
            console.log('[SelectedSubtitles] Max limit reached!');
            alert('Maximum selection reached! You can only select up to 3 subtitle styles.');
            return prev;
          }
          
          // Add to selection with subtitle configuration from event
          const updated = [...prev, subtitleConfiguration];
          console.log('[SelectedSubtitles] Adding to selection, updated:', updated);
          
          // Dispatch update event asynchronously to avoid state update during render
          setTimeout(() => {
            const updateEvent = new CustomEvent(EventType.SUBTITLE_SELECTION_CHANGED, {
              detail: { selectedIds: updated.map(item => item.id) }
            });
            window.dispatchEvent(updateEvent);
            console.log('[SelectedSubtitles] Dispatched subtitle-selection-changed with ids:', updated.map(item => item.id));
          }, 0);
          
          return updated;
        }
      });
    };

    const handleDetailsUpdate = (event: CustomEvent) => {
      const { 
        id, 
        font, 
        animation, 
        color, 
        size,
        subtitle_capitalization_method,
        subtitle_position
      } = event.detail;
      
      console.log('[SelectedSubtitles] Received subtitle-details-update:', {
        id,
        font,
        animation,
        color,
        size,
        subtitle_capitalization_method,
        subtitle_position
      });
      
      setSelectedSubtitles((prev) => {
        const updated = prev.map(item => {
          if (item.id === id) {
            console.log('[SelectedSubtitles] Updating details for:', id);
            return { 
              ...item, 
              font, 
              animation, 
              color, 
              size,
              subtitleCapitalizationMethod: subtitle_capitalization_method,
              subtitlePosition: subtitle_position
            };
          }
          return item;
        });
        console.log('[SelectedSubtitles] After details update:', updated);
        return updated;
      });
    };

    window.addEventListener(EventType.SUBTITLE_CARD_TOGGLE, handleToggleSelection as EventListener);
    window.addEventListener(EventType.SUBTITLE_DETAILS_UPDATE, handleDetailsUpdate as EventListener);
    console.log('[SelectedSubtitles] Event listeners attached');

    return () => {
      console.log('[SelectedSubtitles] Cleaning up event listeners');
      window.removeEventListener(EventType.SUBTITLE_CARD_TOGGLE, handleToggleSelection as EventListener);
      window.removeEventListener(EventType.SUBTITLE_DETAILS_UPDATE, handleDetailsUpdate as EventListener);
    };
  }, []);

  if (selectedSubtitles.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e5e7eb' }}>
      <Typography sx={{ fontWeight: '600', color: '#2f2e2c', fontSize: '0.9rem', mb: 1.5 }}>
        Selected Subtitles ({selectedSubtitles.length}/3)
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {selectedSubtitles.map((subtitle) => (
          <Box key={subtitle.id} sx={{ position: 'relative' }}>
            {subtitle.kind === 'rounded_box' && subtitle.color && (
              <>
                <RoundedBoxPreviewCard 
                  colorOption={roundedBoxColorOptions.find(color => color.name === subtitle.color) || roundedBoxColorOptions[0]} 
                  initialCapitalization={subtitle.subtitleCapitalizationMethod as 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words' || 'uppercase'} 
                  isSelected={false} 
                  onSelect={() => {}} 
                  showSelectButton={false}
                  disableSelectionListener={true}
                  staysInSelectedBucket={true}
                />
                <Button
                  size="small"
                  onClick={() => handleUnselect(subtitle.id || '')}
                  sx={{
                    mt: 1,
                    width: '100%',
                    bgcolor: '#ef4444',
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    py: 0.5,
                    borderRadius: 6,
                    '&:hover': {
                      bgcolor: '#dc2626'
                    }
                  }}
                >
                  Unselect
                </Button>
              </>
            )}
            {subtitle.kind === 'message_box' && subtitle.color && (
              <>
                <MessageBoxPreviewCard 
                  color={messageBoxColorOptions.find(option => option.name === subtitle.color) || messageBoxColorOptions[0]}
                  initialCapitalization={subtitle.subtitleCapitalizationMethod as 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words' || 'uppercase'} 
                  isSelected={false} 
                  onSelect={() => {}}
                  disableSelectionListener={true}
                  staysInSelectedBucket={true}
                />
                <Button
                  size="small"
                  onClick={() => handleUnselect(subtitle.id || '')}
                  sx={{
                    mt: 1,
                    width: '100%',
                    bgcolor: '#ef4444',
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    py: 0.5,
                    borderRadius: 6,
                    '&:hover': {
                      bgcolor: '#dc2626'
                    }
                  }}
                >
                  Unselect
                </Button>
              </>
            )}
            {subtitle.kind ==='regular' && subtitle.color && (
              <>
                <RegularPreviewCard 
                  colorOption={regularColorOptions.find(color => color.name === subtitle.color) || regularColorOptions[0]} 
                  initialCapitalization={subtitle.subtitleCapitalizationMethod as 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words' || 'uppercase'} 
                  isSelected={false} 
                  onSelect={() => {}}
                  disableSelectionListener={true}
                  staysInSelectedBucket={true}
                />
                <Button
                  size="small"
                  onClick={() => handleUnselect(subtitle.id || '')}
                  sx={{
                    mt: 1,
                    width: '100%',
                    bgcolor: '#ef4444',
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    py: 0.5,
                    borderRadius: 6,
                    '&:hover': {
                      bgcolor: '#dc2626'
                    }
                  }}
                >
                  Unselect
                </Button>
              </>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SelectedSubtitles;

