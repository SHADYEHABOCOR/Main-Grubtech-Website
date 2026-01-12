import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = React.memo(({
  label,
  name,
  value,
  onChange,
  options,
  error,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={name} className="text-sm font-semibold text-text-primary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`px-4 py-3 border rounded-lg transition-all duration-200 ${
          error
            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} outline-none`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${name}-error`} role="alert" className="text-sm text-red-500">
          {error}
        </span>
      )}
    </div>
  );
});
