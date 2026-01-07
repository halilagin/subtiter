import { Chat, ChatMessage, ShortsFlowData, FlowStep } from '../../types';
import { subtitleRegularColorOptions, subtitleMessageBoxColorOptions, roundedBoxColorOptions } from '@/constants/SubtitleColors';
import { createSummaryMessage } from './createSummaryMessage';

export const handleSubtitleColorStep = (
  text: string,
  currentFlow: ShortsFlowData,
  currentChatId: string,
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>,
  setFlowData: React.Dispatch<React.SetStateAction<Record<string, ShortsFlowData>>>,
  dispatchGenerationEvent: (flow: ShortsFlowData) => void,
): { newFlow: ShortsFlowData; aiResponse: ChatMessage | null; shouldReturn: boolean } => {
  const colorOptions = currentFlow.subtitleStyle === 'regular' ? subtitleRegularColorOptions :
                      currentFlow.subtitleStyle === 'rounded_box' ? roundedBoxColorOptions :
                      subtitleMessageBoxColorOptions;
  
  const lower = text.toLowerCase();
  let selectedColor: any = null;
  
  // Try to find color by name
  for (const color of colorOptions) {
    if (lower.includes(color.name.toLowerCase())) {
      selectedColor = color;
      break;
    }
  }
  
  // If not found by name, try to find by index (if user typed a number)
  if (!selectedColor) {
    const num = parseInt(text.trim());
    if (!isNaN(num) && num > 0 && num <= colorOptions.length) {
      selectedColor = colorOptions[num - 1];
    }
  }
  
  if (selectedColor) {
    // Move to capitalization step after color selection
    const newFlow: ShortsFlowData = { 
      ...currentFlow, 
      step: 'asking_subtitle_capitalization' as FlowStep, 
      subtitleColor: selectedColor, 
      isSubtitleOnly: currentFlow.isSubtitleOnly 
    };
    
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Great! Now choose a capitalization style.',
      isUser: false,
      timestamp: new Date(),
      flowData: {
        type: 'subtitle_capitalization',
        options: ['Default', 'Uppercase', 'Lowercase', 'Capitalize First Char'],
      },
    };
    
    return { newFlow, aiResponse, shouldReturn: false };
  } else {
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Please choose a color from the options above.',
      isUser: false,
      timestamp: new Date(),
    };
    return { newFlow: currentFlow, aiResponse, shouldReturn: false };
  }
};

