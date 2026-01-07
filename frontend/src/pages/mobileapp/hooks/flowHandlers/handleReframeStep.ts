import { ChatMessage, ShortsFlowData, FlowStep } from '../../types';

export const handleReframeStep = (
  text: string,
  currentFlow: ShortsFlowData,
  parseReframe: (text: string) => any,
): { newFlow: ShortsFlowData; aiResponse: ChatMessage | null } => {
  const reframe = parseReframe(text);
  if (reframe !== null) {
    const newFlow: ShortsFlowData = { ...currentFlow, step: 'asking_subtitle_style' as FlowStep, reframe };
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Great! Now choose a subtitle style:',
      isUser: false,
      timestamp: new Date(),
      flowData: {
        type: 'subtitle_style',
        options: ['Default', 'Regular', 'Rounded Box', 'Message Box'],
        showColorButton: true,
      },
    };
    return { newFlow, aiResponse };
  } else {
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Please choose an aspect ratio: Instagram Reels, Portrait, Square, Landscape, or Keep Original.',
      isUser: false,
      timestamp: new Date(),
    };
    return { newFlow: currentFlow, aiResponse };
  }
};

