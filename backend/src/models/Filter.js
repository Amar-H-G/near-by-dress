const mongoose = require('mongoose');

const filterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['select', 'multi-select', 'range', 'checkbox'],
    default: 'select'
  },
  options: {
    type: [String],
    default: []
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 5000
  },
  isDynamic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Ensure unique keys but only for non-deleted filters (complex in Mongo, so we'll handle in code or just rely on soft-delete)

module.exports = mongoose.model('Filter', filterSchema);
