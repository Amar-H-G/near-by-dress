const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

// Generic Cloudinary storage factory
const createStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `nearbydress/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });

const shopUpload = multer({
  storage: createStorage('shops'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new AppError('Only image files are allowed', 400), false);
  },
});

const productUpload = multer({
  storage: createStorage('products'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new AppError('Only image files are allowed', 400), false);
  },
});

const avatarUpload = multer({
  storage: createStorage('avatars'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new AppError('Only image files are allowed', 400), false);
  },
});

module.exports = { shopUpload, productUpload, avatarUpload };
