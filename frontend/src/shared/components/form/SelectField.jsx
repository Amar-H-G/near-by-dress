import { ChevronDown } from 'lucide-react';

/**
 * SelectField — Premium reusable select/dropdown component
 *
 * Props:
 *   id           string   – unique id
 *   label        string   – visible label text
 *   name         string   – form field name
 *   value        string   – controlled value
 *   onChange     fn       – change handler
 *   options      array    – [{ value, label }] or plain strings
 *   placeholder  string   – first disabled option text (default: 'Select...')
 *   required     bool
 *   disabled     bool
 *   error        string   – error message
 *   helper       string   – helper text
 *   className    string   – extra wrapper classes
 */
const SelectField = ({
  id,
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  error,
  helper,
  className = '',
  placeholderDisabled = true,
  ...rest
}) => {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}

      <div className="form-input-wrap form-select-wrap">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`form-input form-select ${error ? 'form-input-error' : ''} ${disabled ? 'form-input-disabled' : ''}`}
          aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
          aria-invalid={!!error}
          {...rest}
        >
          <option value="" disabled={placeholderDisabled}>
            {placeholder}
          </option>
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <ChevronDown size={16} className="form-select-chevron" />
      </div>

      {error && (
        <p id={`${id}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}
      {!error && helper && (
        <p id={`${id}-helper`} className="form-helper">
          {helper}
        </p>
      )}
    </div>
  );
};

export default SelectField;
