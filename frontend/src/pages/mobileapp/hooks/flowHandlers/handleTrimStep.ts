import { Chat, ChatMessage, ShortsFlowData, FlowStep } from '../../types';
import { VideoProcessingApplication } from '@/api/models/VideoProcessingApplication';
import { EventType } from '@/events';
import { createSummaryMessage } from './createSummaryMessage';

export const handleTrimStep = (
  text: string,
  currentFlow: ShortsFlowData,
  currentChatId: string,
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>,
  setFlowData: React.Dispatch<React.SetStateAction<Record<string, ShortsFlowData>>>,
): { newFlow: ShortsFlowData; aiResponse: ChatMessage | null; shouldReturn: boolean } => {
  // Check if user clicked "Apply Trim" or "Next" button
  const lower = text.toLowerCase();
  const isDone = lower.includes('next') || lower.includes('apply') || lower.includes('apply trim');

  // If "Done" or "Apply Trim" is clicked, save current trim and move to next or complete
  if (isDone && currentFlow.trimStart !== undefined && currentFlow.trimEnd !== undefined) {
    const currentTrimIndex = currentFlow.trimIndex || 0;
    const trimCount = currentFlow.trimCount || 1;
    const existingTrims = currentFlow.trims || [];
    
    // Add current trim to the array
    const updatedTrims = [...existingTrims, {
      start: currentFlow.trimStart,
      end: currentFlow.trimEnd,
    }];

    // Check if we need to ask for more trims
    if (currentTrimIndex < trimCount - 1) {
      // Move to next trim
      const nextTrimIndex = currentTrimIndex + 1;
      const videoDuration = currentFlow.videoDuration || 300;
      const newFlow: ShortsFlowData = {
        ...currentFlow,
        step: 'asking_trim' as FlowStep,
        trimIndex: nextTrimIndex,
        trims: updatedTrims,
        trimStart: 0,
        trimEnd: videoDuration / 2,
        isTrimOnly: currentFlow.isTrimOnly,
      };

      setTimeout(() => {
        setFlowData(prev => ({ ...prev, [currentChatId]: newFlow }));
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: `Done! Select the start and end time for trim ${nextTrimIndex + 1}.`,
          isUser: false,
          timestamp: new Date(),
          flowData: {
            type: 'trim',
            videoDuration: videoDuration,
            trimStart: 0,
            trimEnd: videoDuration / 2,
            trimIndex: nextTrimIndex,
            trimCount: trimCount,
          },
        };

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, aiMessage] }
              : chat
          )
        );
      }, 500);

      return { newFlow, aiResponse: null, shouldReturn: true };
    } else {
      // All trims are done, show summary
      const finalFlow: ShortsFlowData = {
        ...currentFlow,
        step: 'showing_summary' as FlowStep,
        trims: updatedTrims,
        isTrimOnly: currentFlow.isTrimOnly,
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
    }
  }

  // Parse trim values from text (e.g., "0:30 to 2:00" or "30 to 120")
  let trimStart: number | null = null;
  let trimEnd: number | null = null;

  // Try to parse "X:XX to Y:YY" format
  const timeRangeMatch = text.match(/(\d+):(\d+)\s+to\s+(\d+):(\d+)/i);
  if (timeRangeMatch) {
    const startMinutes = parseInt(timeRangeMatch[1]);
    const startSeconds = parseInt(timeRangeMatch[2]);
    const endMinutes = parseInt(timeRangeMatch[3]);
    const endSeconds = parseInt(timeRangeMatch[4]);
    trimStart = startMinutes * 60 + startSeconds;
    trimEnd = endMinutes * 60 + endSeconds;
  } else {
    // Try to parse "X to Y" format (seconds)
    const secondsRangeMatch = text.match(/(\d+)\s+to\s+(\d+)/i);
    if (secondsRangeMatch) {
      trimStart = parseInt(secondsRangeMatch[1]);
      trimEnd = parseInt(secondsRangeMatch[2]);
    } else {
      // Try to parse single numbers
      const numbers = text.match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        trimStart = parseInt(numbers[0]);
        trimEnd = parseInt(numbers[1]);
      }
    }
  }

  // If we parsed trim values, update the flow but don't proceed yet
  if (trimStart !== null && trimEnd !== null) {
    const videoDuration = currentFlow.videoDuration || 300;
    if (trimStart >= 0 && trimEnd > trimStart && trimEnd <= videoDuration) {
      const newFlow: ShortsFlowData = {
        ...currentFlow,
        trimStart,
        trimEnd,
        isTrimOnly: currentFlow.isTrimOnly,
      };
      setFlowData(prev => ({ ...prev, [currentChatId]: newFlow }));
      return { newFlow, aiResponse: null, shouldReturn: false };
    }
  }

  // Invalid input or no action needed
  return { newFlow: currentFlow, aiResponse: null, shouldReturn: false };
};

