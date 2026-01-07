import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import { Chat } from './types';

interface ChatListProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onToggleSidebar?: () => void;
}

const ChatList = ({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onToggleSidebar,
}: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
        borderRight: '1px solid rgba(0, 0, 0, 0.05)',
        borderRadius: { xs: 0, md: '24px 0 0 24px' },
        overflow: 'hidden',
      }}
    >
      {/* Search Bar with Icons */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
        }}
      >
        <TextField
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666666', fontSize: '18px' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 6,
              bgcolor: '#f5f5f5',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.875rem',
              color: '#666666',
              '& fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.15)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#000000',
              },
              '& input::placeholder': {
                color: '#666666',
                opacity: 1,
              },
            },
          }}
        />
        {onToggleSidebar && (
          <IconButton
            onClick={onToggleSidebar}
            size="small"
            sx={{
              width: 32,
              height: 32,
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            <MenuIcon sx={{ fontSize: '18px' }} />
          </IconButton>
        )}
      </Box>

      {/* Chat List */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        {filteredChats.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#999999',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {searchQuery ? 'No chats found' : 'No chats yet. Start a new conversation!'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredChats.map((chat) => (
              <ListItem
                key={chat.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    sx={{
                      opacity: 0.5,
                      '&:hover': {
                        opacity: 1,
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={chat.id === currentChatId}
                  onClick={() => onSelectChat(chat.id)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(0, 122, 255, 0.15)',
                      '&:hover': {
                        bgcolor: 'rgba(0, 122, 255, 0.2)',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.05)',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontWeight: chat.id === currentChatId ? 600 : 400,
                          fontSize: '0.875rem',
                          fontFamily: "'Inter', sans-serif",
                          color: '#000000',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {chat.title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#666666',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.75rem',
                        }}
                      >
                        {formatDate(chat.createdAt)}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Profile Section - Bottom */}
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: '#000000',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          U
        </Avatar>
        <Typography
          sx={{
            flex: 1,
            fontWeight: 600,
            fontSize: '0.875rem',
            fontFamily: "'Inter', sans-serif",
            color: '#000000',
          }}
        >
          User Name
        </Typography>
        <IconButton
          size="small"
          sx={{
            color: '#000000',
            '&:hover': {
              bgcolor: '#f5f5f5',
            },
          }}
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatList;

