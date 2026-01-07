import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Box, Typography, Button, IconButton, CircularProgress, Select, MenuItem, FormControl, Slider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TitleIcon from '@mui/icons-material/Title';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import VerticalAlignCenterIcon from '@mui/icons-material/VerticalAlignCenter';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import { ChatMessage, ShortsFlowData, Chat, FlowStep } from './types';
import { getSubtitleVideoBackground } from '../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleVideoBackgrounds';
import { ShortSubtitleStyleDefault } from '../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleDefault';
import { ShortSubtitleStyleRegular } from '../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleRegular';
import { ShortSubtitleStyleRoundedBox } from '../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleRoundedBox';
import { ShortSubtitleStyleMesageBox } from '../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleMesageBox';
import { getPositionStyles } from '../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitlePositionUtils';
import { subtitleRegularColorOptions, subtitleMessageBoxColorOptions, roundedBoxColorOptions } from '@/constants/SubtitleColors';
import { applyCapitalization } from '../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleUtils';
import { SubtitleCapitalizationMethod } from '@/api/models/SubtitleCapitalizationMethod';
import { SubtitlePosition } from '@/api/models/SubtitlePosition';
import { VideoAspectRatio } from '@/api/models/VideoAspectRatio';
import { LANGUAGES } from '../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/languages';
import { createSummaryMessage } from './hooks/flowHandlers/createSummaryMessage';

interface ChatMessagesProps {
  messages: ChatMessage[];
  onExampleClick?: (text: string) => void;
  onFlowOptionClick?: (text: string) => void;
  currentChatId?: string | null;
  flowData?: Record<string, ShortsFlowData>;
  setFlowData?: React.Dispatch<React.SetStateAction<Record<string, ShortsFlowData>>>;
  setChats?: React.Dispatch<React.SetStateAction<Chat[]>>;
}

const examplePrompts = [
  'I want to create a video',
  
  'Generate subtitles for my content',
  'Trim my video to the perfect length',
];

