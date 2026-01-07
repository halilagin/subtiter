import { Chat, ChatMessage, ShortsFlowData, FlowStep } from '../../types';

export const handleTrimCountStep = (
  text: string,
  currentFlow: ShortsFlowData,
  currentChatId: string,
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>,
  setFlowData: React.Dispatch<React.SetStateAction<Record<string, ShortsFlowData>>>,
): { newFlow: ShortsFlowData; aiResponse: ChatMessage | null; shouldReturn: boolean } => {
  // Parse trim count (1, 2, or 3)
  const lower = text.toLowerCase();
  let trimCount: number | null = null;

  if (lower.includes('1') || lower.includes('one')) {
    trimCount = 1;
  } else if (lower.includes('2') || lower.includes('two')) {
    trimCount = 2;
  } else if (lower.includes('3') || lower.includes('three')) {
    trimCount = 3;
  } else {
    // Try to parse as number
    const num = parseInt(text.trim());
    if (!isNaN(num) && num >= 1 && num <= 3) {
      trimCount = num;
    }
  }

  if (trimCount !== null) {
    const newFlow: ShortsFlowData = {
      ...currentFlow,
      step: 'asking_trim' as FlowStep,
      trimCount,
      trimIndex: 0,
      trims: [],
      trimStart: 0,
      trimEnd: (currentFlow.videoDuration || 300) / 2,
      isTrimOnly: currentFlow.isTrimOnly,
    };

    setTimeout(() => {
      setFlowData(prev => ({ ...prev, [currentChatId]: newFlow }));
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Perfect! ${trimCount} trim${trimCount > 1 ? 's' : ''}. Select the start and end time for trim 1.`,
        isUser: false,
        timestamp: new Date(),
        flowData: {
          type: 'trim',
          videoDuration: currentFlow.videoDuration || 300,
          trimStart: 0,
          trimEnd: (currentFlow.videoDuration || 300) / 2,
          trimIndex: 0,
          trimCount,
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

      return { newFlow, aiResponse: null, shouldReturn: true };
    } else {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Please choose a number between 1 and 3 for the number of trims.',
        isUser: false,
        timestamp: new Date(),
      };
      return { newFlow: currentFlow, aiResponse, shouldReturn: false };
    }
};

