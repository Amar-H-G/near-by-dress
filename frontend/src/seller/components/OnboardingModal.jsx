import ShopForm from './ShopForm';
import { X } from 'lucide-react';

const OnboardingModal = ({ isOpen, onClose, onSave, loading, initialData = {} }) => {
  if (!isOpen) return null;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal glass-strong">
        <div className="onboarding-header">
          <div>
            <h2 className="onboarding-title">Complete Your Shop Profile</h2>
            <p className="onboarding-subtitle">Tell us about your shop to start selling on NearByDress.</p>
          </div>
          <button onClick={onClose} className="onboarding-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="onboarding-body">
          <ShopForm 
            initialData={initialData}
            onSubmit={onSave} 
            loading={loading} 
            showCancel={true} 
            onCancel={onClose} 
          />
        </div>
      </div>

      <style jsx>{`
        .onboarding-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 5, 20, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        .onboarding-modal {
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: modalAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalAppear {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .onboarding-header {
          padding: 24px 32px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: sticky;
          top: 0;
          background: var(--surface);
          z-index: 10;
        }
        .onboarding-title {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 4px;
          color: #fff;
        }
        .onboarding-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
        }
        .onboarding-close-btn {
          background: var(--surface-2);
          border: none;
          color: var(--text-muted);
          padding: 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .onboarding-close-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
        }
        .onboarding-body {
          padding: 32px;
        }
        /* Custom scrollbar for modal */
        .onboarding-modal::-webkit-scrollbar {
          width: 6px;
        }
        .onboarding-modal::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default OnboardingModal;
