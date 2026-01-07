import { ChatMessage, ShortsFlowData, FlowStep } from '../../types';
import { LANGUAGES } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/languages';

export const handleDurationStep = (
  text: string,
  currentFlow: ShortsFlowData,
  parseDuration: (text: string) => number | null,
): { newFlow: ShortsFlowData; aiResponse: ChatMessage | null } => {
  const duration = parseDuration(text);
  if (duration !== null) {
    const newFlow: ShortsFlowData = { ...currentFlow, step: 'asking_language' as FlowStep, duration };
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: `Got it! ${duration === -1 ? 'Auto' : `${duration} seconds`} per short. What language should I use?`,
      isUser: false,
      timestamp: new Date(),
      flowData: {
        type: 'language',
        options: [...LANGUAGES.map(lang => lang.name), 'Auto'],
      },
    };
    return { newFlow, aiResponse };
  } else {
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Please choose a duration: 0.5 min, 1 min, 2 min, 2.5 min, or Auto.',
      isUser: false,
      timestamp: new Date(),
    };
    return { newFlow: currentFlow, aiResponse };
  }
};

