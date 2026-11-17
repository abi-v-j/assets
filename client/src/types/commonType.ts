import React from 'react';

export interface ApiResponse<T = any> {
  status: string;
  message: string;
  data: T;
  error?: string;
}

export interface CustomInputProps {
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  required?: boolean;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  maxLength?: number;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface CustomButtonProps {
  name: string | React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface CustomSelectProps {
  id?: string;
  name?: string;
  value?: string | number;
  required?: boolean;
  disabled?: boolean;
  options: SelectOption[];
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export interface CustomTextareaProps {
  id?: string;
  name?: string;
  rows?: number;
  cols?: number;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
