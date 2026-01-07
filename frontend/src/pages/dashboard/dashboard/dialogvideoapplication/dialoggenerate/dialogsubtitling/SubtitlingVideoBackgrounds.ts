export const subtitleVideoBackgrounds: { [key: string]: string } = {
  'default': 'https://peralabs.co.uk/assets//subtitlevideo.mp4',
  'deep_diver': 'https://peralabs.co.uk/assets/klippers/subtitlevideo.mp4',
  'karaoke_popup_rectangle': 'https://peralabs.co.uk/assets/klippers/subtitlevideo.mp4',
  'classic': 'https://peralabs.co.uk/assets/klippers/subtitlevideo.mp4',
  'sara': 'https://peralabs.co.uk/assets/klippers/subtitlevideo.mp4',
  'jimi': 'https://peralabs.co.uk/assets/klippers/subtitlevideo.mp4',
  'basker': 'https://peralabs.co.uk/assets/klippers/subtitlevideo.mp4',
  'bobby': 'https://peralabs.co.uk/assets/klippers/subtitlevideo.mp4',
  'beast': 'https://peralabs.co.uk/assets/klippers/subtitlevideo.mp4'
};

export const getSubtitleVideoBackground = (subtitleId: string): string => {
  return subtitleVideoBackgrounds[subtitleId] || subtitleVideoBackgrounds['default'];
};
