const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'NearByDress' },
    logo: { type: String, default: null },
    primaryColor: { type: String, default: '#2563EB' },
    secondaryColor: { type: String, default: '#10B981' },
    contactEmail: { type: String, default: 'support@nearbydress.com' },
    contactPhone: { type: String, default: '+91 99999 99999' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
