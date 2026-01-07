import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, TextField, IconButton, Paper, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

const slashCommands = [
  'I want to see my videos',
  'I want to see my favorite subtitles',
];

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = useMemo(() => {
    if (!message.startsWith('/')) {
      return [];
    }
    if (message.length === 1) {
      return slashCommands;
    }
    const searchTerm = message.substring(1).toLowerCase();
    return slashCommands.filter(cmd => 
      cmd.toLowerCase().includes(searchTerm)
    );
  }, [message]);

  useEffect(() => {
    // Check if message starts with "/"
    if (message.startsWith('/')) {
      setShowCommands(true);
      // Reset selected index when filtering changes
      setSelectedCommandIndex((prev) => {
        if (prev >= filteredCommands.length && filteredCommands.length > 0) {
          return 0;
        }
        return prev;
      });
    } else {
      setShowCommands(false);
    }
  }, [message, filteredCommands.length]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setShowCommands(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (showCommands && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex((prev) => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex((prev) => (prev > 0 ? prev - 1 : 0));
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const selectedCommand = filteredCommands[selectedCommandIndex];
        if (selectedCommand) {
          onSendMessage(selectedCommand);
          setMessage('');
          setShowCommands(false);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommands(false);
        setMessage('');
        return;
      }
    }
    
    if (e.key === 'Enter' && !e.shiftKey && !showCommands) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCommandClick = (command: string) => {
    onSendMessage(command);
    setMessage('');
    setShowCommands(false);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
      }}
    >
      {/* Slash Commands Dropdown */}
      {showCommands && filteredCommands.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '100%',
            left: 16,
            right: 80,
            mb: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            maxHeight: 300,
            overflow: 'visible',
            zIndex: 1000,
            bgcolor: 'transparent',
            pointerEvents: 'none',
            '& > *': {
              pointerEvents: 'auto',
            },
          }}
        >
          {filteredCommands.map((command, index) => (
            <Box
              key={index}
              onClick={() => handleCommandClick(command)}
              onMouseEnter={() => setSelectedCommandIndex(index)}
              sx={{
                px: 2.5,
                py: 1.5,
                cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.7) 0%, rgba(251, 146, 60, 0.7) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.8) 0%, rgba(251, 146, 60, 0.8) 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontFamily: "'Inter', sans-serif",
                  color: '#ffffff',
                  fontWeight: 500,
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                }}
              >
                {command}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 2,
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              bgcolor: '#f5f5f5',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9375rem',
              paddingLeft: '16px',
              '& fieldset': {
                borderColor: '#e5e7eb',
              },
              '&:hover fieldset': {
                borderColor: '#d1d5db',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#000000',
              },
            },
            '& .MuiOutlinedInput-input': {
              paddingLeft: '4px',
            },
          }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!message.trim()}
          sx={{
            bgcolor: message.trim() ? '#000000' : '#e5e7eb',
            color: message.trim() ? '#ffffff' : '#999999',
            width: 40,
            height: 40,
            '&:hover': {
              bgcolor: message.trim() ? '#333333' : '#e5e7eb',
            },
            '&:disabled': {
              bgcolor: '#e5e7eb',
              color: '#999999',
            },
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInput;

