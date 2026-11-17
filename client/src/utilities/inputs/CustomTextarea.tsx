import React from 'react';
import type { CustomTextareaProps } from '../../types/commonType';

const CustomTextarea: React.FC<CustomTextareaProps> = ({
  id,
  name,
  rows = 3,
  cols = 40,
  placeholder,
  value,
  defaultValue,
  required,
  disabled,
  className = '',
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
      defaultValue={defaultValue}
      required={required}
      disabled={disabled}
      onChange={onChange}
      className={`w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 shadow-xs transition-colors duration-150 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${className}`}
    />
  );
};

export default CustomTextarea;
