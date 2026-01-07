import { useState } from 'react';
import { LanguageCode } from '@/api/models/LanguageCode';
import { VideoAspectRatio } from '@/api/models/VideoAspectRatio';
import { VideoProcessingApplication } from '@/api/models/VideoProcessingApplication';
import { EventType } from '@/events';
import { SubtitleApplication as SubtitleApplicationInterface, SubtitleConfiguration } from '@/api/models';
import { SubtitleStyle } from '@/api/models/SubtitleStyle';
import { SubtitleCapitalizationMethod } from '@/api/models/SubtitleCapitalizationMethod';
import { SubtitlePosition } from '@/api/models/SubtitlePosition';
import { subtitleRegularColorOptions, subtitleMessageBoxColorOptions, roundedBoxColorOptions } from '@/constants/SubtitleColors';
import { LANGUAGES } from '../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/languages';
import { parseCount, parseDuration, parseReframe, parseLanguage } from './useShortsFlowParsers';
import { ShortsFlowData, FlowStep, ChatMessage, Chat } from '../types';

export const useShortsFlow = () => {
  const [flowData, setFlowData] = useState<Record<string, ShortsFlowData>>({});

  const dispatchGenerationEvent = (flow: ShortsFlowData) => {
    // Create subtitle configuration
    const subtitleStyle = flow.subtitleStyle || 'default';
    let subtitleConfig: SubtitleConfiguration;

    // Get capitalization and position from flow, with defaults
    const capitalizationMethod = flow.subtitleCapitalizationMethod || SubtitleCapitalizationMethod.Uppercase;
    const position = flow.subtitlePosition || SubtitlePosition.Center;
    
    if (subtitleStyle === 'default') {
      subtitleConfig = {
        id: 'default',
        name: 'default',
        subtitleStyle: SubtitleStyle.Regular,
        subtitleCapitalizationMethod: capitalizationMethod,
        subtitlePosition: position,
        subtitleLanguageCode: flow.language || LanguageCode.En,
      } as SubtitleConfiguration;
    } else {
      const color = flow.subtitleColor;
      if (subtitleStyle === 'regular' && color) {
        subtitleConfig = {
          id: 'regular',
          name: 'regular',
          subtitleStyle: SubtitleStyle.Regular,
          subtitleCapitalizationMethod: capitalizationMethod,
          subtitlePosition: position,
          subtitleLanguageCode: flow.language || LanguageCode.En,
          subtitleInactiveColor: color.videoColor.inactiveColor,
          subtitleActiveColor: color.videoColor.activeColor,
        } as SubtitleConfiguration;
      } else if (subtitleStyle === 'rounded_box' && color) {
        subtitleConfig = {
          id: 'rounded_box',
          name: 'rounded_box',
          subtitleStyle: SubtitleStyle.RoundedBox,
          subtitleCapitalizationMethod: capitalizationMethod,
          subtitlePosition: position,
          subtitleLanguageCode: flow.language || LanguageCode.En,
          subtitleBoxFontColor: color.ui.activeColor,
          subtitleBoxBackgroundColor: color.videoColor.activeBoxColor,
          subtitleInactiveColor: color.videoColor.inactiveColor,
          subtitleActiveColor: color.videoColor.activeColor,
          subtitleBoxCornerRadius: 8,
          subtitleBoxBorderThickness: 2,
        } as SubtitleConfiguration;
      } else if (subtitleStyle === 'message_box' && color) {
        subtitleConfig = {
          id: 'message_box',
          name: 'message_box',
          subtitleStyle: SubtitleStyle.MessageBox,
          subtitleCapitalizationMethod: capitalizationMethod,
          subtitlePosition: position,
          subtitleLanguageCode: flow.language || LanguageCode.En,
          subtitleBoxFontColor: color.ui.activeColor,
          subtitleBoxBackgroundColor: color.videoColor.activeBoxColor,
          subtitleInactiveColor: color.videoColor.inactiveColor,
          subtitleActiveColor: color.videoColor.activeColor,
        } as SubtitleConfiguration;
      } else {
        // Fallback
        subtitleConfig = {
          id: subtitleStyle,
          name: subtitleStyle,
          subtitleStyle: subtitleStyle === 'regular' ? SubtitleStyle.Regular :
                        subtitleStyle === 'rounded_box' ? SubtitleStyle.RoundedBox :
                        SubtitleStyle.MessageBox,
          subtitleCapitalizationMethod: capitalizationMethod,
          subtitlePosition: position,
          subtitleLanguageCode: flow.language || LanguageCode.En,
        } as SubtitleConfiguration;
      }
    }

    const subtitleApplication: SubtitleApplicationInterface = {
      subtitleConfiguration: [subtitleConfig],
    };

    // Check if this is a subtitle-only flow
    if (flow.isSubtitleOnly) {
      // Dispatch GENERATION_STARTED event for subtitle-only flow
      const event = new CustomEvent(EventType.GENERATION_STARTED, {
        detail: {
          application: VideoProcessingApplication.ApplySubtitles,
          videoId: flow.videoId || 'mock-video-id',
          subtitleApplication: subtitleApplication,
        },
      });
      window.dispatchEvent(event);
    } else {
      // Create short config for shorts generation
      const shortConfig = {
        segmentCount: flow.count === -1 ? undefined : flow.count,
        targetShortVideoDurationInSeconds: flow.duration === -1 ? undefined : flow.duration,
        videoLanguageCode: flow.language || LanguageCode.En,
        videoAspectRatio: flow.reframe || VideoAspectRatio._916,
        subtitleApplication,
      };

      // Dispatch GENERATION_STARTED event for shorts generation
      const event = new CustomEvent(EventType.GENERATION_STARTED, {
        detail: {
          application: VideoProcessingApplication.GenerateShorts,
          videoId: flow.videoId || 'mock-video-id',
          config: shortConfig,
        },
      });
      window.dispatchEvent(event);
    }
  };

  return {
    flowData,
    setFlowData,
    dispatchGenerationEvent,
    parseCount,
    parseDuration,
    parseReframe,
    parseLanguage,
  };
};

