import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, Search, Sparkles, X } from 'lucide-react';
import { getShops } from '../../shared/services/shop.service.js';
import { getNearbyShops } from '../../shared/location/services/locationService';
import { useLocation as useUserLocation } from '../../core/contexts/useLocation';
import ShopCard from '../components/ShopCard';
import Pagination from '../../shared/components/Pagination';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import SEO from '../../shared/seo/SEO';
import SchemaMarkup from '../../shared/seo/SchemaMarkup';
import { useSettings } from '../../core/contexts/useSettings';
import EmptyState from '../../shared/components/EmptyState';

const normalizeShops = (payload) => {
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.shops)) return payload.data.shops;
  return [];
};

const ShopsPage = () => {
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const { location: userLoc } = useUserLocation();
  const [shops, setShops] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nearbyMode, setNearbyMode] = useState(false);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const city = searchParams.get('city') || '';
  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [cityInput, setCityInput] = useState(city || userLoc.city || '');

  const fetchShops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let shopList, paginationData;

      if (nearbyMode && userLoc.lat && userLoc.lng) {
        // Geo-spatial query by coordinates
        const data = await getNearbyShops({ lat: userLoc.lat, lng: userLoc.lng, radiusKm: 20, page, limit: 12 });
        shopList = Array.isArray(data.data) ? data.data : [];
        paginationData = { page: data.page || page, totalPages: data.totalPages || 1, total: data.total || shopList.length };
      } else {
        // Standard city/search filter
        const params = { page, limit: 12 };
        if (city) params.city = city;
        if (search) params.search = search;
        const { data } = await getShops(params);
        shopList = normalizeShops(data);
        paginationData = {
          page: data.page || data.data?.page || page,
          totalPages: data.totalPages || data.data?.totalPages || 1,
          total: data.total || data.data?.total || shopList.length,
        };
      }

      setShops(shopList);
      setPagination(paginationData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shops');
    } finally {
      setLoading(false);
    }
  }, [page, city, search, nearbyMode, userLoc.lat, userLoc.lng]);

  useEffect(() => {
    queueMicrotask(fetchShops);
  }, [fetchShops]);

  const handleFilter = (e) => {
    e.preventDefault();
    setNearbyMode(false);
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set('search', searchInput.trim());
    if (cityInput.trim()) params.set('city', cityInput.trim().toLowerCase());
    setSearchParams(params);
  };

  const handleNearMe = () => {
    setNearbyMode(true);
    setSearchInput('');
    setCityInput('');
    setSearchParams({});
  };

  const clearFilters = () => {
    setNearbyMode(false);
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
      <SEO
        title={settings?.seo?.shopsTitle || 'Verified Local Fashion Boutiques'}
        description={settings?.seo?.shopsDescription || 'Find the best clothing shops and design boutiques in your area.'}
      />
      <SchemaMarkup type="localbusiness" data={{
        name: settings?.siteName || 'NearByDress Network',
        description: settings?.seo?.shopsDescription || 'Local Boutique network',
      }} />
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

            {/* Near Me button — only shown when GPS coords available */}
            {userLoc.lat && userLoc.lng && (
              <button
                type="button"
                onClick={handleNearMe}
                className={`luxury-btn ${nearbyMode ? 'luxury-btn-primary' : 'luxury-btn-secondary'}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
              >
                <Navigation size={15} />
                Near Me
              </button>
            )}

            {(search || city || nearbyMode) && (
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
            <span className="luxury-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {nearbyMode ? <><Navigation size={12} /> GPS filtered</> : 'Verified sellers'}
            </span>
            <h2 className="luxury-title luxury-title-sm">
              {nearbyMode
                ? `Shops within 20 km`
                : city
                  ? `Shops in ${city}`
                  : 'Featured storefronts'}
            </h2>
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
