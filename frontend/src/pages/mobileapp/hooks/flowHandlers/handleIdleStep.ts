import { Chat, ChatMessage } from '../../types';

export const handleIdleStep = (
  text: string,
  currentChatId: string,
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>,
  setFlowData: React.Dispatch<React.SetStateAction<Record<string, any>>>,
): boolean => {
  const lowerText = text.toLowerCase();
  
  // Check if user wants to trim video
  if (lowerText.includes('trim') || (lowerText.includes('trim') && lowerText.includes('video'))) {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              title: chat.messages.length === 0 ? text.substring(0, 30) : chat.title,
            }
          : chat
      )
    );

    // Start flow - ask for trim count (trim-only flow)
    // For now, we'll use a mock video duration. In production, this should come from video selection
    const mockVideoDuration = 300; // 5 minutes default
    setFlowData(prev => ({ 
      ...prev, 
      [currentChatId]: { 
        step: 'asking_trim_count', 
        isTrimOnly: true,
        videoDuration: mockVideoDuration,
        trims: [],
      } 
    }));

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Great! How many trims would you like to create?',
        isUser: false,
        timestamp: new Date(),
        flowData: {
          type: 'trim_count',
          options: [1, 2, 3],
        },
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        )
      );
    }, 500);
    return true;
  }
  
  // Check if user wants to generate subtitles (skip to subtitle style selection)
  if (lowerText.includes('subtitle') || (lowerText.includes('generate') && lowerText.includes('subtitle'))) {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              title: chat.messages.length === 0 ? text.substring(0, 30) : chat.title,
            }
          : chat
      )
    );

    // Start flow - ask for subtitle style directly (subtitle-only flow)
    setFlowData(prev => ({ ...prev, [currentChatId]: { step: 'asking_subtitle_style', isSubtitleOnly: true } }));

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Great! Now choose a subtitle style.',
        isUser: false,
        timestamp: new Date(),
        flowData: {
          type: 'subtitle_style',
          options: ['Default', 'Regular', 'Rounded Box', 'Message Box'],
        },
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        )
      );
    }, 500);
    return true;
  }
  
  // Check if user wants to create video
  if (lowerText.includes('video') || lowerText.includes('short') || lowerText.includes('create') || lowerText.includes('generate')) {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              title: chat.messages.length === 0 ? text.substring(0, 30) : chat.title,
            }
          : chat
      )
    );

    // Start flow - ask for count
    setFlowData(prev => ({ ...prev, [currentChatId]: { step: 'asking_count' } }));

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Great! How many shorts would you like to create?',
        isUser: false,
        timestamp: new Date(),
        flowData: {
          type: 'count',
          options: [...Array.from({ length: 10 }, (_, i) => i + 1), 'Auto'],
        },
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        )
      );
    }, 500);
    return true;
  }
  
  return false;
};

