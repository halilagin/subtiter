import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import ChatScreen from './ChatScreen';
import SubtiterAdAnimation from './SubtiterAdAnimation';
import { Chat, ShortsFlowData } from './types';
import { useShortsFlow } from './hooks/useShortsFlow';
import { useChatFlow } from './hooks/useChatFlow';

const SubtiterChatbot = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showAdAnimation, setShowAdAnimation] = useState(false);
  const { flowData, setFlowData } = useShortsFlow();

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
    setFlowData(prev => ({ ...prev, [newChat.id]: { step: 'idle' } }));
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const { handleSendMessage } = useChatFlow(chats, setChats, currentChatId, setCurrentChatId, flowData, setFlowData);

  if (showAdAnimation) {
    return (
      <SubtiterAdAnimation 
        onComplete={() => setShowAdAnimation(false)}
      />
    );
  }

  if (!isAuthenticated) {
    return <WelcomeScreen onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  return (
    <ChatScreen
      chats={chats}
      currentChatId={currentChatId}
      onNewChat={handleNewChat}
      onSelectChat={handleSelectChat}
      onSendMessage={handleSendMessage}
      flowData={flowData}
      setFlowData={setFlowData}
      setChats={setChats}
    />
  );
};

export default SubtiterChatbot;

