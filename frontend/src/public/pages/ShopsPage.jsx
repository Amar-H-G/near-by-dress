import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Search, Sparkles, X } from 'lucide-react';
import { getShops } from '../../shared/services/shop.service.js';
import ShopCard from '../components/ShopCard';
import Pagination from '../../shared/components/Pagination';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import EmptyState from '../../shared/components/EmptyState';

const normalizeShops = (payload) => {
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.shops)) return payload.data.shops;
  return [];
};

const ShopsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shops, setShops] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const city = searchParams.get('city') || '';
  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [cityInput, setCityInput] = useState(city);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 12 };
      if (city) params.city = city;
      if (search) params.search = search;
      const { data } = await getShops(params);
      const shopList = normalizeShops(data);
      setShops(shopList);
      setPagination({
        page: data.page || data.data?.page || page,
        totalPages: data.totalPages || data.data?.totalPages || 1,
        total: data.total || data.data?.total || shopList.length,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shops');
    } finally {
      setLoading(false);
    }
  }, [page, city, search]);

  useEffect(() => {
    queueMicrotask(fetchShops);
  }, [fetchShops]);

  const handleFilter = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set('search', searchInput.trim());
    if (cityInput.trim()) params.set('city', cityInput.trim().toLowerCase());
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchInput('');
    setCityInput('');
    setSearchParams({});
  };

  const handlePageChange = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', nextPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="marketplace-page luxury-shell">
      <header className="listing-hero listing-hero-shops">
        <div className="container">
          <span className="luxury-eyebrow fashion-hero-kicker">
            <Sparkles size={14} /> Boutique network
          </span>
          <h1>Discover local fashion shops</h1>
          <p>{pagination.total > 0 ? `${pagination.total} shops found` : 'Search trusted boutiques, sellers, and fashion storefronts near you.'}</p>

          <form onSubmit={handleFilter} className="shop-search-toolbar">
            <div className="luxury-search">
              <Search size={17} />
              <input
                id="shop-search"
                className="luxury-input"
                placeholder="Search shops..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="luxury-search">
              <MapPin size={17} />
              <input
                id="shop-city"
                className="luxury-input"
                placeholder="City..."
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
              />
            </div>
            <button type="submit" className="luxury-btn luxury-btn-primary">Search</button>
            {(search || city) && (
              <button type="button" className="marketplace-icon-btn" onClick={clearFilters} aria-label="Clear filters">
                <X size={17} />
              </button>
            )}
          </form>
        </div>
      </header>

      <main className="container shopfront-content">
        <div className="listing-results-header">
          <div>
            <span className="luxury-eyebrow">Verified sellers</span>
            <h2 className="luxury-title luxury-title-sm">{city ? `Shops in ${city}` : 'Featured storefronts'}</h2>
          </div>
          <p>{pagination.total || shops.length} shops</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="listing-error">{error}</div>
        ) : shops.length === 0 ? (
          <EmptyState icon="" title="No shops found" message="Try a different city or search term." />
        ) : (
          <>
            <div className="shop-grid">
              {shops.map((shop) => <ShopCard key={shop._id} shop={shop} />)}
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </main>
    </div>
  );
};

export default ShopsPage;
