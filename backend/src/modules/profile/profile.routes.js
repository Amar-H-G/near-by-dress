const express = require('express');
const router = express.Router();
const profileController = require('./profile.controller');
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { updateProfileSchema, addressSchema } = require('./profile.validation');

// All profile and address routes require token authentication!
router.use(authenticate);

// Profile general routes
router.route('/')
  .get(profileController.getMyProfile)
  .put(validate(updateProfileSchema), profileController.updateMyProfile);

// Address subdocument routes
router.route('/addresses')
  .get(profileController.getMyAddresses)
  .post(validate(addressSchema), profileController.addMyAddress);

router.route('/addresses/:addressId')
  .put(validate(addressSchema), profileController.updateMyAddress)
  .delete(profileController.deleteMyAddress);

router.patch('/addresses/:addressId/default', profileController.setMyDefaultAddress);

module.exports = router;
