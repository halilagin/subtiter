import { ChatMessage, ShortsFlowData } from '../../types';
import { LANGUAGES } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/languages';
import { VideoAspectRatio } from '@/api/models/VideoAspectRatio';
import { SubtitleCapitalizationMethod } from '@/api/models/SubtitleCapitalizationMethod';
import { SubtitlePosition } from '@/api/models/SubtitlePosition';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getLanguageName = (code: string): string => {
  const lang = LANGUAGES.find(l => l.code === code);
  return lang ? lang.name : code;
};

const getAspectRatioName = (ratio: VideoAspectRatio): string => {
  const ratioMap: Partial<Record<VideoAspectRatio, string>> = {
    [VideoAspectRatio._916]: '9:16 (Vertical)',
    [VideoAspectRatio._169]: '16:9 (Horizontal)',
    [VideoAspectRatio._11]: '1:1 (Square)',
    [VideoAspectRatio._45]: '4:5',
    [VideoAspectRatio._23]: '2:3',
  };
  return ratioMap[ratio] || ratio;
};

const getSubtitleStyleName = (style: string): string => {
  const styleMap: Record<string, string> = {
    'default': 'Default',
    'regular': 'Regular',
    'rounded_box': 'Rounded Box',
    'message_box': 'Message Box',
  };
  return styleMap[style] || style;
};

const getCapitalizationName = (method: SubtitleCapitalizationMethod): string => {
  const methodMap: Record<SubtitleCapitalizationMethod, string> = {
    [SubtitleCapitalizationMethod.Default]: 'Default',
    [SubtitleCapitalizationMethod.Uppercase]: 'Uppercase',
    [SubtitleCapitalizationMethod.Lowercase]: 'Lowercase',
    [SubtitleCapitalizationMethod.CapitalizeFirstCharInWords]: 'Capitalize First Char',
  };
  return methodMap[method] || method;
};

const getPositionName = (position: SubtitlePosition): string => {
  const positionMap: Partial<Record<SubtitlePosition, string>> = {
    [SubtitlePosition.Top]: 'Top',
    [SubtitlePosition.Center]: 'Center',
    [SubtitlePosition.Bottom]: 'Bottom',
  };
  return positionMap[position] || position;
};

export const createSummaryMessage = (flow: ShortsFlowData): ChatMessage => {
  let summaryText = 'Summary:\n\n';
  
  if (flow.isTrimOnly) {
    // Trim summary
    summaryText += `Trims: ${flow.trimCount || 1}\n`;
    if (flow.trims && flow.trims.length > 0) {
      flow.trims.forEach((trim, index) => {
        summaryText += `  ${index + 1}. ${formatTime(trim.start)} - ${formatTime(trim.end)}\n`;
      });
    }
  } else if (flow.isSubtitleOnly) {
    // Subtitle summary
    summaryText += `Subtitle Style: ${getSubtitleStyleName(flow.subtitleStyle || 'default')}\n`;
    if (flow.subtitleCapitalizationMethod) {
      summaryText += `Capitalization: ${getCapitalizationName(flow.subtitleCapitalizationMethod)}\n`;
    }
    if (flow.subtitlePosition) {
      summaryText += `Position: ${getPositionName(flow.subtitlePosition)}\n`;
    }
    if (flow.subtitleColor) {
      summaryText += `color: ${flow.subtitleColor.name.toLowerCase()}\n`;
    }
  } else {
    // Generate Shorts summary
    summaryText += `Number of Shorts: ${flow.count === -1 ? 'Auto' : flow.count}\n`;
    summaryText += `Duration: ${flow.duration === -1 ? 'Auto' : `${flow.duration} seconds`}\n`;
    summaryText += `Language: ${flow.language ? getLanguageName(flow.language) : 'Auto'}\n`;
    if (flow.reframe) {
      summaryText += `Aspect Ratio: ${getAspectRatioName(flow.reframe)}\n`;
    }
    summaryText += `Subtitle Style: ${getSubtitleStyleName(flow.subtitleStyle || 'default')}\n`;
    if (flow.subtitleCapitalizationMethod) {
      summaryText += `Capitalization: ${getCapitalizationName(flow.subtitleCapitalizationMethod)}\n`;
    }
    if (flow.subtitlePosition) {
      summaryText += `Position: ${getPositionName(flow.subtitlePosition)}\n`;
    }
    if (flow.subtitleColor) {
      summaryText += `color: ${flow.subtitleColor.name.toLowerCase()}\n`;
    }
  }
  
  summaryText += '\nPlease confirm to proceed.';
  
  return {
    id: (Date.now() + 1).toString(),
    text: summaryText,
    isUser: false,
    timestamp: new Date(),
    flowData: {
      type: 'summary',
      summaryData: flow,
    },
  };
};

