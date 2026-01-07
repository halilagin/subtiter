// Helper function to get position styles for subtitle text
export const getPositionStyles = (position: 'top' | 'center' | 'bottom') => {
  switch (position) {
    case 'top':
      return {
        top: '10%',
        left: '50%',
        transform: 'translate(-50%, 0)',
      };
    case 'bottom':
      return {
        top: '90%',
        left: '50%',
        transform: 'translate(-50%, 0)',
      };
    case 'center':
    default:
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
  }
};

// Helper function to get position label
export const getPositionLabel = (position: 'top' | 'center' | 'bottom'): string => {
  switch (position) {
    case 'top':
      return 'Top';
    case 'bottom':
      return 'Bottom';
    case 'center':
    default:
      return 'Center';
  }
};

// Position options for UI
export const POSITION_OPTIONS: Array<'top' | 'center' | 'bottom'> = ['top', 'center', 'bottom'];
