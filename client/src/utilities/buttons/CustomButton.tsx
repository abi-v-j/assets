import React from 'react';
import type { CustomButtonProps } from '../../types/commonType';

const CustomButton: React.FC<CustomButtonProps> = ({
  name,
  onClick,
  type = 'button',
  disabled = false,
  variant,
  size = 'md',
  className = '',
  icon,
}) => {
  // Infer smart default variant from name if not explicitly passed
  let resolvedVariant = variant;
  if (!resolvedVariant) {
    const strName = typeof name === 'string' ? name.toLowerCase() : '';
    if (strName.includes('delete')) {
      resolvedVariant = 'danger';
    } else if (strName.includes('remove') || strName.includes('cancel')) {
      resolvedVariant = 'outline';
    } else if (strName.includes('logout') || strName.includes('close')) {
      resolvedVariant = 'secondary';
    } else {
      resolvedVariant = 'primary';
    }
  }

  const variantClasses: Record<string, string> = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-xs focus-visible:ring-indigo-500/50',
    secondary:
      'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400/50 border border-slate-200/80',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-xs focus-visible:ring-rose-500/50',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-xs focus-visible:ring-emerald-500/50',
    outline:
      'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-xs focus-visible:ring-indigo-500/50',
    ghost:
      'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400/50',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-2.5 py-1 text-xs font-medium rounded-md gap-1.5',
    md: 'px-3.5 py-2 text-sm font-medium rounded-lg gap-2',
    lg: 'px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-sans transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
        variantClasses[resolvedVariant] || variantClasses.primary
      } ${sizeClasses[size] || sizeClasses.md} ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{name}</span>
    </button>
  );
};

export default CustomButton;
