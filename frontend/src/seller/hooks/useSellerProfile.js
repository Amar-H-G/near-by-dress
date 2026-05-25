import { useState, useCallback, useEffect } from 'react';
import { getSellerProfile } from '../services/sellerApi';
import toast from 'react-hot-toast';

export const useSellerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getSellerProfile();
      setProfile(data.data.profile);
    } catch {
      toast.error('Failed to load shop profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchProfile);
  }, [fetchProfile]);

  return { profile, loading, refresh: fetchProfile };
};
