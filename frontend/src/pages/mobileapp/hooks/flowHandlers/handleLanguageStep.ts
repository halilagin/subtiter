import { ChatMessage, ShortsFlowData, FlowStep } from '../../types';
import { LANGUAGES } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/languages';

export const handleLanguageStep = (
  text: string,
  currentFlow: ShortsFlowData,
  parseLanguage: (text: string) => any,
): { newFlow: ShortsFlowData; aiResponse: ChatMessage | null } => {
  const language = parseLanguage(text);
  if (language !== null) {
    const newFlow: ShortsFlowData = { ...currentFlow, step: 'asking_reframe' as FlowStep, language };
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Perfect! What aspect ratio would you like?',
      isUser: false,
      timestamp: new Date(),
      flowData: {
        type: 'reframe',
        options: ['Instagram Reels (9:16)', 'Portrait (4:3)', 'Square (1:1)', 'Landscape (16:9)', 'Keep Original'],
      },
    };
    return { newFlow, aiResponse };
  } else {
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: `Please choose a language: ${LANGUAGES.map(lang => lang.name).join(', ')}, or Auto.`,
      isUser: false,
      timestamp: new Date(),
    };
    return { newFlow: currentFlow, aiResponse };
  }
};

