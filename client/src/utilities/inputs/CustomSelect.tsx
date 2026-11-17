import React from 'react';
import type { CustomSelectProps } from '../../types/commonType';

const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  name,
  value,
  required,
  disabled,
  options,
  className = '',
  onChange,
}) => {
  return (
    <div className="relative w-full">
      <select
        id={id}
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        onChange={onChange}
        className={`w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 py-2 pr-10 text-sm text-slate-800 shadow-xs transition-colors duration-150 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

export default CustomSelect;
