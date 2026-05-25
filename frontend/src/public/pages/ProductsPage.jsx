import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/product.service.js';
import ProductCard from '../components/ProductCard';
import Pagination from '../../shared/components/Pagination';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import EmptyState from '../../shared/components/EmptyState';
import DynamicFilters from '../components/DynamicFilters';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = Object.fromEntries([...searchParams]);
      params.limit = 12;
      if (!params.page) params.page = page;
      
      const { data } = await getProducts(params);
      setProducts(data.data);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [searchParams, page]);

  useEffect(() => { queueMicrotask(fetchProducts); }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchInput.trim());
  };

  const handlePageChange = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '40px 0 32px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 8 }}>
                Explore <span className="gradient-text">Products</span>
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>
                {pagination.total > 0 ? `${pagination.total} products found` : 'Search our collection'}
              </p>
            </div>
            
            {/* Search */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 500 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 40 }}
                  placeholder="Search name, category, color..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">Search</button>
              <button 
                type="button" 
                className="btn btn-ghost mobile-only" 
                onClick={() => setIsMobileFiltersOpen(true)}
                style={{ display: 'none' }}
              >
                <SlidersHorizontal size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }} className="product-listing-grid">
          {/* Sidebar Filters */}
          <aside className="desktop-filters">
            <div style={{ position: 'sticky', top: 100 }}>
              <DynamicFilters 
                onFilterChange={handleFilterChange} 
                activeFilters={Object.fromEntries([...searchParams])} 
              />
            </div>
          </aside>

          {/* Main Content */}
          <main>
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#EF4444' }}>{error}</div>
            ) : products.length === 0 ? (
              <EmptyState icon="👗" title="No products found" message="Try adjusting your filters or search terms" />
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24, marginBottom: 40 }}>
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, backdropFilter: 'blur(4px)' }}
          onClick={() => setIsMobileFiltersOpen(false)}
        >
          <div 
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--surface)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Filters</h3>
              <button onClick={() => setIsMobileFiltersOpen(false)}><X size={24} /></button>
            </div>
            <DynamicFilters 
              onFilterChange={handleFilterChange} 
              activeFilters={Object.fromEntries([...searchParams])} 
            />
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: 24, padding: 16 }}
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              Show Results
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 992px) {
          .product-listing-grid { grid-template-columns: 1fr !important; }
          .desktop-filters { display: none; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductsPage;
