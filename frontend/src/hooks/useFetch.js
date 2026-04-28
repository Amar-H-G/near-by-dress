import { useState, useCallback } from 'react';

/**
 * Generic data fetching hook with pagination support
 */
const useFetch = (fetchFn) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await fetchFn(params);
      setData(res.data);
      setPagination({
        page: res.page,
        limit: res.limit,
        total: res.total,
        totalPages: res.totalPages,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  return { data, pagination, loading, error, fetch };
};

export default useFetch;
