import { Chat, ChatMessage, ShortsFlowData, FlowStep } from '../../types';
import { SubtitleCapitalizationMethod } from '@/api/models/SubtitleCapitalizationMethod';

export const handleSubtitleCapitalizationStep = (
  text: string,
  currentFlow: ShortsFlowData,
  currentChatId: string,
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>,
  setFlowData: React.Dispatch<React.SetStateAction<Record<string, ShortsFlowData>>>,
): { newFlow: ShortsFlowData; aiResponse: ChatMessage | null; shouldReturn: boolean } => {
  const lower = text.toLowerCase();
  
  // Map text to capitalization method
  const capitalizationMap: Record<string, SubtitleCapitalizationMethod> = {
    'default': SubtitleCapitalizationMethod.Default,
    'uppercase': SubtitleCapitalizationMethod.Uppercase,
    'lowercase': SubtitleCapitalizationMethod.Lowercase,
    'capitalize': SubtitleCapitalizationMethod.CapitalizeFirstCharInWords,
    'capitalize first': SubtitleCapitalizationMethod.CapitalizeFirstCharInWords,
    'capitalize first char': SubtitleCapitalizationMethod.CapitalizeFirstCharInWords,
  };
  
  let selectedCapitalization: SubtitleCapitalizationMethod | null = null;
  for (const [key, value] of Object.entries(capitalizationMap)) {
    if (lower.includes(key)) {
      selectedCapitalization = value;
      break;
    }
  }
  
  if (selectedCapitalization) {
    // Move to position step after capitalization selection
    const newFlow: ShortsFlowData = {
      ...currentFlow,
      step: 'asking_subtitle_position' as FlowStep,
      subtitleCapitalizationMethod: selectedCapitalization,
      isSubtitleOnly: currentFlow.isSubtitleOnly,
    };
    
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Great! Now choose the subtitle position.',
      isUser: false,
      timestamp: new Date(),
      flowData: {
        type: 'subtitle_position',
        options: ['Top', 'Center', 'Bottom'],
      },
    };
    
    return { newFlow, aiResponse, shouldReturn: false };
  } else {
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Please choose a capitalization style: Default, Uppercase, Lowercase, or Capitalize First Char.',
      isUser: false,
      timestamp: new Date(),
    };
    return { newFlow: currentFlow, aiResponse, shouldReturn: false };
  }
};

