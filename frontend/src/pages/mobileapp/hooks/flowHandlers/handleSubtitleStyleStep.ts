import { Chat, ChatMessage, ShortsFlowData, FlowStep } from '../../types';
import { subtitleRegularColorOptions, subtitleMessageBoxColorOptions, roundedBoxColorOptions } from '@/constants/SubtitleColors';
import { createSummaryMessage } from './createSummaryMessage';

export const handleSubtitleStyleStep = (
  text: string,
  currentFlow: ShortsFlowData,
  currentChatId: string,
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>,
  setFlowData: React.Dispatch<React.SetStateAction<Record<string, ShortsFlowData>>>,
  dispatchGenerationEvent: (flow: ShortsFlowData) => void,
): { newFlow: ShortsFlowData; aiResponse: ChatMessage | null; shouldReturn: boolean } => {
  // First check if user selected a color (if subtitle style is already selected and we're in asking_subtitle_style step)
  if (currentFlow.subtitleStyle && ['regular', 'rounded_box', 'message_box'].includes(currentFlow.subtitleStyle) && currentFlow.step === 'asking_subtitle_style') {
    const colorOptions = currentFlow.subtitleStyle === 'regular' ? subtitleRegularColorOptions :
                        currentFlow.subtitleStyle === 'rounded_box' ? roundedBoxColorOptions :
                        subtitleMessageBoxColorOptions;
    
    const lower = text.toLowerCase();
    let selectedColor: any = null;
    for (const color of colorOptions) {
      if (lower === color.name.toLowerCase() || lower.includes(color.name.toLowerCase())) {
        selectedColor = color;
        break;
      }
    }
    
    if (selectedColor) {
      // User selected a color from dialog - proceed to summary
      const newFlow: ShortsFlowData = { ...currentFlow, step: 'showing_summary' as FlowStep, subtitleColor: selectedColor, isSubtitleOnly: currentFlow.isSubtitleOnly };
      setTimeout(() => {
        setFlowData(prev => ({ ...prev, [currentChatId]: newFlow }));
        const summaryMessage = createSummaryMessage(newFlow);
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, summaryMessage] }
              : chat
          )
        );
      }, 100);
      return { newFlow, aiResponse: null, shouldReturn: true };
    }
  }
  
  // Check for subtitle style selection
  const styleMap: Record<string, string> = {
    'default': 'default',
    'regular': 'regular',
    'rounded box': 'rounded_box',
    'rounded': 'rounded_box',
    'message box': 'message_box',
    'message': 'message_box',
  };
  const lower = text.toLowerCase();
  let subtitleStyle: string | undefined;
  for (const [key, value] of Object.entries(styleMap)) {
    if (lower.includes(key)) {
      subtitleStyle = value;
      break;
    }
  }
  
  if (subtitleStyle) {
    // Update the last message (subtitle style selection message) to mark selected style
    setTimeout(() => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) => {
                  if (msg.flowData?.type === 'subtitle_style') {
                    return {
                      ...msg,
                      flowData: {
                        ...msg.flowData,
                        selectedSubtitleStyle: subtitleStyle,
                        showColorButton: true,
                        selectedColor: undefined,
                      },
                    };
                  }
                  return msg;
                }),
              }
            : chat
        )
      );
    }, 0);
    
    // Move to subtitle details step (color, capitalization, position all in one)
    const newFlow: ShortsFlowData = { 
      ...currentFlow, 
      step: 'asking_subtitle_details' as FlowStep, 
      subtitleStyle, 
      isSubtitleOnly: currentFlow.isSubtitleOnly 
    };
    
    const colorOptions = subtitleStyle === 'regular' ? subtitleRegularColorOptions :
                        subtitleStyle === 'rounded_box' ? roundedBoxColorOptions :
                        subtitleMessageBoxColorOptions;
    
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Great! Now customize your subtitles. Choose a color, capitalization style, and position.',
      isUser: false,
      timestamp: new Date(),
      flowData: {
        type: 'subtitle_details',
        selectedSubtitleStyle: subtitleStyle,
        showColorButton: subtitleStyle !== 'default' && ['regular', 'rounded_box', 'message_box'].includes(subtitleStyle),
        options: subtitleStyle !== 'default' ? colorOptions : undefined,
      },
    };
    
    return { newFlow, aiResponse, shouldReturn: false };
  } else {
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Please choose a subtitle style.',
      isUser: false,
      timestamp: new Date(),
    };
    return { newFlow: currentFlow, aiResponse, shouldReturn: false };
  }
};
