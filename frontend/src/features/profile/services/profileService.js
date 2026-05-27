import API from '../../../core/api/client';

export const fetchProfile = async () => {
  const { data } = await API.get('/profile');
  return data.data;
};

export const updateProfile = async (profileData) => {
  const { data } = await API.put('/profile', profileData);
  return data.data;
};

export const fetchAddresses = async () => {
  const { data } = await API.get('/profile/addresses');
  return data.data;
};

export const addAddress = async (addressData) => {
  const { data } = await API.post('/profile/addresses', addressData);
  return data.data;
};

export const updateAddress = async (addressId, addressData) => {
  const { data } = await API.put(`/profile/addresses/${addressId}`, addressData);
  return data.data;
};

export const deleteAddress = async (addressId) => {
  const { data } = await API.delete(`/profile/addresses/${addressId}`);
  return data.data;
};

export const setDefaultAddress = async (addressId) => {
  const { data } = await API.patch(`/profile/addresses/${addressId}/default`);
  return data.data;
};
