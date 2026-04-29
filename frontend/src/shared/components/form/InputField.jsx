import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * InputField — Premium reusable input component
 *
 * Props:
 *   id          string   – unique id (required for label a11y)
 *   label       string   – visible label text
 *   type        string   – input type (default: 'text')
 *   name        string   – form field name
 *   value       any      – controlled value
 *   onChange    fn       – change handler
 *   placeholder string   – placeholder text
 *   required    bool     – marks field required
 *   disabled    bool     – disables the field
 *   readOnly    bool     – makes the field read-only
 *   error       string   – error message (shown below)
 *   helper      string   – helper/hint text (shown below if no error)
 *   icon        node     – lucide icon element for left side
 *   className   string   – extra classes on the wrapper
 *   autoComplete string  – autocomplete hint
 */
const InputField = ({
  id,
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  helper,
  icon,
  className = '',
  autoComplete,
  ...rest
}) => {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}

      <div className="form-input-wrap">
        {icon && <span className="form-icon form-icon-left">{icon}</span>}

        <input
          id={id}
          type={resolvedType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          className={`form-input ${icon ? 'form-input-icon-left' : ''} ${isPassword ? 'form-input-icon-right' : ''} ${error ? 'form-input-error' : ''} ${disabled || readOnly ? 'form-input-disabled' : ''}`}
          aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
          aria-invalid={!!error}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            className="form-icon form-icon-right form-pass-toggle"
            onClick={() => setShowPass((v) => !v)}
            aria-label={showPass ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
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

export default InputField;
