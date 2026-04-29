import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

const RejectionModal = ({ open, onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="admin-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 450 }}
      >
        <div className="admin-modal-header">
          <div className="admin-modal-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
            <AlertCircle size={20} />
          </div>
          <button className="admin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <h3 className="admin-modal-title">Reject Shop</h3>
        <p className="admin-modal-msg">
          Please provide a reason for rejecting this shop. This will be shown to the seller.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Rejection Reason *</label>
            <textarea
              required
              className="admin-input"
              rows={4}
              placeholder="e.g. Invalid business documents or incorrect shop location..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
          </div>

          <div className="admin-modal-actions" style={{ marginTop: 24 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={loading || !reason.trim()}
              style={{ minWidth: 120 }}
            >
              {loading ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectionModal;
