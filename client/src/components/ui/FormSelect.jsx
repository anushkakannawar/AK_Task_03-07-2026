import React, { forwardRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';

const FormSelect = forwardRef(({ label, name, error, required = false, disabled = false, options = [], placeholder, className = '', containerClassName = '', ...props }, ref) => {
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
      <select
        ref={ref} id={id} name={name} disabled={disabled}
        aria-required={required} aria-invalid={!!error}
        className={`dark-input ${className}`}
        style={error ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p style={{ fontSize: '0.72rem', color: '#f87171', margin: 0 }} role="alert">{error}</p>}
    </div>
  );
});
FormSelect.displayName = 'FormSelect';
export default FormSelect;
