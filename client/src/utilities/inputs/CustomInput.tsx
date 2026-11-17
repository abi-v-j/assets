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
  className = '',
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
      className={`w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 shadow-xs transition-colors duration-150 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${className}`}
    />
  );
};

export default CustomInput;
