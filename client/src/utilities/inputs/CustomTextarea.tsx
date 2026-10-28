import React from 'react';
import type { CustomTextareaProps } from '../../types/commonType';

const CustomTextarea: React.FC<CustomTextareaProps> = ({
  id,
  name,
  rows = 3,
  cols = 40,
  placeholder,
  value,
  required,
  disabled,
  onChange,
}) => {
  return (
    <textarea
      id={id}
      name={name}
      rows={rows}
      cols={cols}
      placeholder={placeholder}
      value={value}
      required={required}
      disabled={disabled}
      onChange={onChange}
    />
  );
};

export default CustomTextarea;
