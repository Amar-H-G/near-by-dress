import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div
        className="admin-modal-box admin-modal-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="admin-modal-header">
          <div className={`admin-modal-icon ${danger ? 'admin-modal-icon-danger' : 'admin-modal-icon-warn'}`}>
            <AlertTriangle size={20} />
          </div>
          <button className="admin-modal-close" onClick={onCancel} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <h3 className="admin-modal-title">{title}</h3>
        {message && <p className="admin-modal-msg">{message}</p>}
        <div className="admin-modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={`btn ${danger ? 'btn-danger-solid' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
            id="confirm-modal-ok"
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
