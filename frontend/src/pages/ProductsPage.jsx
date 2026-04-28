import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/product.service';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = ['all', 'ethnic wear', 'western', 'kids fashion', 'accessories', 'footwear', 'sarees'];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(search);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 12 };
      if (category && category !== 'all') params.category = category;
      if (search) params.search = search;
      const { data } = await getProducts(params);
      setProducts(data.data);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, category, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam('search', searchInput.trim());
  };

  const handlePageChange = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '40px 0 32px' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 8 }}>
            Explore <span className="gradient-text">Products</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
            {pagination.total > 0 ? `${pagination.total} products found` : 'Search our collection'}
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, maxWidth: 600, marginBottom: 24 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input
                id="product-search"
                className="input"
                style={{ paddingLeft: 40 }}
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Search</button>
            {search && (
              <button type="button" className="btn btn-ghost" onClick={() => { setSearchInput(''); setParam('search', ''); }} style={{ padding: '10px 12px' }}>
                <X size={16} />
              </button>
            )}
          </form>

          {/* Category filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`btn ${(category === cat || (!category && cat === 'all')) ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '7px 18px', fontSize: 13, borderRadius: 999, textTransform: 'capitalize' }}
                onClick={() => setParam('category', cat === 'all' ? '' : cat)}
                id={`filter-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container section" style={{ paddingTop: 40 }}>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#EF4444' }}>{error}</div>
        ) : products.length === 0 ? (
          <EmptyState icon="👗" title="No products found" message="Try adjusting your filters or search terms" />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24, marginBottom: 16 }}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
