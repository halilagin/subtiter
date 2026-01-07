import { Chat, ChatMessage, ShortsFlowData, FlowStep } from '../types';
import { useShortsFlow } from './useShortsFlow';
import { handleIdleStep } from './flowHandlers/handleIdleStep';
import { handleCountStep } from './flowHandlers/handleCountStep';
import { handleDurationStep } from './flowHandlers/handleDurationStep';
import { handleLanguageStep } from './flowHandlers/handleLanguageStep';
import { handleReframeStep } from './flowHandlers/handleReframeStep';
import { handleSubtitleStyleStep } from './flowHandlers/handleSubtitleStyleStep';
import { handleSubtitleDetailsStep } from './flowHandlers/handleSubtitleDetailsStep';
import { handleSubtitleCapitalizationStep } from './flowHandlers/handleSubtitleCapitalizationStep';
import { handleSubtitlePositionStep } from './flowHandlers/handleSubtitlePositionStep';
import { handleSubtitleStyleWithColor } from './flowHandlers/handleSubtitleStyleWithColor';
import { handleSubtitleColorStep } from './flowHandlers/handleSubtitleColorStep';
import { handleTrimCountStep } from './flowHandlers/handleTrimCountStep';
import { handleTrimStep } from './flowHandlers/handleTrimStep';
import { handleSummaryStep } from './flowHandlers/handleSummaryStep';

