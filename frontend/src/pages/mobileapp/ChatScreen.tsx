import React, { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import ChatList from './ChatList';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { Chat, ChatMessage, ShortsFlowData } from './types';

interface ChatScreenProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onSendMessage: (text: string) => void;
  flowData: Record<string, ShortsFlowData>;
  setFlowData: React.Dispatch<React.SetStateAction<Record<string, ShortsFlowData>>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

const ChatScreen = ({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onSendMessage,
  flowData,
  setFlowData,
  setChats,
}: ChatScreenProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerContent = (
    <Box sx={{ width: { xs: 280, sm: 320 }, height: '100%' }}>
      <ChatList
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={onNewChat}
        onSelectChat={(chatId) => {
          onSelectChat(chatId);
          if (isMobile) {
            setDrawerOpen(false);
          }
        }}
        onToggleSidebar={isMobile ? handleDrawerToggle : undefined}
      />
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: '320px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {drawerContent}
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Chat Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            bgcolor: '#ffffff',
            position: 'relative',
          }}
        >
          {/* Left side - Menu icon */}
          <Box sx={{ width: 40, display: 'flex', justifyContent: 'flex-start' }}>
            {isMobile && (
              <IconButton
                onClick={handleDrawerToggle}
                edge="start"
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>

          {/* Center - Subtiter */}
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                fontFamily: "'Kelson Sans', 'Inter', sans-serif",
                color: '#000000',
              }}
            >
              Subtiter
            </Typography>
          </Box>

          {/* Right side - New Chat Button */}
          <Box sx={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              onClick={onNewChat}
              sx={{
                bgcolor: '#f5f5f5',
                '&:hover': {
                  bgcolor: '#e5e7eb',
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            bgcolor: '#ffffff',
          }}
        >
          {currentChat ? (
            <ChatMessages 
              messages={currentChat.messages} 
              onExampleClick={onSendMessage}
              onFlowOptionClick={onSendMessage}
              currentChatId={currentChatId}
              flowData={flowData}
              setFlowData={setFlowData}
              setChats={setChats}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                flexDirection: 'column',
                px: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#666666',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  mb: 1,
                }}
              >
                Start a new conversation
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#999999',
                  fontFamily: "'Inter', sans-serif",
                  textAlign: 'center',
                }}
              >
                Click the + button to begin
              </Typography>
            </Box>
          )}
        </Box>

        {/* Input */}
        {currentChat && (
          <Box
            sx={{
              bgcolor: '#ffffff',
            }}
          >
            <ChatInput onSendMessage={onSendMessage} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatScreen;

