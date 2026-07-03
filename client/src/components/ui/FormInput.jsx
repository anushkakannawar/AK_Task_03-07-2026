import React, { forwardRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';

const FormInput = forwardRef(({ label, name, type = 'text', error, required = false, disabled = false, placeholder, helperText, className = '', containerClassName = '', ...props }, ref) => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const id = `field-${name}`;
  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} style={{ fontSize: '0.78rem', fontWeight: 500, color: C.text3, marginBottom: '2px', display: 'block' }}>
          {label}
          {required && <span style={{ color: '#f87171', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <input
        ref={ref} id={id} name={name} type={type} disabled={disabled} placeholder={placeholder}
        aria-required={required} aria-invalid={!!error}
        className={`dark-input ${className}`}
        style={error ? { borderColor: 'rgba(239,68,68,0.5)', background: isDark ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.04)' } : {}}
        {...props}
      />
      {error && (
        <p style={{ fontSize: '0.72rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }} role="alert">
          <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && <p style={{ fontSize: '0.72rem', color: C.text4, margin: 0 }}>{helperText}</p>}
    </div>
  );
});
FormInput.displayName = 'FormInput';
export default FormInput;
