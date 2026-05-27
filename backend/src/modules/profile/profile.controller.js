const profileService = require('./profile.service');
const { sendSuccess, sendError } = require('../../utils/response');

/**
 * Get current customer profile
 */
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user._id);
    return sendSuccess(res, { data: profile }, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update general customer profile info
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const updated = await profileService.updateProfile(req.user._id, req.body);
    return sendSuccess(res, { data: updated }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all saved addresses of current user
 */
const getMyAddresses = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user._id);
    return sendSuccess(res, { data: profile.addresses || [] }, 'Addresses retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new saved address
 */
const addMyAddress = async (req, res, next) => {
  try {
    const address = await profileService.addAddress(req.user._id, req.body);
    return sendSuccess(res, { data: address }, 'Address added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update a specific address
 */
const updateMyAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const address = await profileService.updateAddress(req.user._id, addressId, req.body);
    return sendSuccess(res, { data: address }, 'Address updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a specific address
 */
const deleteMyAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const remaining = await profileService.deleteAddress(req.user._id, addressId);
    return sendSuccess(res, { data: remaining }, 'Address deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle default flag for an address
 */
const setMyDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const addresses = await profileService.setDefaultAddress(req.user._id, addressId);
    return sendSuccess(res, { data: addresses }, 'Default address updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyAddresses,
  addMyAddress,
  updateMyAddress,
  deleteMyAddress,
  setMyDefaultAddress
};
