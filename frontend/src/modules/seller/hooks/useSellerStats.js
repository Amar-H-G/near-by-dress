import { useState, useCallback, useEffect } from 'react';
import { getSellerDashboardStats } from '../services/sellerApi';
import toast from 'react-hot-toast';

export const useSellerStats = () => {
  const [stats, setStats] = useState({ totalProducts: 0, totalViews: 0, recentProducts: [] });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getSellerDashboardStats();
      setStats(data.data);
    } catch (err) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
};
