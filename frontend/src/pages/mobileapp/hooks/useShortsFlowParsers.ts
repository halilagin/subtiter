import { LanguageCode } from '@/api/models/LanguageCode';
import { VideoAspectRatio } from '@/api/models/VideoAspectRatio';
import { LANGUAGES } from '../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/languages';

export const parseCount = (text: string): number | null => {
  const num = parseInt(text.trim());
  if (!isNaN(num) && num > 0 && num <= 10) {
    return num;
  }
  if (text.toLowerCase().includes('auto')) {
    return -1;
  }
  return null;
};

export const parseDuration = (text: string): number | null => {
  const lower = text.toLowerCase();
  if (lower.includes('0.5') || lower.includes('30')) return 30;
  if (lower.includes('1 min') || lower.includes('60')) return 60;
  if (lower.includes('1.5') || lower.includes('90')) return 90;
  if (lower.includes('2 min') || lower.includes('120')) return 120;
  if (lower.includes('2.5') || lower.includes('150')) return 150;
  if (lower.includes('auto')) return -1;
  return null;
};

export const parseReframe = (text: string): VideoAspectRatio | null => {
  const lower = text.toLowerCase();
  // Check for dimensions first (e.g., "9:16", "4:3", "1:1", "16:9")
  if (lower.includes('9:16')) {
    return VideoAspectRatio._916;
  } else if (lower.includes('4:3') || lower.includes('4:5')) {
    return VideoAspectRatio._45; // Using 4:5 as closest to 4:3
  } else if (lower.includes('1:1')) {
    return VideoAspectRatio._11;
  } else if (lower.includes('16:9')) {
    return VideoAspectRatio._169;
  }
  // Then check for names
  if (lower.includes('instagram') || lower.includes('reels')) {
    return VideoAspectRatio._916;
  } else if (lower.includes('portrait')) {
    return VideoAspectRatio._45; // Using 4:5 as closest to 4:3
  } else if (lower.includes('square')) {
    return VideoAspectRatio._11;
  } else if (lower.includes('landscape')) {
    return VideoAspectRatio._169;
  } else if (lower.includes('keep') || lower.includes('original') || lower.includes('default')) {
    return VideoAspectRatio._916; // Default to 9:16 if keep original
  }
  return null;
};

export const parseLanguage = (text: string): LanguageCode | null => {
  const lower = text.toLowerCase();
  
  // Check for "auto" first
  if (lower.includes('auto')) {
    return LanguageCode.En; // Default
  }
  
  // Check each language from LANGUAGES
  for (const lang of LANGUAGES) {
    if (lower.includes(lang.name.toLowerCase()) || lower.includes(lang.code.toLowerCase())) {
      return lang.code as LanguageCode;
    }
  }
  
  return null;
};

