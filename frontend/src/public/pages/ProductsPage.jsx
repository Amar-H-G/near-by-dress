import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { getProducts } from '../services/product.service.js';
import { useLocation as useUserLocation } from '../../core/contexts/useLocation';
import ProductCard from '../components/ProductCard';
import Pagination from '../../shared/components/Pagination';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import EmptyState from '../../shared/components/EmptyState';
import SEO from '../../shared/seo/SEO';
import SchemaMarkup from '../../shared/seo/SchemaMarkup';
import { useSettings } from '../../core/contexts/useSettings';
import DynamicFilters from '../components/DynamicFilters';

const normalizeProducts = (payload) => {
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.products)) return payload.data.products;
  return [];
};

const ProductsPage = () => {
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const { location: userLoc } = useUserLocation();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1', 10);
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
      const productList = normalizeProducts(data);
      setProducts(productList);
      setPagination({
        page: data.page || data.data?.page || page,
        totalPages: data.totalPages || data.data?.totalPages || 1,
        total: data.total || data.data?.total || productList.length,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [searchParams, page]);

  useEffect(() => {
    queueMicrotask(fetchProducts);
  }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchInput.trim());
  };

  const handlePageChange = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', nextPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="marketplace-page luxury-shell">
      <SEO
        title={settings?.seo?.productsTitle || 'Premium Fashion Collection'}
        description={settings?.seo?.productsDescription || 'Browse local boutiques.'}
      />
      <SchemaMarkup type="website" data={settings} />
      <header className="listing-hero">
        <div className="container">
          <span className="luxury-eyebrow fashion-hero-kicker">
            <Sparkles size={14} /> Marketplace collection
          </span>
          <h1>Explore fashion from verified shops</h1>
          <p>{pagination.total > 0 ? `${pagination.total} products found` : 'Search new arrivals, categories, colors, and styles.'}</p>

          {/* Location context pill */}
          {userLoc.city && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
              marginTop: 4,
            }}>
              <MapPin size={11} />
              Showing from {userLoc.city}{userLoc.state ? `, ${userLoc.state}` : ''}
            </div>
          )}

          <form onSubmit={handleSearch} className="listing-toolbar">
            <div className="luxury-search">
              <Search size={17} />
              <input
                className="luxury-input"
                placeholder="Search name, category, color..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="luxury-btn luxury-btn-primary">Search</button>
            <button type="button" className="luxury-btn luxury-btn-secondary mobile-only" onClick={() => setIsMobileFiltersOpen(true)}>
              <SlidersHorizontal size={18} />
              Filters
            </button>
          </form>
        </div>
      </header>

      <div className="container listing-layout">
        <aside className="listing-sidebar">
          <DynamicFilters onFilterChange={handleFilterChange} activeFilters={Object.fromEntries([...searchParams])} />
        </aside>

        <main>
          <div className="listing-results-header">
            <div>
              <span className="luxury-eyebrow">Fresh rails</span>
              <h2 className="luxury-title luxury-title-sm">{search ? `Results for "${search}"` : 'Latest products'}</h2>
            </div>
            <p>{pagination.total || products.length} styles</p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="listing-error">{error}</div>
          ) : products.length === 0 ? (
            <EmptyState icon="" title="No products found" message="Try adjusting your filters or search terms." />
          ) : (
            <>
              <div className="fashion-product-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </main>
      </div>

      {isMobileFiltersOpen && (
        <div className="mobile-filter-backdrop" onClick={() => setIsMobileFiltersOpen(false)}>
          <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Filters</h3>
              <button type="button" className="marketplace-icon-btn" onClick={() => setIsMobileFiltersOpen(false)} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>
            <DynamicFilters onFilterChange={handleFilterChange} activeFilters={Object.fromEntries([...searchParams])} />
            <button type="button" className="luxury-btn luxury-btn-primary drawer-action" onClick={() => setIsMobileFiltersOpen(false)}>
              Show results
            </button>
          </div>
        </div>
      )}


    </div>
  );
};

export default ProductsPage;
