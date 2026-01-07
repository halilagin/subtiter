// Helper function to get position styles for subtitle text
export const getPositionStyles = (position: 'top' | 'middle' | 'bottom') => {
  switch (position) {
    case 'top':
      return {
        top: '8%',
        left: '50%',
        transform: 'translate(-50%, 0)',
      };
    case 'bottom':
      return {
        bottom: '8%',
        left: '50%',
        transform: 'translate(-50%, 0)',
      };
    case 'middle':
    default:
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
  }
};

// Helper function to get position label
export const getPositionLabel = (position: 'top' | 'middle' | 'bottom'): string => {
  switch (position) {
    case 'top':
      return 'Top';
    case 'bottom':
      return 'Bottom';
    case 'middle':
    default:
      return 'Middle';
  }
};

// Position options for UI
export const POSITION_OPTIONS: Array<'top' | 'middle' | 'bottom'> = ['top', 'middle', 'bottom'];
