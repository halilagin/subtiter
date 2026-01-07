import { Chat, ChatMessage, ShortsFlowData, FlowStep } from '../../types';
import { subtitleRegularColorOptions, subtitleMessageBoxColorOptions, roundedBoxColorOptions } from '@/constants/SubtitleColors';
import { createSummaryMessage } from './createSummaryMessage';

export const handleSubtitleStyleWithColor = (
  text: string,
  currentFlow: ShortsFlowData,
  currentChatId: string,
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>,
  setFlowData: React.Dispatch<React.SetStateAction<Record<string, ShortsFlowData>>>,
  dispatchGenerationEvent: (flow: ShortsFlowData) => void,
): { newFlow: ShortsFlowData; aiResponse: ChatMessage | null; shouldReturn: boolean } => {
  const subtitleStyle = currentFlow.subtitleStyle;
  const colorOptions = subtitleStyle === 'regular' ? subtitleRegularColorOptions :
                      subtitleStyle === 'rounded_box' ? roundedBoxColorOptions :
                      subtitleMessageBoxColorOptions;
  
  // Check if user selected a color (by name)
  const lower = text.toLowerCase();
  let selectedColor: any = null;
  for (const color of colorOptions) {
    if (lower === color.name.toLowerCase() || lower.includes(color.name.toLowerCase())) {
      selectedColor = color;
      break;
    }
  }
  
  if (selectedColor) {
    // User selected a color from dialog - update flow but stay in subtitle_details step
    const newFlow: ShortsFlowData = { 
      ...currentFlow, 
      subtitleColor: selectedColor, 
      isSubtitleOnly: currentFlow.isSubtitleOnly 
    };
    
    // Update the last message to show selected color
    setTimeout(() => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) => {
                  if (msg.flowData?.type === 'subtitle_details') {
                    return {
                      ...msg,
                      flowData: {
                        ...msg.flowData,
                        selectedColor: selectedColor,
                      },
                    };
                  }
                  return msg;
                }),
              }
            : chat
        )
      );
      setFlowData(prev => ({ ...prev, [currentChatId]: newFlow }));
    }, 0);
    
    return { newFlow, aiResponse: null, shouldReturn: false };
  }
  
  return { newFlow: currentFlow, aiResponse: null, shouldReturn: false };
};

