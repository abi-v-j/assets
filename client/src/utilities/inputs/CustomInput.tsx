import React from 'react';
import type { CustomInputProps } from '../../types/commonType';

const CustomInput: React.FC<CustomInputProps> = ({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  required,
  disabled,
  min,
  max,
  step,
  maxLength,
  onChange,
}) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      maxLength={maxLength}
      onChange={onChange}
    />
  );
};

export default CustomInput;