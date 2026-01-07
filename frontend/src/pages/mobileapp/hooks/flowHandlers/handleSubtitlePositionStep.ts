import { Chat, ChatMessage, ShortsFlowData, FlowStep } from '../../types';
import { SubtitlePosition } from '@/api/models/SubtitlePosition';
import { createSummaryMessage } from './createSummaryMessage';

export const handleSubtitlePositionStep = (
  text: string,
  currentFlow: ShortsFlowData,
  currentChatId: string,
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>,
  setFlowData: React.Dispatch<React.SetStateAction<Record<string, ShortsFlowData>>>,
  dispatchGenerationEvent: (flow: ShortsFlowData) => void,
): { newFlow: ShortsFlowData; aiResponse: ChatMessage | null; shouldReturn: boolean } => {
  const lower = text.toLowerCase();
  
  // Map text to position
  const positionMap: Record<string, SubtitlePosition> = {
    'top': SubtitlePosition.Top,
    'center': SubtitlePosition.Center,
    'bottom': SubtitlePosition.Bottom,
  };
  
  let selectedPosition: SubtitlePosition | null = null;
  for (const [key, value] of Object.entries(positionMap)) {
    if (lower.includes(key)) {
      selectedPosition = value;
      break;
    }
  }
  
  if (selectedPosition) {
    // Position is the last step before summary
    const finalFlow: ShortsFlowData = {
      ...currentFlow,
      step: 'showing_summary' as FlowStep,
      subtitlePosition: selectedPosition,
      isSubtitleOnly: currentFlow.isSubtitleOnly,
    };
    
    setTimeout(() => {
      setFlowData(prev => ({ ...prev, [currentChatId]: finalFlow }));
      const summaryMessage = createSummaryMessage(finalFlow);
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, summaryMessage] }
            : chat
        )
      );
    }, 100);
    
    return { newFlow: finalFlow, aiResponse: null, shouldReturn: true };
  } else {
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Please choose a position: Top, Center, or Bottom.',
      isUser: false,
      timestamp: new Date(),
    };
    return { newFlow: currentFlow, aiResponse, shouldReturn: false };
  }
};

