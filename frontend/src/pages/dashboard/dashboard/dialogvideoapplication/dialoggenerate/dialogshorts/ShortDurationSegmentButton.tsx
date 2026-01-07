import React from 'react';
import { Button, ButtonProps } from '@mui/material';

interface ShortDurationSegmentButtonProps extends Omit<ButtonProps, 'onClick'> {
  label: string;
  value: string;
  isSelected: boolean;
  onClick: (value: string) => void;
  position?: 'left' | 'middle' | 'right' | 'single';
  startIcon?: React.ReactNode;
}

const ShortDurationSegmentedButton: React.FC<ShortDurationSegmentButtonProps> = ({
  label,
  value,
  isSelected,
  onClick,
  position = 'single',
  startIcon,
  ...buttonProps
}) => {
  const getBorderRadius = () => {
    switch (position) {
      case 'left':
        return '12px 0 0 12px';
      case 'middle':
        return '0';
      case 'right':
        return '0 12px 12px 0';
      case 'single':
      default:
        return '12px';
    }
  };

  const getBorderStyles = () => {
    const baseStyles = {
      borderLeft: position === 'middle' || position === 'right' ? 'none' : undefined,
      borderRight: position === 'left' || position === 'middle' ? 'none' : undefined,
    };
    return baseStyles;
  };

  return (
    <Button
      size="small"
      variant={isSelected ? 'contained' : 'outlined'}
      onClick={() => onClick(value)}
      startIcon={startIcon}
      sx={{
        bgcolor: isSelected ? '#000000' : 'white',
        color: isSelected ? 'white' : '#6b7280',
        borderColor: '#d1d5db',
        textTransform: 'none',
        borderRadius: getBorderRadius(),
        fontFamily: "'Inter', sans-serif",
        px: { xs: startIcon ? 0.8 : 0.5, md: startIcon ? 2 : 1.5 },
        py: { xs: 0.5, md: 0.8 },
        fontSize: { xs: '0.65rem', md: '0.875rem' },
        minWidth: { xs: 'auto', md: '64px' },
        ...getBorderStyles(),
        '&:hover': {
          bgcolor: isSelected ? '#000000' : 'transparent'
        },
        ...buttonProps.sx
      }}
      {...buttonProps}
    >
      {label}
    </Button>
  );
};

export default ShortDurationSegmentedButton;