// Subtitle Details Component
const SubtitleDetailsContent: React.FC<{
  message: ChatMessage;
  currentChatId: string | null | undefined;
  flowData: Record<string, ShortsFlowData> | undefined;
  setFlowData: React.Dispatch<React.SetStateAction<Record<string, ShortsFlowData>>> | undefined;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>> | undefined;
  setSelectedSubtitleStyle: (style: string | null) => void;
  setShowColorDialog: (show: boolean) => void;
}> = ({ message, currentChatId, flowData, setFlowData, setChats, setSelectedSubtitleStyle, setShowColorDialog }) => {
  if (!message.flowData?.selectedSubtitleStyle || !currentChatId || !flowData || !flowData[currentChatId]) {
    return null;
  }
  
  const currentFlow = flowData[currentChatId];
  const hasColor = currentFlow.subtitleStyle === 'default' || currentFlow.subtitleColor;
  const hasCapitalization = !!currentFlow.subtitleCapitalizationMethod;
  const hasPosition = !!currentFlow.subtitlePosition;
  const allSelected = hasColor && hasCapitalization && hasPosition;
  
  // Map capitalization method to string for Select value
  const getCapitalizationString = (method?: SubtitleCapitalizationMethod): string => {
    if (!method) return '';
    if (method === SubtitleCapitalizationMethod.Default) return 'Default';
    if (method === SubtitleCapitalizationMethod.Uppercase) return 'Uppercase';
    if (method === SubtitleCapitalizationMethod.Lowercase) return 'Lowercase';
    if (method === SubtitleCapitalizationMethod.CapitalizeFirstCharInWords) return 'Capitalize First Char';
    return '';
  };
  
  // Map position to string for Select value
  const getPositionString = (position?: SubtitlePosition): string => {
    if (!position) return '';
    if (position === SubtitlePosition.Top) return 'Top';
    if (position === SubtitlePosition.Center) return 'Center';
    if (position === SubtitlePosition.Bottom) return 'Bottom';
    return '';
  };
  
  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        {/* Preview on the left */}
        <SubtitlePreview 
          key={`preview-${message.flowData.selectedSubtitleStyle}-${currentFlow.subtitleColor?.name || 'no-color'}-${currentFlow.subtitleCapitalizationMethod}-${currentFlow.subtitlePosition}`}
          styleId={message.flowData.selectedSubtitleStyle}
          currentFlow={currentFlow}
        />
        
        {/* Controls on the right */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
          {/* Color Button - if color-supporting style */}
          {message.flowData?.showColorButton && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSubtitleStyle(message.flowData?.selectedSubtitleStyle || null);
                setShowColorDialog(true);
              }}
              variant="outlined"
              sx={{
                borderRadius: 6,
                textTransform: 'none',
                fontSize: '0.8rem',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                borderColor: currentFlow.subtitleColor 
                  ? (currentFlow.subtitleColor.ui?.activeColor || currentFlow.subtitleColor.ui?.activeBoxColor || '#000000')
                  : '#000000',
                color: '#ffffff',
                bgcolor: currentFlow.subtitleColor 
                  ? (currentFlow.subtitleColor.ui?.activeColor || currentFlow.subtitleColor.ui?.activeBoxColor || '#000000')
                  : '#000000',
                px: 2,
                py: 1,
                minWidth: { xs: '100%', sm: '140px' },
                '&:hover': {
                  borderColor: currentFlow.subtitleColor 
                    ? (currentFlow.subtitleColor.ui?.activeColor || currentFlow.subtitleColor.ui?.activeBoxColor || '#000000')
                    : '#000000',
                  bgcolor: currentFlow.subtitleColor 
                    ? (currentFlow.subtitleColor.ui?.activeColor || currentFlow.subtitleColor.ui?.activeBoxColor || '#1a1a1a')
                    : '#1a1a1a',
                },
              }}
            >
              Change Color
            </Button>
          )}
          
          {/* Capitalization Dropdown */}
          <FormControl
            sx={{
              minWidth: { xs: '100%', sm: '140px' },
              maxWidth: { xs: '100%', sm: '160px' },
            }}
          >
            <Select
              value={getCapitalizationString(currentFlow.subtitleCapitalizationMethod)}
              displayEmpty
              onChange={(e) => {
                if (currentChatId && flowData && setFlowData) {
                  const value = e.target.value;
                  let method: SubtitleCapitalizationMethod | undefined;
                  if (value === 'Default') method = SubtitleCapitalizationMethod.Default;
                  else if (value === 'Uppercase') method = SubtitleCapitalizationMethod.Uppercase;
                  else if (value === 'Lowercase') method = SubtitleCapitalizationMethod.Lowercase;
                  else if (value === 'Capitalize First Char') method = SubtitleCapitalizationMethod.CapitalizeFirstCharInWords;
                  
                  if (method) {
                    const newFlow = {
                      ...currentFlow,
                      subtitleCapitalizationMethod: method,
                    };
                    setFlowData(prev => ({ ...prev, [currentChatId]: newFlow }));
                  }
                }
              }}
              sx={{
                borderRadius: 6,
                fontSize: '0.875rem',
                fontFamily: "'Inter', sans-serif",
                bgcolor: '#ffffff',
                border: '1px solid #d1d5db',
                '&:hover': {
                  borderColor: '#000000',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#d1d5db',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000000',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000000',
                  borderWidth: '1px',
                },
                '& .MuiSelect-select': {
                  py: 1.25,
                  px: 2,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: 3,
                    mt: 0.5,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    maxHeight: 200,
                    overflow: 'auto',
                    '& .MuiMenuItem-root': {
                      fontSize: '0.875rem',
                      fontFamily: "'Inter', sans-serif",
                      py: 1.25,
                      '&:hover': {
                        bgcolor: 'transparent',
                      },
                      '&.Mui-selected': {
                        bgcolor: 'transparent',
                        color: '#000000',
                        '&:hover': {
                          bgcolor: 'transparent',
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="" disabled>
                <Typography sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  Select Capitalization
                </Typography>
              </MenuItem>
              {['Default', 'Uppercase', 'Lowercase', 'Capitalize First Char'].map((option, index) => {
                const optionStr = String(option);
                let IconComponent = null;
                
                if (optionStr === 'Default') {
                  IconComponent = (
                    <Typography sx={{ 
                      fontSize: '0.875rem', 
                      mr: 1.5, 
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      minWidth: '24px',
                      textAlign: 'center'
                    }}>
                      Aa
                    </Typography>
                  );
                } else if (optionStr === 'Uppercase') {
                  IconComponent = (
                    <Typography sx={{ 
                      fontSize: '0.875rem', 
                      mr: 1.5, 
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      minWidth: '24px',
                      textAlign: 'center'
                    }}>
                      AA
                    </Typography>
                  );
                } else if (optionStr === 'Lowercase') {
                  IconComponent = (
                    <Typography sx={{ 
                      fontSize: '0.875rem', 
                      mr: 1.5, 
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      minWidth: '24px',
                      textAlign: 'center'
                    }}>
                      aa
                    </Typography>
                  );
                } else if (optionStr === 'Capitalize First Char') {
                  IconComponent = (
                    <Typography sx={{ 
                      fontSize: '0.875rem', 
                      mr: 1.5, 
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      minWidth: '24px',
                      textAlign: 'center'
                    }}>
                      Aa
                    </Typography>
                  );
                }
                
                return (
                  <MenuItem
                    key={index}
                    value={optionStr}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {IconComponent}
                    {optionStr}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          
          {/* Position Dropdown */}
          <FormControl
            sx={{
              minWidth: { xs: '100%', sm: '140px' },
              maxWidth: { xs: '100%', sm: '160px' },
            }}
          >
            <Select
              value={getPositionString(currentFlow.subtitlePosition)}
              displayEmpty
              onChange={(e) => {
                if (currentChatId && flowData && setFlowData) {
                  const value = e.target.value;
                  let position: SubtitlePosition | undefined;
                  if (value === 'Top') {
                    position = SubtitlePosition.Top;
                  } else if (value === 'Center') {
                    position = SubtitlePosition.Center;
                  } else if (value === 'Bottom') {
                    position = SubtitlePosition.Bottom;
                  }
                  
                  if (position !== undefined) {
                    const newFlow: ShortsFlowData = {
                      ...currentFlow,
                      subtitlePosition: position,
                    };
                    setFlowData(prev => ({ ...prev, [currentChatId]: newFlow }));
                  }
                }
              }}
              sx={{
                borderRadius: 6,
                fontSize: '0.8rem',
                fontFamily: "'Inter', sans-serif",
                bgcolor: '#ffffff',
                border: '1px solid #d1d5db',
                '&:hover': {
                  borderColor: '#000000',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#d1d5db',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000000',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000000',
                  borderWidth: '1px',
                },
                '& .MuiSelect-select': {
                  py: 1,
                  px: 1.5,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: 3,
                    mt: 0.5,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    maxHeight: 200,
                    overflow: 'auto',
                    '& .MuiMenuItem-root': {
                      fontSize: '0.875rem',
                      fontFamily: "'Inter', sans-serif",
                      py: 1.25,
                      '&:hover': {
                        bgcolor: 'transparent',
                      },
                      '&.Mui-selected': {
                        bgcolor: 'transparent',
                        color: '#000000',
                        '&:hover': {
                          bgcolor: 'transparent',
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="" disabled>
                <Typography sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  Select Position
                </Typography>
              </MenuItem>
              {[
                { value: 'Top', label: 'Top', enumValue: SubtitlePosition.Top },
                { value: 'Center', label: 'Center', enumValue: SubtitlePosition.Center },
                { value: 'Bottom', label: 'Bottom', enumValue: SubtitlePosition.Bottom },
              ].map((option, index) => {
                let IconComponent = null;
                
                if (option.label === 'Top') {
                  IconComponent = <VerticalAlignTopIcon sx={{ fontSize: '1rem', mr: 1 }} />;
                } else if (option.label === 'Center') {
                  IconComponent = <VerticalAlignCenterIcon sx={{ fontSize: '1rem', mr: 1 }} />;
                } else if (option.label === 'Bottom') {
                  IconComponent = <VerticalAlignBottomIcon sx={{ fontSize: '1rem', mr: 1 }} />;
                }
                
                return (
                  <MenuItem
                    key={index}
                    value={option.value}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {IconComponent}
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          
          {/* Confirm Button - only show when all selections are made */}
          {allSelected && (
            <Button
              onClick={() => {
                if (currentChatId && flowData && setFlowData && setChats) {
                  const finalFlow: ShortsFlowData = {
                    ...currentFlow,
                    step: 'showing_summary' as FlowStep,
                  };
                  
                  setFlowData(prev => ({ ...prev, [currentChatId]: finalFlow }));
                  
                  const summaryMessage = createSummaryMessage(finalFlow);
                  setChats((prevChats) =>
                    prevChats.map((chat) =>
                      chat.id === currentChatId
                        ? { ...chat, messages: [...chat.messages, summaryMessage] }
                        : chat
                    )
                  );
                }
              }}
              variant="contained"
              sx={{
                borderRadius: 6,
                textTransform: 'none',
                fontSize: '0.8rem',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                bgcolor: '#000000',
                color: '#ffffff',
                px: 2,
                py: 1,
                minWidth: { xs: '100%', sm: '140px' },
                '&:hover': {
                  bgcolor: '#1a1a1a',
                },
              }}
            >
              Confirm
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// Preview component for subtitle details
const SubtitlePreview: React.FC<{
  styleId: string;
  currentFlow: ShortsFlowData;
}> = ({ styleId, currentFlow }) => {
  const videoBackground = getSubtitleVideoBackground(styleId);
  
  // Convert SubtitlePosition enum to string
  let position: 'top' | 'middle' | 'bottom' = 'middle';
  if (currentFlow.subtitlePosition === SubtitlePosition.Top) {
    position = 'top';
  } else if (currentFlow.subtitlePosition === SubtitlePosition.Center) {
    position = 'middle';
  } else if (currentFlow.subtitlePosition === SubtitlePosition.Bottom) {
    position = 'bottom';
  }
  const positionStyles = getPositionStyles(position);
  
  // Convert SubtitleCapitalizationMethod enum to string
  let capitalization: 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words' = 'uppercase';
  if (currentFlow.subtitleCapitalizationMethod === SubtitleCapitalizationMethod.Default) {
    capitalization = 'default';
  } else if (currentFlow.subtitleCapitalizationMethod === SubtitleCapitalizationMethod.Uppercase) {
    capitalization = 'uppercase';
  } else if (currentFlow.subtitleCapitalizationMethod === SubtitleCapitalizationMethod.Lowercase) {
    capitalization = 'lowercase';
  } else if (currentFlow.subtitleCapitalizationMethod === SubtitleCapitalizationMethod.CapitalizeFirstCharInWords) {
    capitalization = 'capitalize_first_char_in_words';
  }

  // Dispatch style selected event to activate component
  useEffect(() => {
    const styleEvent = new CustomEvent('short-subtitle-style-selected', {
      detail: { id: styleId }
    });
    window.dispatchEvent(styleEvent);
  }, [styleId]);

  // Dispatch color change event when color changes (for color-supporting styles)
  useEffect(() => {
    if (currentFlow.subtitleColor && ['regular', 'rounded_box', 'message_box'].includes(styleId)) {
      // Small delay to ensure component is ready
      const timer = setTimeout(() => {
        const colorEvent = new CustomEvent('short-subtitle-color-changed', {
          detail: { 
            id: styleId, 
            color: currentFlow.subtitleColor.ui?.activeColor || currentFlow.subtitleColor.ui?.activeBoxColor 
          }
        });
        window.dispatchEvent(colorEvent);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentFlow.subtitleColor, styleId]);

  // Force re-render when position changes
  useEffect(() => {
    // This ensures the component re-renders when position changes
  }, [currentFlow.subtitlePosition, position]);

  return (
    <Box
      sx={{
        width: { xs: '140px', sm: '160px', md: '180px' },
        aspectRatio: '5 / 6',
        border: '2px solid #000000',
        borderRadius: 8,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
        }}
      >
        <source src={videoBackground} type="video/mp4" />
      </video>
      
      {/* Text Overlay with current selections */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          textAlign: 'center',
          px: 1,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {styleId === 'default' && (
          <ShortSubtitleStyleDefault 
            capitalizationStyle={capitalization} 
            selected={() => {}} 
            id="default" 
          />
        )}
        {styleId === 'regular' && (
          <ShortSubtitleStyleRegular 
            capitalizationStyle={capitalization} 
            selected={() => {}} 
            id="regular" 
            position={position}
            videoId={currentFlow.videoId}
          />
        )}
        {styleId === 'rounded_box' && (
          <ShortSubtitleStyleRoundedBox 
            capitalizationStyle={capitalization} 
            selected={() => {}} 
            id="rounded_box" 
            position={position}
            videoId={currentFlow.videoId}
          />
        )}
        {styleId === 'message_box' && (
          <ShortSubtitleStyleMesageBox 
            capitalizationStyle={capitalization} 
            selected={() => {}} 
            id="message_box" 
            position={position}
            videoId={currentFlow.videoId}
          />
        )}
      </Box>
    </Box>
  );
};

const ChatMessages = ({ messages, onExampleClick, onFlowOptionClick, currentChatId, flowData, setFlowData, setChats }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [selectedSubtitleStyle, setSelectedSubtitleStyle] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show example prompts if no messages
  if (messages.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'flex-end',
          p: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          {examplePrompts.map((prompt, index) => (
            <Box
              key={index}
              onClick={() => onExampleClick?.(prompt)}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 3,
                bgcolor: '#f5f5f5',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                maxWidth: '200px',
                '&:hover': {
                  bgcolor: '#e5e7eb',
                  borderColor: '#d1d5db',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontFamily: "'Inter', sans-serif",
                  color: '#000000',
                  fontWeight: 400,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {prompt}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 2,
        minHeight: '100%',
        overflow: 'visible',
        bgcolor: '#ffffff',
      }}
    >
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            justifyContent: message.isUser ? 'flex-end' : 'flex-start',
            width: '100%',
            overflow: 'visible',
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              maxWidth: message.flowData?.type === 'subtitle_style' || message.flowData?.type === 'subtitle_details' ? '100%' : { xs: '85%', sm: '75%' },
              px: message.isUser ? 2 : 2.5,
              py: message.isUser ? 1.25 : 1.5,
              borderRadius: message.isUser 
                ? '18px 18px 0px 18px' // User: rounded top-left, top-right, bottom-right, sharp bottom-left (no radius)
                : '18px 18px 18px 0px', // AI: rounded top-left, top-right, bottom-left, sharp bottom-right (no radius)
              bgcolor: message.isUser ? '#007AFF' : '#f5f5f5',
              color: message.isUser ? '#ffffff' : '#000000',
              display: 'flex',
              flexDirection: 'column',
              gap: message.flowData ? 1.5 : 0,
              overflow: 'visible',
              position: 'relative',
              boxShadow: message.isUser 
                ? '0 2px 8px rgba(0, 122, 255, 0.25)'
                : '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            {message.flowData?.type === 'summary' ? null : (message.text.includes('Your video is being created') || message.text.includes('Your video is being trimmed')) ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <CircularProgress
                  size={16}
                  sx={{
                    color: message.isUser ? '#ffffff' : '#000000',
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    fontFamily: "'Inter', sans-serif",
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {message.text}
                </Typography>
              </Box>
            ) : (
              <Typography
                sx={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  fontFamily: "'Inter', sans-serif",
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {message.text}
              </Typography>
            )}
            {message.flowData && message.flowData.options && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: message.flowData.type === 'subtitle_style' ? 'nowrap' : 'wrap',
                  gap: 1,
                  mt: 0.5,
                  ...(message.flowData.type === 'subtitle_style' && {
                    overflowX: 'auto',
                    overflowY: 'visible',
                    width: '100%',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '&::-webkit-scrollbar': {
                      display: 'none',
                    },
                  }),
                }}
              >
                {message.flowData.type === 'subtitle_style' ? (
                  // Special UI for subtitle styles - show as cards with real video backgrounds
                  message.flowData.options.map((option, index) => {
                    const styleMap: Record<string, { id: string; name: string }> = {
                      'Default': { id: 'default', name: 'Default' },
                      'Regular': { id: 'regular', name: 'Regular' },
                      'Rounded Box': { id: 'rounded_box', name: 'Rounded Box' },
                      'Message Box': { id: 'message_box', name: 'Message Box' },
                    };
                    const style = styleMap[String(option)] || { id: String(option).toLowerCase(), name: String(option) };
                    const videoBackground = getSubtitleVideoBackground(style.id);
                    const position: 'top' | 'middle' | 'bottom' = 'middle';
                    const positionStyles = getPositionStyles(position);
                    const isSelected = message.flowData?.selectedSubtitleStyle === style.id;
                    
                    return (
                      <Box
                        key={index}
                        onClick={() => onFlowOptionClick?.(String(option))}
                        sx={{
                          flex: '0 0 auto',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.5,
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          sx={{
                            width: 110,
                            aspectRatio: '5 / 6',
                            cursor: 'pointer',
                            border: isSelected ? '2px solid #000000' : '1px solid #e5e7eb',
                            borderRadius: 6,
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              borderColor: '#000000',
                            },
                          }}
                        >
                          {/* Video Background */}
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              zIndex: 1,
                            }}
                          >
                            <source src={videoBackground} type="video/mp4" />
                          </video>
                          
                          {/* Text Overlay */}
                          <Box
                            sx={{
                              position: 'absolute',
                              ...positionStyles,
                              width: '100%',
                              textAlign: 'center',
                              px: 1,
                              zIndex: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: '100%',
                            }}
                          >
                            {style.id === 'default' && <ShortSubtitleStyleDefault capitalizationStyle="uppercase" selected={() => {}} id="default" />}
                            {style.id === 'regular' && <ShortSubtitleStyleRegular capitalizationStyle="uppercase" selected={() => {}} id="regular" position={position} />}
                            {style.id === 'rounded_box' && <ShortSubtitleStyleRoundedBox capitalizationStyle="uppercase" selected={() => {}} id="rounded_box" position={position} />}
                            {style.id === 'message_box' && <ShortSubtitleStyleMesageBox capitalizationStyle="uppercase" selected={() => {}} id="message_box" position={position} />}
                          </Box>
                        </Box>
                        
                        {/* Subtitle name label */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: isSelected ? '#2f2e2c' : '#6b7280',
                            fontWeight: isSelected ? 600 : 400,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap',
                            textAlign: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                              color: '#2f2e2c',
                            },
                          }}
                        >
                          {style.name}
                        </Typography>
                      </Box>
                    );
                  })
                ) : null}
              </Box>
            )}
            {message.flowData && message.flowData.type === 'subtitle_details' ? (
              <SubtitleDetailsContent
                message={message}
                currentChatId={currentChatId}
                flowData={flowData}
                setFlowData={setFlowData}
                setChats={setChats}
                setSelectedSubtitleStyle={setSelectedSubtitleStyle}
                setShowColorDialog={setShowColorDialog}
              />
            ) : (message.flowData && message.flowData.type === 'trim_count') || 
             (message.flowData && message.flowData.type === 'subtitle_capitalization') ||
             (message.flowData && message.flowData.type === 'subtitle_position') ? (
              <FormControl
                sx={{
                  minWidth: 180,
                  maxWidth: 220,
                  mt: 1,
                }}
              >
                <Select
                  value=""
                  displayEmpty
                  onChange={(e) => {
                    onFlowOptionClick?.(String(e.target.value));
                  }}
                  sx={{
                    borderRadius: 6,
                    fontSize: '0.875rem',
                    fontFamily: "'Inter', sans-serif",
                    bgcolor: '#ffffff',
                    border: '1px solid #d1d5db',
                    '&:hover': {
                      borderColor: '#000000',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#d1d5db',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000000',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000000',
                      borderWidth: '1px',
                    },
                    '& .MuiSelect-select': {
                      py: 1.25,
                      px: 2,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 3,
                        mt: 0.5,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb',
                        maxHeight: 200,
                        overflow: 'auto',
                        '& .MuiMenuItem-root': {
                          fontSize: '0.875rem',
                          fontFamily: "'Inter', sans-serif",
                          py: 1.25,
                          '&:hover': {
                            bgcolor: 'transparent',
                          },
                          '&.Mui-selected': {
                            bgcolor: 'transparent',
                            color: '#000000',
                            '&:hover': {
                              bgcolor: 'transparent',
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <Typography sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                      Select
                    </Typography>
                  </MenuItem>
                  {message.flowData.options?.map((option, index) => {
                    const optionStr = String(option);
                    let IconComponent = null;
                    
                    // Capitalization text indicators
                    if (message.flowData?.type === 'subtitle_capitalization') {
                      if (optionStr === 'Default') {
                        IconComponent = (
                          <Typography sx={{ 
                            fontSize: '0.875rem', 
                            mr: 1.5, 
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            minWidth: '24px',
                            textAlign: 'center'
                          }}>
                            Aa
                          </Typography>
                        );
                      } else if (optionStr === 'Uppercase') {
                        IconComponent = (
                          <Typography sx={{ 
                            fontSize: '0.875rem', 
                            mr: 1.5, 
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            minWidth: '24px',
                            textAlign: 'center'
                          }}>
                            AA
                          </Typography>
                        );
                      } else if (optionStr === 'Lowercase') {
                        IconComponent = (
                          <Typography sx={{ 
                            fontSize: '0.875rem', 
                            mr: 1.5, 
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            minWidth: '24px',
                            textAlign: 'center'
                          }}>
                            aa
                          </Typography>
                        );
                      } else if (optionStr === 'Capitalize First Char') {
                        IconComponent = (
                          <Typography sx={{ 
                            fontSize: '0.875rem', 
                            mr: 1.5, 
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            minWidth: '24px',
                            textAlign: 'center'
                          }}>
                            Aa
                          </Typography>
                        );
                      }
                    }
                    
                    // Position icons
                    if (message.flowData?.type === 'subtitle_position') {
                      if (optionStr === 'Top') {
                        IconComponent = <VerticalAlignTopIcon sx={{ fontSize: '1rem', mr: 1 }} />;
                      } else if (optionStr === 'Center') {
                        IconComponent = <VerticalAlignCenterIcon sx={{ fontSize: '1rem', mr: 1 }} />;
                      } else if (optionStr === 'Bottom') {
                        IconComponent = <VerticalAlignBottomIcon sx={{ fontSize: '1rem', mr: 1 }} />;
                      }
                    }
                    
                    return (
                      <MenuItem
                        key={index}
                        value={optionStr}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {IconComponent}
                        {optionStr}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            ) : null}
            {message.flowData && message.flowData.options && message.flowData.type === 'subtitle_color' && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  mt: 0.5,
                }}
              >
                {message.flowData.options.map((colorOption: any, index) => (
                  <Box
                    key={index}
                    onClick={() => onFlowOptionClick?.(colorOption.name)}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 4,
                      border: '1px solid #e5e7eb',
                      bgcolor: colorOption.ui?.activeColor || colorOption.ui?.activeBoxColor || '#000000',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#000000',
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        color: '#ffffff',
                        textAlign: 'center',
                        px: 0.5,
                      }}
                    >
                      {colorOption.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            {message.flowData && message.flowData.options && message.flowData.type !== 'subtitle_color' && message.flowData.type !== 'subtitle_style' && message.flowData.type !== 'subtitle_details' && message.flowData.type !== 'subtitle_capitalization' && message.flowData.type !== 'subtitle_position' && message.flowData.type !== 'trim_count' && (
              <FormControl
                sx={{
                  mt: 1,
                  minWidth: 180,
                  maxWidth: 220,
                }}
              >
                <Select
                  value=""
                  displayEmpty
                  onChange={(e) => {
                    onFlowOptionClick?.(String(e.target.value));
                  }}
                  sx={{
                    borderRadius: 6,
                    fontSize: '0.875rem',
                    fontFamily: "'Inter', sans-serif",
                    bgcolor: '#ffffff',
                    border: '1px solid #d1d5db',
                    '&:hover': {
                      borderColor: '#000000',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#d1d5db',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000000',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000000',
                      borderWidth: '1px',
                    },
                    '& .MuiSelect-select': {
                      py: 1.25,
                      px: 2,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 3,
                        mt: 0.5,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb',
                        maxHeight: 200,
                        overflow: 'auto',
                        '& .MuiMenuItem-root': {
                          fontSize: '0.875rem',
                          fontFamily: "'Inter', sans-serif",
                          py: 1.25,
                          '&:hover': {
                            bgcolor: 'transparent',
                          },
                          '&.Mui-selected': {
                            bgcolor: 'transparent',
                            color: '#000000',
                            '&:hover': {
                              bgcolor: 'transparent',
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <Typography sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                      Select
                    </Typography>
                  </MenuItem>
                  {message.flowData.options.map((option, index) => (
                    <MenuItem
                      key={index}
                      value={String(option)}
                    >
                      {String(option)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {message.flowData && message.flowData.type === 'trim' && (
              <Box
                sx={{
                  mt: 2,
                  px: 2,
                  py: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 2,
                  width: '100%',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#2f2e2c',
                    mb: 2,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.85rem',
                  }}
                >
                  Trim {message.flowData.trimIndex !== undefined ? message.flowData.trimIndex + 1 : ''}
                </Typography>
                <Box sx={{ px: 1, pb: 3 }}>
                  <Slider
                    value={[message.flowData.trimStart || 0, message.flowData.trimEnd || (message.flowData.videoDuration || 300) / 2]}
                    onChange={(_, newValue) => {
                      const [start, end] = newValue as number[];
                      // Update flowData
                      if (currentChatId && flowData && setFlowData) {
                        const currentFlow = flowData[currentChatId];
                        if (currentFlow) {
                          const updatedFlow: ShortsFlowData = {
                            ...currentFlow,
                            trimStart: start,
                            trimEnd: end,
                          };
                          setFlowData(prev => ({ ...prev, [currentChatId]: updatedFlow }));
                        }
                      }
                      // Update message flowData
                      if (currentChatId && setChats) {
                        setChats((prevChats) =>
                          prevChats.map((chat) =>
                            chat.id === currentChatId
                              ? {
                                  ...chat,
                                  messages: chat.messages.map((msg) =>
                                    msg.id === message.id && msg.flowData
                                      ? {
                                          ...msg,
                                          flowData: {
                                            ...msg.flowData,
                                            trimStart: start,
                                            trimEnd: end,
                                          },
                                        }
                                      : msg
                                  ),
                                }
                              : chat
                          )
                        );
                      }
                    }}
                    min={0}
                    max={message.flowData.videoDuration || 300}
                    step={1}
                    valueLabelDisplay="on"
                    valueLabelFormat={(value) => {
                      const mins = Math.floor(value / 60);
                      const secs = Math.floor(value % 60);
                      return `${mins}:${secs.toString().padStart(2, '0')}`;
                    }}
                    sx={{
                      color: '#000000',
                      '& .MuiSlider-thumb': {
                        bgcolor: '#000000',
                      },
                      '& .MuiSlider-track': {
                        bgcolor: '#000000',
                      },
                      '& .MuiSlider-valueLabel': {
                        bgcolor: '#000000',
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        transform: 'translateY(50px)',
                        '&::before': {
                          display: 'none',
                        },
                      },
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  onClick={() => {
                    const trimIndex = message.flowData?.trimIndex ?? 0;
                    const trimCount = message.flowData?.trimCount ?? 1;
                    const isLastTrim = trimIndex === trimCount - 1;
                    
                    if (isLastTrim) {
                      // Last trim - apply all trims
                      onFlowOptionClick?.('Apply Trim');
                    } else {
                      // Not last trim - next, move to next
                      onFlowOptionClick?.('Next');
                    }
                  }}
                  sx={{
                    mt: 2,
                    bgcolor: '#000000',
                    color: '#ffffff',
                    borderRadius: 4,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.875rem',
                    py: 1,
                    '&:hover': {
                      bgcolor: '#333333',
                    },
                  }}
                >
                  {(() => {
                    const trimIndex = message.flowData?.trimIndex ?? 0;
                    const trimCount = message.flowData?.trimCount ?? 1;
                    return trimIndex === trimCount - 1 ? 'Apply Trim' : 'Next';
                  })()}
                </Button>
              </Box>
            )}
            {message.flowData && message.flowData.type === 'summary' && message.flowData.summaryData && (
              <Box
                sx={{
                  mt: 2,
                  width: '100%',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#2f2e2c',
                    mb: 1.5,
                  }}
                >
                  Summary
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  {(() => {
                    const flow = message.flowData.summaryData!;
                    const items: Array<{ label: string; value: string }> = [];
                    
                    if (flow.isTrimOnly) {
                      // Trim summary
                      items.push({
                        label: 'Trims',
                        value: `${flow.trimCount || 1}`,
                      });
                      if (flow.trims && flow.trims.length > 0) {
                        flow.trims.forEach((trim, index) => {
                          const formatTime = (seconds: number): string => {
                            const mins = Math.floor(seconds / 60);
                            const secs = Math.floor(seconds % 60);
                            return `${mins}:${secs.toString().padStart(2, '0')}`;
                          };
                          items.push({
                            label: `Trim ${index + 1}`,
                            value: `${formatTime(trim.start)} - ${formatTime(trim.end)}`,
                          });
                        });
                      }
                    } else if (flow.isSubtitleOnly) {
                      // Subtitle summary
                      const getSubtitleStyleName = (style: string): string => {
                        const styleMap: Record<string, string> = {
                          'default': 'Default',
                          'regular': 'Regular',
                          'rounded_box': 'Rounded Box',
                          'message_box': 'Message Box',
                        };
                        return styleMap[style] || style;
                      };
                      items.push({
                        label: 'Style',
                        value: getSubtitleStyleName(flow.subtitleStyle || 'default'),
                      });
                      if (flow.subtitleCapitalizationMethod) {
                        const getCapitalizationName = (method: SubtitleCapitalizationMethod): string => {
                          const methodMap: Record<SubtitleCapitalizationMethod, string> = {
                            [SubtitleCapitalizationMethod.Default]: 'Default',
                            [SubtitleCapitalizationMethod.Uppercase]: 'Uppercase',
                            [SubtitleCapitalizationMethod.Lowercase]: 'Lowercase',
                            [SubtitleCapitalizationMethod.CapitalizeFirstCharInWords]: 'Capitalize First Char',
                          };
                          return methodMap[method] || method;
                        };
                        items.push({
                          label: 'Capitalization',
                          value: getCapitalizationName(flow.subtitleCapitalizationMethod),
                        });
                      }
                      if (flow.subtitlePosition) {
                        const getPositionName = (position: SubtitlePosition): string => {
                          const positionMap: Partial<Record<SubtitlePosition, string>> = {
                            [SubtitlePosition.Top]: 'Top',
                            [SubtitlePosition.Center]: 'Center',
                            [SubtitlePosition.Bottom]: 'Bottom',
                          };
                          return positionMap[position] || position;
                        };
                        items.push({
                          label: 'Position',
                          value: getPositionName(flow.subtitlePosition),
                        });
                      }
                      if (flow.subtitleColor) {
                        items.push({
                          label: 'Color',
                          value: flow.subtitleColor.name,
                        });
                      }
                    } else {
                      // Generate Shorts summary
                      const getLanguageName = (code: string): string => {
                        const lang = LANGUAGES.find((l: any) => l.code === code);
                        return lang ? lang.name : code;
                      };
                      const getAspectRatioName = (ratio: VideoAspectRatio): string => {
                        const ratioMap: Partial<Record<VideoAspectRatio, string>> = {
                          [VideoAspectRatio._916]: '9:16 (Vertical)',
                          [VideoAspectRatio._169]: '16:9 (Horizontal)',
                          [VideoAspectRatio._11]: '1:1 (Square)',
                          [VideoAspectRatio._45]: '4:5',
                          [VideoAspectRatio._23]: '2:3',
                        };
                        return ratioMap[ratio] || ratio;
                      };
                      const getSubtitleStyleName = (style: string): string => {
                        const styleMap: Record<string, string> = {
                          'default': 'Default',
                          'regular': 'Regular',
                          'rounded_box': 'Rounded Box',
                          'message_box': 'Message Box',
                        };
                        return styleMap[style] || style;
                      };
                      
                      items.push({
                        label: 'Number of Shorts',
                        value: flow.count === -1 ? 'Auto' : String(flow.count),
                      });
                      items.push({
                        label: 'Duration',
                        value: flow.duration === -1 ? 'Auto' : `${flow.duration} seconds`,
                      });
                      items.push({
                        label: 'Language',
                        value: flow.language ? getLanguageName(flow.language) : 'Auto',
                      });
                      if (flow.reframe) {
                        items.push({
                          label: 'Aspect Ratio',
                          value: getAspectRatioName(flow.reframe),
                        });
                      }
                      items.push({
                        label: 'Subtitle Style',
                        value: getSubtitleStyleName(flow.subtitleStyle || 'default'),
                      });
                      if (flow.subtitleCapitalizationMethod) {
                        const getCapitalizationName = (method: SubtitleCapitalizationMethod): string => {
                          const methodMap: Record<SubtitleCapitalizationMethod, string> = {
                            [SubtitleCapitalizationMethod.Default]: 'Default',
                            [SubtitleCapitalizationMethod.Uppercase]: 'Uppercase',
                            [SubtitleCapitalizationMethod.Lowercase]: 'Lowercase',
                            [SubtitleCapitalizationMethod.CapitalizeFirstCharInWords]: 'Capitalize First Char',
                          };
                          return methodMap[method] || method;
                        };
                        items.push({
                          label: 'Capitalization',
                          value: getCapitalizationName(flow.subtitleCapitalizationMethod),
                        });
                      }
                      if (flow.subtitlePosition) {
                        const getPositionName = (position: SubtitlePosition): string => {
                          const positionMap: Partial<Record<SubtitlePosition, string>> = {
                            [SubtitlePosition.Top]: 'Top',
                            [SubtitlePosition.Center]: 'Center',
                            [SubtitlePosition.Bottom]: 'Bottom',
                          };
                          return positionMap[position] || position;
                        };
                        items.push({
                          label: 'Position',
                          value: getPositionName(flow.subtitlePosition),
                        });
                      }
                      if (flow.subtitleColor) {
                        items.push({
                          label: 'Color',
                          value: flow.subtitleColor.name,
                        });
                      }
                    }
                    
                    return (
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: 1,
                        }}
                      >
                        {items.map((item, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5,
                              px: 1.5,
                              py: 1,
                              bgcolor: '#ffffff',
                              borderRadius: 2,
                              border: '1px solid #e5e7eb',
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '0.7rem',
                                color: '#6b7280',
                                fontWeight: 500,
                              }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#2f2e2c',
                              }}
                            >
                              {item.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    );
                  })()}
                </Box>
                <Button
                  variant="contained"
                  onClick={() => {
                    onFlowOptionClick?.('Approve');
                  }}
                  sx={{
                    bgcolor: '#000000',
                    color: '#ffffff',
                    borderRadius: 4,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.875rem',
                    py: 1,
                    px: 3,
                    width: '100%',
                    '&:hover': {
                      bgcolor: '#333333',
                    },
                  }}
                >
                  Confirm & Generate
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      ))}
      <div ref={messagesEndRef} />
      
      {/* Color Selection Dialog */}
      {showColorDialog && selectedSubtitleStyle && ReactDOM.createPortal(
        <Box
          onClick={() => setShowColorDialog(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              bgcolor: '#1f2937',
              borderRadius: 2,
              maxWidth: '600px',
              width: '90%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                pb: 2,
                borderBottom: '1px solid #374151',
              }}
            >
              <Typography
                sx={{
                  color: '#ffffff',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Choose Color
              </Typography>
              <IconButton
                onClick={() => setShowColorDialog(false)}
                sx={{
                  color: '#9ca3af',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box
              sx={{
                p: 3,
                overflowY: 'auto',
                flex: 1,
              }}
            >
              <ColorDialogContent
                subtitleStyle={selectedSubtitleStyle}
                onColorSelect={(color) => {
                  const colorName = color.name.charAt(0).toUpperCase() + color.name.slice(1).toLowerCase();
                  // Update flowData directly
                  if (currentChatId && flowData && setFlowData) {
                    const currentFlow = flowData[currentChatId];
                    if (currentFlow) {
                      const updatedFlow: ShortsFlowData = {
                        ...currentFlow,
                        subtitleColor: color,
                      };
                      setFlowData(prev => ({ ...prev, [currentChatId]: updatedFlow }));
                    }
                  }
                  // Also update message flowData for button color
                  if (currentChatId && setChats) {
                    setChats((prevChats) =>
                      prevChats.map((chat) =>
                        chat.id === currentChatId
                          ? {
                              ...chat,
                              messages: chat.messages.map((msg) =>
                                msg.flowData?.type === 'subtitle_details'
                                  ? {
                                      ...msg,
                                      flowData: {
                                        ...msg.flowData,
                                        selectedColor: color,
                                      },
                                    }
                                  : msg
                              ),
                            }
                          : chat
                      )
                    );
                  }
                  onFlowOptionClick?.(`Color: ${colorName}`);
                  setShowColorDialog(false);
                }}
              />
            </Box>
          </Box>
        </Box>,
        document.body
      )}
    </Box>
  );
};

// Color Dialog Content Component
interface ColorDialogContentProps {
  subtitleStyle: string;
  onColorSelect: (color: any) => void;
}

const ColorDialogContent: React.FC<ColorDialogContentProps> = ({ subtitleStyle, onColorSelect }) => {
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const text = applyCapitalization('THE QUICK BROWN FOX JUMPS OVER', 'uppercase');
  const words = text.split(' ');
  const lines = ['THE QUICK', 'BROWN FOX', 'JUMPS OVER', 'THE LAZY DOG'];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % 4);
      setActiveLineIndex((prev) => (prev + 1) % 4);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (subtitleStyle === 'regular') {
    const colorOptions = subtitleRegularColorOptions;
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        {colorOptions.map((color) => (
          <Box
            key={color.name}
            onClick={() => onColorSelect(color)}
            sx={{
              bgcolor: '#374151',
              borderRadius: 2,
              p: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#4b5563',
                transform: 'scale(1.02)',
              },
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                mb: 1.5,
              }}
            >
              {color.name}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '40px',
              }}
            >
              {words.slice(0, 4).map((word, index) => {
                const isActive = index === activeWordIndex % 4;
                return (
                  <Typography
                    key={index}
                    sx={{
                      color: isActive ? color.ui.activeColor : color.ui.inactiveColor,
                      fontWeight: isActive ? 900 : 600,
                      fontSize: '0.6rem',
                      textShadow: isActive ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {word}
                  </Typography>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    );
  } else if (subtitleStyle === 'rounded_box') {
    const colorOptions = roundedBoxColorOptions;
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        {colorOptions.map((color) => (
          <Box
            key={color.name}
            onClick={() => onColorSelect(color)}
            sx={{
              bgcolor: '#374151',
              borderRadius: 2,
              p: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#4b5563',
                transform: 'scale(1.02)',
              },
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                mb: 1.5,
              }}
            >
              {color.name}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '40px',
              }}
            >
              {words.slice(0, 4).map((word, index) => {
                const isActive = index === activeWordIndex % 4;
                return (
                  <Typography
                    key={index}
                    sx={{
                      color: '#ffffff',
                      fontWeight: isActive ? 900 : 600,
                      fontSize: '0.6rem',
                      textShadow: isActive ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none',
                      bgcolor: isActive ? color.ui.activeBoxColor : 'transparent',
                      px: isActive ? 0.5 : 0,
                      py: isActive ? 0.25 : 0,
                      border: isActive ? `2px solid ${color.ui.activeBoxColor}` : 'none',
                      borderRadius: 1,
                      transition: 'all 0.2s ease',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {word}
                  </Typography>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    );
  } else if (subtitleStyle === 'message_box') {
    const colorOptions = subtitleMessageBoxColorOptions;
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        {colorOptions.map((color) => (
          <Box
            key={color.name}
            onClick={() => onColorSelect(color)}
            sx={{
              bgcolor: '#374151',
              borderRadius: 2,
              p: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#4b5563',
                transform: 'scale(1.02)',
              },
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                mb: 1.5,
              }}
            >
              {color.name}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '40px',
              }}
            >
              {isVisible && (
                <Typography
                  sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.55rem',
                    textAlign: 'center',
                    bgcolor: color.ui.activeBoxColor,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1.5,
                    transition: 'opacity 0.2s ease',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {lines[activeLineIndex % lines.length]}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  return null;
};

export default ChatMessages;

