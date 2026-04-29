import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import TextArea from '../../../shared/components/form/TextArea';

const RejectionModal = ({ open, onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) { setError('Please provide a rejection reason'); return; }
    onConfirm(reason);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="admin-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 450 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rejection-modal-title"
      >
        <div className="admin-modal-header">
          <div className="admin-modal-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
            <AlertCircle size={20} />
          </div>
          <button className="admin-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <h3 className="admin-modal-title" id="rejection-modal-title">Reject Shop</h3>
        <p className="admin-modal-msg">
          Please provide a reason for rejecting this shop. This will be sent to the seller.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <TextArea
            id="rejection-reason"
            label="Rejection Reason"
            value={reason}
            onChange={(e) => { setReason(e.target.value); if (error) setError(''); }}
            placeholder="e.g. Invalid business documents or incorrect shop location…"
            rows={4}
            required
            error={error}
            autoFocus
          />

          <div className="admin-modal-actions" style={{ marginTop: 24 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger-solid"
              disabled={loading || !reason.trim()}
              style={{ minWidth: 120, borderRadius: 14 }}
            >
              {loading ? 'Processing…' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectionModal;
