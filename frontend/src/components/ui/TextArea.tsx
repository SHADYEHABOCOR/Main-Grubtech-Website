import React from 'react';
import { VisuallyHidden } from '../accessibility/VisuallyHidden';

interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
  warningThreshold?: number;
}

export const TextArea: React.FC<TextAreaProps> = React.memo(({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  maxLength,
  showCharacterCount = true,
  warningThreshold = 0.8,
}) => {
  const currentLength = value.length;
  const shouldShowCounter = maxLength !== undefined && showCharacterCount;

  // Calculate percentage for visual feedback
  const percentage = maxLength ? currentLength / maxLength : 0;

  // Determine counter color based on percentage
  const getCounterColor = () => {
    if (percentage >= 1.0) {
      return 'text-red-500'; // Error state (100%)
    }
    if (percentage >= warningThreshold) {
      return 'text-amber-500'; // Warning state
    }
    return 'text-text-secondary'; // Normal state
  };

  // Build aria-describedby value
  const ariaDescribedBy = [];
  if (error) ariaDescribedBy.push(`${name}-error`);
  if (shouldShowCounter) ariaDescribedBy.push(`${name}-counter`);
  const ariaDescribedByValue = ariaDescribedBy.length > 0 ? ariaDescribedBy.join(' ') : undefined;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={name} className="text-sm font-semibold text-text-primary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={ariaDescribedByValue}
        className={`px-4 py-3 border rounded-lg transition-all duration-200 resize-none ${
          error
            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} outline-none`}
      />
      {shouldShowCounter && (
        <div
          id={`${name}-counter`}
          aria-live="polite"
          aria-atomic="true"
          className={`text-sm text-right transition-colors duration-200 ${getCounterColor()}`}
        >
          <VisuallyHidden>Character count: </VisuallyHidden>
          {currentLength} / {maxLength}
        </div>
      )}
      {error && (
        <span id={`${name}-error`} role="alert" className="text-sm text-red-500">
          {error}
        </span>
      )}
    </div>
  );
});
