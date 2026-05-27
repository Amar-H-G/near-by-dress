import { useState, useEffect } from 'react';
import { X, User, Phone, Calendar, Heart, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EditProfileModal = ({ isOpen, onClose, profile, onUpdate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('unspecified');
  const [dob, setDob] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setGender(profile.gender || 'unspecified');
      
      if (profile.dob) {
        setDob(new Date(profile.dob).toISOString().split('T')[0]);
      } else {
        setDob('');
      }
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    if (!phone.trim()) return toast.error('Phone number is required');

    setSaving(true);
    try {
      await onUpdate({
        name,
        phone,
        gender,
        dob: dob || null
      });
      toast.success('Profile updated successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="premium-modal-backdrop">
      <div className="premium-modal-card edit-profile-card">
        {/* Header */}
        <div className="modal-header-row">
          <div>
            <h3>Edit Account Profile</h3>
            <p>Update your personal information below</p>
          </div>
          <button type="button" className="close-modal-trigger" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="input-field-group">
            <label htmlFor="name-input">Full Name</label>
            <div className="input-wrapper">
              <User size={15} className="input-icon" />
              <input 
                id="name-input"
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="Enter full name"
              />
            </div>
          </div>

          <div className="input-field-group">
            <label htmlFor="phone-input">Mobile Phone Number</label>
            <div className="input-wrapper">
              <Phone size={15} className="input-icon" />
              <input 
                id="phone-input"
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required
                placeholder="Enter 10-digit number"
              />
            </div>
          </div>

          <div className="form-double-row">
            <div className="input-field-group">
              <label htmlFor="gender-input">Gender</label>
              <div className="input-wrapper">
                <Heart size={15} className="input-icon" />
                <select 
                  id="gender-input"
                  value={gender} 
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="unspecified">Unspecified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="input-field-group">
              <label htmlFor="dob-input">Date of Birth</label>
              <div className="input-wrapper">
                <Calendar size={15} className="input-icon" />
                <input 
                  id="dob-input"
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="modal-actions-footer">
            <button type="button" className="action-btn cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="action-btn save-btn" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
