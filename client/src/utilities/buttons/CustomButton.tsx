import React from 'react';
import type { CustomButtonProps } from '../../types/commonType';

const CustomButton: React.FC<CustomButtonProps> = ({ name, onClick, type = 'button', disabled = false }) => {
  return (
    <button type={type} onClick={onClick} disabled={disabled}>
      {name}
    </button>
  );
};

export default CustomButton;