export const useChatFlow = (
  chats: Chat[],
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>,
  currentChatId: string | null,
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>,
  flowData: Record<string, ShortsFlowData>,
  setFlowData: React.Dispatch<React.SetStateAction<Record<string, ShortsFlowData>>>,
) => {
  const { parseCount, parseDuration, parseReframe, parseLanguage, dispatchGenerationEvent } = useShortsFlow();

  const handleSendMessage = (text: string) => {
    if (!currentChatId) {
      // Create new chat if no current chat
      const newChat: Chat = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
      };
      setChats([newChat, ...chats]);
      setCurrentChatId(newChat.id);
      setFlowData(prev => ({ ...prev, [newChat.id]: { step: 'idle' } }));
      return;
    }

    const currentFlow: ShortsFlowData = (flowData[currentChatId] || { step: 'idle' as FlowStep }) as ShortsFlowData;

    // Check if user wants to create video (idle step)
    if (currentFlow.step === 'idle') {
      const handled = handleIdleStep(text, currentChatId, setChats, setFlowData);
      if (handled) {
        return;
      }
    }

    // Handle flow responses
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              title: chat.messages.length === 0 ? text.substring(0, 30) : chat.title,
            }
          : chat
      )
    );

    // Handle summary step immediately (before setTimeout) to ensure message is added
    if (currentFlow.step === 'showing_summary') {
      const result = handleSummaryStep(
        text,
        currentFlow,
        currentChatId,
        setChats,
        setFlowData,
        dispatchGenerationEvent
      );
      // handleSummaryStep already adds the message via setChats, so we just return
      return;
    }

    // Declare variables outside setTimeout
    let newFlow: ShortsFlowData = { ...currentFlow };
    let aiResponse: ChatMessage | null = null;

    setTimeout(() => {
      if (currentFlow.step === 'asking_count') {
        const result = handleCountStep(text, currentFlow, parseCount);
        newFlow = result.newFlow;
        aiResponse = result.aiResponse;
      } else if (currentFlow.step === 'asking_duration') {
        const result = handleDurationStep(text, currentFlow, parseDuration);
        newFlow = result.newFlow;
        aiResponse = result.aiResponse;
      } else if (currentFlow.step === 'asking_language') {
        const result = handleLanguageStep(text, currentFlow, parseLanguage);
        newFlow = result.newFlow;
        aiResponse = result.aiResponse;
      } else if (currentFlow.step === 'asking_reframe') {
        const result = handleReframeStep(text, currentFlow, parseReframe);
        newFlow = result.newFlow;
        aiResponse = result.aiResponse;
      } else if (currentFlow.step === 'asking_subtitle_style') {
        const result = handleSubtitleStyleStep(
          text,
          currentFlow,
          currentChatId,
          setChats,
          setFlowData,
          dispatchGenerationEvent
        );
        newFlow = result.newFlow;
        aiResponse = result.aiResponse;
        if (result.shouldReturn) {
          return;
        }
      } else if (currentFlow.step === 'asking_subtitle_details') {
        const result = handleSubtitleDetailsStep(
          text,
          currentFlow,
          currentChatId,
          setChats,
          setFlowData,
          dispatchGenerationEvent
        );
        newFlow = result.newFlow;
        aiResponse = result.aiResponse;
        
        // Update user message to "Color: {colorName}" format if color was selected
        if (newFlow.subtitleColor && newFlow.subtitleColor !== currentFlow.subtitleColor) {
          setTimeout(() => {
            setChats((prevChats) =>
              prevChats.map((chat) =>
                chat.id === currentChatId
                  ? {
                      ...chat,
                      messages: chat.messages.map((msg, idx) => {
                        // Update the last user message
                        if (idx === chat.messages.length - 1 && msg.isUser) {
                          const colorName = newFlow.subtitleColor.name.charAt(0).toUpperCase() + newFlow.subtitleColor.name.slice(1).toLowerCase();
                          return {
                            ...msg,
                            text: `Color: ${colorName}`,
                          };
                        }
                        return msg;
                      }),
                    }
                  : chat
              )
            );
          }, 0);
        }
        
        if (result.shouldReturn) {
          return;
        }
      } else if (currentFlow.step === 'asking_subtitle_capitalization') {
        const result = handleSubtitleCapitalizationStep(
          text,
          currentFlow,
          currentChatId,
          setChats,
          setFlowData
        );
        newFlow = result.newFlow;
        aiResponse = result.aiResponse;
        if (result.shouldReturn) {
          return;
        }
      } else if (currentFlow.step === 'asking_subtitle_position') {
        const result = handleSubtitlePositionStep(
          text,
          currentFlow,
          currentChatId,
          setChats,
          setFlowData,
          dispatchGenerationEvent
        );
        newFlow = result.newFlow;
        aiResponse = result.aiResponse;
        if (result.shouldReturn) {
          return;
        }
      } else if ((currentFlow.step as string) === 'asking_subtitle_details' && (currentFlow as any).subtitleStyle && (currentFlow as ShortsFlowData).subtitleStyle) {
        // Handle color selection from dialog in subtitle_details step
        const result = handleSubtitleStyleWithColor(
          text,
          currentFlow,
          currentChatId,
          setChats,
          setFlowData,
          dispatchGenerationEvent
        );
        newFlow = result.newFlow;
        aiResponse = result.aiResponse;
        
        // Update user message to "Color: {colorName}" format if color was selected
        if (newFlow.subtitleColor && newFlow.subtitleColor !== currentFlow.subtitleColor) {
          setTimeout(() => {
            setChats((prevChats) =>
              prevChats.map((chat) =>
                chat.id === currentChatId
                  ? {
                      ...chat,
                      messages: chat.messages.map((msg, idx) => {
                        // Update the last user message
                        if (idx === chat.messages.length - 1 && msg.isUser) {
                          const colorName = newFlow.subtitleColor.name.charAt(0).toUpperCase() + newFlow.subtitleColor.name.slice(1).toLowerCase();
                          return {
                            ...msg,
                            text: `Color: ${colorName}`,
                          };
                        }
                        return msg;
                      }),
                    }
                  : chat
              )
            );
          }, 0);
        }
        
        if (result.shouldReturn) {
          return;
        }
      } else if (currentFlow.step === 'asking_subtitle_color') {
        const result = handleSubtitleColorStep(
          text,
          currentFlow,
          currentChatId,
          setChats,
          setFlowData,
          dispatchGenerationEvent
        );
        newFlow = result.newFlow;
        aiResponse = result.aiResponse;
        
        // Update user message to "Color: {colorName}" format if color was selected
        if (newFlow.subtitleColor && newFlow.subtitleColor !== currentFlow.subtitleColor) {
          setTimeout(() => {
            setChats((prevChats) =>
              prevChats.map((chat) =>
                chat.id === currentChatId
                  ? {
                      ...chat,
                      messages: chat.messages.map((msg, idx) => {
                        // Update the last user message
                        if (idx === chat.messages.length - 1 && msg.isUser) {
                          const colorName = newFlow.subtitleColor.name.charAt(0).toUpperCase() + newFlow.subtitleColor.name.slice(1).toLowerCase();
                          return {
                            ...msg,
                            text: `Color: ${colorName}`,
                          };
                        }
                        return msg;
                      }),
                    }
                  : chat
              )
            );
          }, 0);
        }
        
        if (result.shouldReturn) {
          return;
        }
      } else if (currentFlow.step === 'asking_trim_count') {
        const result = handleTrimCountStep(
          text,
          currentFlow,
          currentChatId,
          setChats,
          setFlowData
        );
        newFlow = result.newFlow;
        aiResponse = result.aiResponse;
        if (result.shouldReturn) {
          return;
        }
      } else if (currentFlow.step === 'asking_trim') {
        const result = handleTrimStep(
          text,
          currentFlow,
          currentChatId,
          setChats,
          setFlowData
        );
        newFlow = result.newFlow;
        aiResponse = result.aiResponse;
        if (result.shouldReturn) {
          return;
        }
      }

      if (aiResponse) {
        setFlowData(prev => ({ ...prev, [currentChatId]: newFlow }));
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, aiResponse!] }
              : chat
          )
        );
      } else if (newFlow.step !== currentFlow.step || newFlow.subtitleStyle !== currentFlow.subtitleStyle) {
        // Update flow data even if no new message (for subtitle style selection with color button)
        setFlowData(prev => ({ ...prev, [currentChatId]: newFlow }));
      }
    }, 500);
  };

  return {
    handleSendMessage,
  };
};

