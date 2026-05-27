const User = require('../../models/User');
const AppError = require('../../utils/AppError');

/**
 * Get profile details by user ID
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

/**
 * Update general profile info
 */
const updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update fields
  if (updateData.name) user.name = updateData.name;
  if (updateData.phone) user.phone = updateData.phone;
  if (updateData.gender) user.gender = updateData.gender;
  if (updateData.dob !== undefined) user.dob = updateData.dob || null;
  if (updateData.avatar) user.avatar = updateData.avatar;

  await user.save();
  return user;
};

/**
 * Add a new saved address
 */
const addAddress = async (userId, addressData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If this is the user's first address, or isDefault is true, set as default
  const makeDefault = addressData.isDefault || user.addresses.length === 0;

  if (makeDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  const newAddress = {
    ...addressData,
    isDefault: makeDefault
  };

  user.addresses.push(newAddress);
  await user.save();
  
  // Return the newly created address
  return user.addresses[user.addresses.length - 1];
};

/**
 * Update an existing address
 */
const updateAddress = async (userId, addressId, addressData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new AppError('Address not found', 404);
  }

  // If marked as default, clear others
  if (addressData.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  // Map fields
  address.label = addressData.label || address.label;
  address.fullName = addressData.fullName || address.fullName;
  address.phone = addressData.phone || address.phone;
  address.addressLine1 = addressData.addressLine1 || address.addressLine1;
  address.addressLine2 = addressData.addressLine2 !== undefined ? addressData.addressLine2 : address.addressLine2;
  address.landmark = addressData.landmark !== undefined ? addressData.landmark : address.landmark;
  address.city = addressData.city || address.city;
  address.state = addressData.state || address.state;
  address.pincode = addressData.pincode || address.pincode;
  if (addressData.lat !== undefined) address.lat = addressData.lat;
  if (addressData.lng !== undefined) address.lng = addressData.lng;
  if (addressData.isDefault !== undefined) {
    address.isDefault = addressData.isDefault;
  }

  // If we cleared the default flag and no address is default, pick the first one
  const hasDefault = user.addresses.some(a => a.isDefault);
  if (!hasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return address;
};

/**
 * Delete an address
 */
const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new AppError('Address not found', 404);
  }

  const wasDefault = address.isDefault;
  
  // Use Mongoose Subdocument pull
  user.addresses.pull(addressId);

  // If we deleted the default, set the first remaining as default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return user.addresses;
};

/**
 * Set an address as default
 */
const setDefaultAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const target = user.addresses.id(addressId);
  if (!target) {
    throw new AppError('Address not found', 404);
  }

  user.addresses.forEach((addr) => {
    addr.isDefault = (addr._id.toString() === addressId);
  });

  await user.save();
  return user.addresses;
};

module.exports = {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
