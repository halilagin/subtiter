// Helper function to apply capitalization
export const applyCapitalization = (text: string, style: string): string => {
    switch (style) {
      case 'uppercase':
        return text.toUpperCase();
      case 'capitalize_first_char_in_words':
        return text
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      case 'lowercase':
        return text.toLowerCase();
      default:
        return text;
    }
  };