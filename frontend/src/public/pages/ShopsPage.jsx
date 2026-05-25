import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getShops } from '../../shared/services/shop.service.js';
import ShopCard from '../components/ShopCard';
import Pagination from '../../shared/components/Pagination';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import EmptyState from '../../shared/components/EmptyState';
import { Search, X } from 'lucide-react';

const ShopsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shops, setShops] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const page = parseInt(searchParams.get('page') || '1');
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
      setShops(data.data);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shops');
    } finally {
      setLoading(false);
    }
  }, [page, city, search]);

  useEffect(() => { queueMicrotask(fetchShops); }, [fetchShops]);

  const handleFilter = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (searchInput.trim()) p.set('search', searchInput.trim());
    if (cityInput.trim()) p.set('city', cityInput.trim().toLowerCase());
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSearchInput(''); setCityInput('');
    setSearchParams({});
  };

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '40px 0 32px' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 8 }}>
            Discover <span className="gradient-text">Local Shops</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
            {pagination.total > 0 ? `${pagination.total} shops found` : 'Find shops near you'}
          </p>

          <form onSubmit={handleFilter} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', maxWidth: 700 }}>
            <div style={{ flex: '2 1 200px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input id="shop-search" className="input" style={{ paddingLeft: 40 }} placeholder="Search shops..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
            </div>
            <div style={{ flex: '1 1 140px' }}>
              <input id="shop-city" className="input" placeholder="City..." value={cityInput} onChange={(e) => setCityInput(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Search</button>
            {(search || city) && (
              <button type="button" className="btn btn-ghost" onClick={clearFilters} style={{ padding: '10px 12px' }}>
                <X size={16} />
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 40 }}>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#EF4444' }}>{error}</div>
        ) : shops.length === 0 ? (
          <EmptyState icon="🏪" title="No shops found" message="Try a different city or search term" />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {shops.map((shop) => <ShopCard key={shop._id} shop={shop} />)}
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => { const params = new URLSearchParams(searchParams); params.set('page', p); setSearchParams(params); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </>
        )}
      </div>
    </div>
  );
};

export default ShopsPage;
