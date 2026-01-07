import { LanguageCode } from '@/api/models/LanguageCode';
import { VideoAspectRatio } from '@/api/models/VideoAspectRatio';
import { SubtitleCapitalizationMethod } from '@/api/models/SubtitleCapitalizationMethod';
import { SubtitlePosition } from '@/api/models/SubtitlePosition';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  flowData?: {
    type: 'count' | 'duration' | 'language' | 'reframe' | 'subtitle_style' | 'subtitle_details' | 'subtitle_capitalization' | 'subtitle_position' | 'subtitle_color' | 'trim_count' | 'trim' | 'summary';
    options?: any[];
    selectedSubtitleStyle?: string;
    selectedColor?: any;
    showColorButton?: boolean;
    videoDuration?: number;
    trimStart?: number;
    trimEnd?: number;
    trimIndex?: number;
    trimCount?: number;
    summaryData?: ShortsFlowData;
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export type FlowStep = 
  | 'idle'
  | 'asking_count'
  | 'asking_duration'
  | 'asking_language'
  | 'asking_reframe'
  | 'asking_subtitle_style'
  | 'asking_subtitle_details'
  | 'asking_subtitle_capitalization'
  | 'asking_subtitle_position'
  | 'asking_subtitle_color'
  | 'asking_trim_count'
  | 'asking_trim'
  | 'showing_summary'
  | 'complete';

export interface ShortsFlowData {
  step: FlowStep;
  count?: number;
  duration?: number; // in seconds
  language?: LanguageCode;
  reframe?: VideoAspectRatio;
  subtitleStyle?: string;
  subtitleCapitalizationMethod?: SubtitleCapitalizationMethod;
  subtitlePosition?: SubtitlePosition;
  subtitleColor?: any; // color option object
  videoId?: string;
  isSubtitleOnly?: boolean; // Flag to indicate subtitle-only flow
  isTrimOnly?: boolean; // Flag to indicate trim-only flow
  trimCount?: number; // number of trims to create
  trimIndex?: number; // current trim index (0-based)
  trims?: Array<{ start: number; end: number }>; // array of trim ranges
  trimStart?: number; // in seconds (current trim)
  trimEnd?: number; // in seconds (current trim)
  videoDuration?: number; // original video duration in seconds
}

