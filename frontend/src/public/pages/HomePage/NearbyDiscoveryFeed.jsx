/**
 * NearbyDiscoveryFeed.jsx
 * High-performance, premium geo-spatial discovery feed for customers.
 * Displays shops, latest products, featured rails, and trending products within a dynamic radius (default 15 KM).
 * Allows the customer to interactively adjust the discovery radius or query by pincode fallback.
 */

import { useEffect, useState, useTransition } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Loader2, Sparkles, Flame,
  Compass, ArrowRight, ShoppingBag, HelpCircle
} from 'lucide-react';
import { useLocation } from '../../../core/contexts/useLocation';
import { getNearbyDiscoveryFeed } from '../../../shared/location/services/locationService';
import ShopCard from '../../components/ShopCard';
import ProductCard from '../../components/ProductCard';

const NearbyDiscoveryFeed = () => {
  const { location, setManualPincode, detect } = useLocation();
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [radiusKm, setRadiusKm] = useState(15); // Standardized 15 KM default!
  const [isPending, startTransition] = useTransition();

  const hasCoords = location.status === 'resolved' && location.lat && location.lng;
  const hasPincode = !!location.pincode;

  useEffect(() => {
    if (!hasCoords && !hasPincode) return;

    let active = true;
    setLoading(true);

    const queryParams = {
      radiusKm,
      ...(hasCoords
        ? { lat: location.lat, lng: location.lng }
        : { pincode: location.pincode }),
    };

    getNearbyDiscoveryFeed(queryParams)
      .then((data) => {
        if (!active) return;
        setFeed(data);
      })
      .catch(() => {
        if (active) setFeed(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [hasCoords, hasPincode, location.lat, location.lng, location.pincode, radiusKm]);

  // If no location has been selected/initialized, do not display anything (or show default)
  if (location.status === 'idle' || (!hasCoords && !hasPincode)) {
    return null;
  }

  const { shops = [], products = [], featuredItems = [], trendingProducts = [] } = feed || {};

  const handleRadiusChange = (newRadius) => {
    startTransition(() => {
      setRadiusKm(newRadius);
    });
  };

  return (
    <section className="luxury-section" style={{ background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Decorative Gradients */}
      <div style={{
        position: 'absolute', top: '-10%', left: '5%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.04) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Core Control Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexWrap: 'wrap', gap: '24px', borderBottom: '1px solid var(--border)',
          paddingBottom: '24px', marginBottom: '32px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Compass size={14} color="#7c3aed" className="animate-spin" style={{ animationDuration: '4s' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#7c3aed' }}>
                Local discovery network
              </span>
            </div>
            <h2 className="luxury-title" style={{ fontSize: '28px', margin: 0 }}>
              NearBy Fashion Rail
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px', maxWidth: '480px', lineHeight: '1.5' }}>
              Exquisite curated items and boutiques active near{' '}
              <strong style={{ color: 'var(--text)' }}>
                {location.city || location.pincode || 'your location'}
              </strong>
            </p>
          </div>

          {/* Discovery Boundary Slider Panel */}
          <div style={{
            background: 'var(--surface)', padding: '16px 20px', borderRadius: '20px',
            border: '1.5px solid var(--border)', boxShadow: '0 8px 30px rgba(0,0,0,0.02)',
            display: 'flex', flexDirection: 'column', gap: 10, minWidth: '260px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Proximity Boundary</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#7c3aed', background: 'rgba(124, 58, 237, 0.08)', padding: '2px 8px', borderRadius: '6px' }}>
                {radiusKm} KM radius
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={radiusKm}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer', height: '6px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-faint)', fontWeight: 600 }}>
              <span>5 KM</span>
              <span>25 KM</span>
              <span>50 KM</span>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '16px' }}>
            <Loader2 size={32} className="animate-spin" color="#7c3aed" />
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>Scanning 2dsphere boundaries...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            
            {/* 1. NEARBY BOUTIQUES */}
            {shops.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={16} color="#7c3aed" />
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Nearby Fashion Stores</h3>
                  </div>
                  <Link to="/shops" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '13px', fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}>
                    View All Shops <ArrowRight size={13} />
                  </Link>
                </div>
                <div className="shop-grid">
                  {shops.slice(0, 3).map((shop) => (
                    <ShopCard key={shop._id} shop={shop} />
                  ))}
                </div>
              </div>
            )}

            {/* 2. FEATURED NEARBY ITEMS */}
            {featuredItems.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '20px' }}>
                  <Sparkles size={16} color="#f59e0b" style={{ fill: '#f59e0b' }} />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Curator Featured Nearby</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                  {featuredItems.slice(0, 4).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* 3. TRENDING NEARBY PRODUCTS */}
            {trendingProducts.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '20px' }}>
                  <Flame size={16} color="#ef4444" style={{ fill: '#ef4444' }} />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Trending Near You</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                  {trendingProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* 4. RECENTLY UPLOADED PRODUCTS */}
            {products.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingBag size={16} color="#10b981" />
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Fresh Boutique Arrivals</h3>
                  </div>
                  <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '13px', fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}>
                    Shop Collection <ArrowRight size={13} />
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                  {products.slice(0, 8).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {shops.length === 0 && products.length === 0 && (
              <div style={{
                padding: '56px 24px', textAlign: 'center', background: 'var(--surface)',
                borderRadius: '24px', border: '1px solid var(--border)', maxWidth: '600px', margin: '0 auto'
              }}>
                <MapPin size={36} color="var(--text-faint)" style={{ marginBottom: '16px' }} />
                <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px' }}>Fashion-Tech Silo Quiet</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 24px' }}>
                  There are no verified boutique listings currently pinning themselves within a {radiusKm} KM radius.
                  Try expanding your search radius to find stores nearby!
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    onClick={() => handleRadiusChange(30)}
                    style={{
                      padding: '10px 20px', borderRadius: '12px', border: 'none', background: '#7c3aed',
                      color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Expand to 30 KM
                  </button>
                  <button
                    onClick={() => handleRadiusChange(50)}
                    style={{
                      padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border)',
                      background: 'none', color: 'var(--text)', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Expand to 50 KM
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default NearbyDiscoveryFeed;
