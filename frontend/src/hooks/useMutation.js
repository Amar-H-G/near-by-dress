import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Generic mutation hook (create / update / delete)
 */
const useMutation = (mutationFn, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(...args);
      if (options.onSuccess) options.onSuccess(result);
      if (options.successMsg) toast.success(options.successMsg);
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg);
      if (options.onError) options.onError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  return { mutate, loading, error };
};

export default useMutation;
