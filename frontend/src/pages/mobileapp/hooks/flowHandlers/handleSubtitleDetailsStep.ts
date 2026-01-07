import { Chat, ChatMessage, ShortsFlowData, FlowStep } from '../../types';
import { SubtitleCapitalizationMethod } from '@/api/models/SubtitleCapitalizationMethod';
import { SubtitlePosition } from '@/api/models/SubtitlePosition';
import { subtitleRegularColorOptions, subtitleMessageBoxColorOptions, roundedBoxColorOptions } from '@/constants/SubtitleColors';
import { createSummaryMessage } from './createSummaryMessage';

export const handleSubtitleDetailsStep = (
  text: string,
  currentFlow: ShortsFlowData,
  currentChatId: string,
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>,
  setFlowData: React.Dispatch<React.SetStateAction<Record<string, ShortsFlowData>>>,
  dispatchGenerationEvent: (flow: ShortsFlowData) => void,
): { newFlow: ShortsFlowData; aiResponse: ChatMessage | null; shouldReturn: boolean } => {
  const lower = text.toLowerCase();
  let updatedFlow: ShortsFlowData = { ...currentFlow };
  let hasUpdate = false;
  
  // Check for color selection (if color-supporting style)
  if (currentFlow.subtitleStyle && ['regular', 'rounded_box', 'message_box'].includes(currentFlow.subtitleStyle)) {
    const colorOptions = currentFlow.subtitleStyle === 'regular' ? subtitleRegularColorOptions :
                        currentFlow.subtitleStyle === 'rounded_box' ? roundedBoxColorOptions :
                        subtitleMessageBoxColorOptions;
    
    // Check if text starts with "Color: " or is just a color name
    let colorName = '';
    if (lower.startsWith('color: ')) {
      colorName = text.substring(7).trim();
    } else {
      // Try to find color by name
      for (const color of colorOptions) {
        if (lower === color.name.toLowerCase() || lower.includes(color.name.toLowerCase())) {
          colorName = color.name;
          break;
        }
      }
    }
    
    if (colorName) {
      const selectedColor = colorOptions.find(c => c.name.toLowerCase() === colorName.toLowerCase());
      if (selectedColor) {
        updatedFlow.subtitleColor = selectedColor;
        hasUpdate = true;
      }
    }
  }
  
  // Check for capitalization selection
  const capitalizationMap: Record<string, SubtitleCapitalizationMethod> = {
    'default': SubtitleCapitalizationMethod.Default,
    'uppercase': SubtitleCapitalizationMethod.Uppercase,
    'lowercase': SubtitleCapitalizationMethod.Lowercase,
    'capitalize': SubtitleCapitalizationMethod.CapitalizeFirstCharInWords,
    'capitalize first': SubtitleCapitalizationMethod.CapitalizeFirstCharInWords,
    'capitalize first char': SubtitleCapitalizationMethod.CapitalizeFirstCharInWords,
  };
  
  for (const [key, value] of Object.entries(capitalizationMap)) {
    if (lower.includes(key) && !lower.startsWith('color:')) {
      updatedFlow.subtitleCapitalizationMethod = value;
      hasUpdate = true;
      break;
    }
  }
  
  // Check for position selection
  const positionMap: Record<string, SubtitlePosition> = {
    'top': SubtitlePosition.Top,
    'center': SubtitlePosition.Center,
    'bottom': SubtitlePosition.Bottom,
  };
  
  for (const [key, value] of Object.entries(positionMap)) {
    if (lower.includes(key) && !lower.startsWith('color:')) {
      updatedFlow.subtitlePosition = value;
      hasUpdate = true;
      break;
    }
  }
  
  if (hasUpdate) {
    // Update flow data
    setTimeout(() => {
      setFlowData(prev => ({ ...prev, [currentChatId]: updatedFlow }));
    }, 0);
    
    // Check if all required fields are filled
    const hasColor = currentFlow.subtitleStyle === 'default' || updatedFlow.subtitleColor;
    const hasCapitalization = !!updatedFlow.subtitleCapitalizationMethod;
    const hasPosition = !!updatedFlow.subtitlePosition;
    
    if (hasColor && hasCapitalization && hasPosition) {
      // All details selected, move to summary
      const finalFlow: ShortsFlowData = {
        ...updatedFlow,
        step: 'showing_summary' as FlowStep,
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
      // Update flow but stay in same step
      return { newFlow: updatedFlow, aiResponse: null, shouldReturn: false };
    }
  }
  
  // No valid selection
  return { newFlow: currentFlow, aiResponse: null, shouldReturn: false };
};

