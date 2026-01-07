import { Chat, ChatMessage, ShortsFlowData, FlowStep } from '../../types';
import { VideoProcessingApplication } from '@/api/models/VideoProcessingApplication';
import { EventType } from '@/events';

export const handleSummaryStep = (
  text: string,
  currentFlow: ShortsFlowData,
  currentChatId: string,
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>,
  setFlowData: React.Dispatch<React.SetStateAction<Record<string, ShortsFlowData>>>,
  dispatchGenerationEvent: (flow: ShortsFlowData) => void,
): { newFlow: ShortsFlowData; aiResponse: ChatMessage | null; shouldReturn: boolean } => {
  const lower = text.toLowerCase();
  
  // Check if user confirmed (approve, confirm, yes, ok, generate, create, start)
  if (lower.includes('approve') || lower.includes('confirm') || lower.includes('yes') || 
      lower.includes('ok') || lower.includes('generate') || lower.includes('create') || 
      lower.includes('start') || lower.includes('proceed')) {
    
    const newFlow: ShortsFlowData = {
      ...currentFlow,
      step: 'complete' as FlowStep,
    };

    const generatingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: (currentFlow.isTrimOnly ? 'Your video is being trimmed' : 
            currentFlow.isSubtitleOnly ? 'Your video is being created' : 
            'Your video is being created') + '\n\nThis may take up to 5 minutes. Please wait.',
      isUser: false,
      timestamp: new Date(),
    };
    
    // Add generating message immediately
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, generatingMessage] }
          : chat
      )
    );
    
    // Update flow data
    setFlowData(prev => ({ ...prev, [currentChatId]: newFlow }));
    
    // Dispatch generation events after a short delay
    setTimeout(() => {
      // Handle trim-only flow separately
      if (currentFlow.isTrimOnly && currentFlow.trims) {
        // Dispatch trim event for all trims
        currentFlow.trims.forEach((trim, index) => {
          const event = new CustomEvent(EventType.GENERATION_STARTED, {
            detail: {
              application: VideoProcessingApplication.ApplyTrim,
              videoId: currentFlow.videoId || 'mock-video-id',
              trimStart: trim.start,
              trimEnd: trim.end,
              trimIndex: index,
            },
          });
          window.dispatchEvent(event);
        });
      } else {
        dispatchGenerationEvent(currentFlow);
      }
    }, 100);
    
    return { newFlow, aiResponse: null, shouldReturn: true };
  } else {
    // User didn't confirm, ask again
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Please confirm to proceed with generation.',
      isUser: false,
      timestamp: new Date(),
    };
    return { newFlow: currentFlow, aiResponse, shouldReturn: false };
  }
};


