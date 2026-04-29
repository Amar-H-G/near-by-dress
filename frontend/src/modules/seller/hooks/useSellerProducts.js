import { useState, useCallback, useEffect } from 'react';
import { getSellerProducts } from '../services/sellerApi';
import toast from 'react-hot-toast';

export const useSellerProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({ page: 1, limit: 10, ...initialParams });
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getSellerProducts(params);
      setProducts(data.data.products);
      setPagination({
        total: data.data.total,
        totalPages: data.data.totalPages,
        page: data.data.page,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    params,
    setParams,
    pagination,
    refresh: fetchProducts,
  };
};
