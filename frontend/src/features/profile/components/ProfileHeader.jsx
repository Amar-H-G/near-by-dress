import { User, Mail, Phone, Calendar, Heart, Edit3 } from 'lucide-react';

const ProfileHeader = ({ profile, onEditClick }) => {
  const { name, email, phone, gender, dob, avatar } = profile;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGenderLabel = (g) => {
    if (!g || g === 'unspecified') return 'Not set';
    return g.charAt(0).toUpperCase() + g.slice(1);
  };

  return (
    <div className="premium-profile-header">
      {/* Decorative Gradient Background */}
      <div className="profile-header-gradient" />

      <div className="profile-header-body">
        {/* Avatar Area */}
        <div className="profile-avatar-container">
          {avatar ? (
            <img src={avatar} alt={name} className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-placeholder">
              <span>{name?.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <span className="profile-badge-pill">Premium User</span>
        </div>

        {/* Info Grid */}
        <div className="profile-info-content">
          <div className="profile-name-row">
            <h1 className="profile-name-heading">{name}</h1>
            <button 
              type="button" 
              className="profile-edit-trigger"
              onClick={onEditClick}
              aria-label="Edit general profile info"
            >
              <Edit3 size={14} />
              Edit Profile
            </button>
          </div>

          <div className="profile-details-grid">
            <div className="detail-item">
              <Mail size={14} className="detail-icon" />
              <span>{email}</span>
            </div>

            <div className="detail-item">
              <Phone size={14} className="detail-icon" />
              <span>{phone || 'Add phone number'}</span>
            </div>

            <div className="detail-item">
              <User size={14} className="detail-icon" />
              <span>Gender: {getGenderLabel(gender)}</span>
            </div>

            <div className="detail-item">
              <Calendar size={14} className="detail-icon" />
              <span>DOB: {formatDate(dob)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
