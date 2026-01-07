import { ChatMessage, ShortsFlowData, FlowStep } from '../../types';

export const handleCountStep = (
  text: string,
  currentFlow: ShortsFlowData,
  parseCount: (text: string) => number | null,
): { newFlow: ShortsFlowData; aiResponse: ChatMessage | null } => {
  const count = parseCount(text);
  if (count !== null) {
    const newFlow: ShortsFlowData = { ...currentFlow, step: 'asking_duration' as FlowStep, count };
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: `Perfect! ${count === -1 ? 'Auto' : count} shorts. How long should each short be?`,
      isUser: false,
      timestamp: new Date(),
      flowData: {
        type: 'duration',
        options: ['0.5 min', '1 min', '2 min', '2.5 min', 'Auto'],
      },
    };
    return { newFlow, aiResponse };
  } else {
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Please enter a number between 1-10 or "Auto" for the number of shorts.',
      isUser: false,
      timestamp: new Date(),
    };
    return { newFlow: currentFlow, aiResponse };
  }
};

