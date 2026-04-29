import { useRef, useState } from 'react';
import { UploadCloud, X, ImageIcon } from 'lucide-react';

/**
 * FileUpload — Premium drag-and-drop file upload with image preview
 *
 * Props:
 *   id          string    – unique id
 *   label       string    – visible label text
 *   accept      string    – mime types (default: 'image/*')
 *   multiple    bool      – allow multiple files
 *   maxFiles    number    – max file count (default: 5)
 *   files       File[]    – controlled list of new File objects
 *   previews    string[]  – existing image URLs (from server)
 *   onFilesChange fn      – (files: File[]) => void
 *   onRemove    fn        – (index: number, isExisting: bool) => void
 *   error       string    – error message
 *   helper      string    – helper text
 *   compact     bool      – compact mode (small upload area, no big zone)
 *   className   string
 */
const FileUpload = ({
  id,
  label,
  accept = 'image/*',
  multiple = false,
  maxFiles = 5,
  files = [],
  previews = [],
  onFilesChange,
  onRemove,
  error,
  helper,
  compact = false,
  className = '',
}) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (incoming) => {
    const selected = Array.from(incoming);
    const total = previews.length + files.length + selected.length;
    if (total > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed.`);
      return;
    }
    onFilesChange?.(multiple ? [...files, ...selected] : [selected[0]]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const allPreviews = [
    ...previews.map((url, i) => ({ url, key: `existing-${i}`, isExisting: true, index: i })),
    ...files.map((file, i) => ({ url: URL.createObjectURL(file), key: `new-${i}`, isExisting: false, index: previews.length + i })),
  ];

  const canAddMore = allPreviews.length < maxFiles;

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}

      {/* Thumbnails row */}
      {allPreviews.length > 0 && (
        <div className="file-upload-previews">
          {allPreviews.map(({ url, key, isExisting, index }) => (
            <div key={key} className="file-upload-thumb">
              <img src={url} alt={`Preview ${index + 1}`} className="file-upload-thumb-img" />
              {onRemove && (
                <button
                  type="button"
                  className="file-upload-thumb-remove"
                  onClick={() => onRemove(isExisting ? index : index - previews.length, isExisting)}
                  aria-label="Remove image"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}

          {/* Add more thumbnail */}
          {canAddMore && (
            <button
              type="button"
              className="file-upload-thumb file-upload-thumb-add"
              onClick={() => inputRef.current?.click()}
              title="Add image"
            >
              <UploadCloud size={20} />
            </button>
          )}
        </div>
      )}

      {/* Drop zone (shown when no previews or not compact) */}
      {allPreviews.length === 0 && (
        <div
          className={`file-upload-zone ${isDragging ? 'file-upload-zone-drag' : ''} ${error ? 'file-upload-zone-error' : ''} ${compact ? 'file-upload-zone-compact' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Upload files"
        >
          <div className="file-upload-zone-content">
            <div className="file-upload-zone-icon">
              {isDragging ? <ImageIcon size={compact ? 20 : 28} /> : <UploadCloud size={compact ? 20 : 28} />}
            </div>
            {!compact && (
              <>
                <p className="file-upload-zone-title">
                  {isDragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
                </p>
                <p className="file-upload-zone-sub">
                  {accept === 'image/*' ? 'PNG, JPG, WebP' : accept} · up to {maxFiles} file{maxFiles > 1 ? 's' : ''}
                </p>
              </>
            )}
            {compact && <span className="file-upload-zone-sub">Upload</span>}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {error && (
        <p className="form-error" role="alert">{error}</p>
      )}
      {!error && helper && (
        <p className="form-helper">{helper}</p>
      )}
    </div>
  );
};

export default FileUpload;
