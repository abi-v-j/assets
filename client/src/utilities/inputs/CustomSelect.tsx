import React from 'react';
import type { CustomSelectProps } from '../../types/commonType';

const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  name,
  value,
  required,
  disabled,
  options,
  onChange,
}) => {
  return (
    <select
      id={id}
      name={name}
      value={value}
      required={required}
      disabled={disabled}
      onChange={onChange}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default CustomSelect;
