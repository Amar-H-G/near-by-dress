/**
 * TextArea — Premium reusable textarea component
 *
 * Props:
 *   id          string   – unique id
 *   label       string   – visible label text
 *   name        string   – form field name
 *   value       string   – controlled value
 *   onChange    fn       – change handler
 *   placeholder string
 *   rows        number   – visible rows (default: 4)
 *   required    bool
 *   disabled    bool
 *   error       string   – error message
 *   helper      string   – helper text
 *   maxLength   number   – char limit (shows counter)
 *   resize      string   – 'vertical' | 'none' (default: 'vertical')
 *   className   string
 */
const TextArea = ({
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  error,
  helper,
  maxLength,
  resize = 'vertical',
  className = '',
  ...rest
}) => {
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <div className="form-label-row">
          <label htmlFor={id} className="form-label">
            {label}
            {required && <span className="form-required">*</span>}
          </label>
          {maxLength && (
            <span className={`form-char-counter ${charCount > maxLength * 0.9 ? 'form-char-counter-warn' : ''}`}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}

      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        className={`form-input form-textarea ${error ? 'form-input-error' : ''} ${disabled ? 'form-input-disabled' : ''}`}
        style={{ resize }}
        aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
        aria-invalid={!!error}
        {...rest}
      />

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

export default TextArea;
