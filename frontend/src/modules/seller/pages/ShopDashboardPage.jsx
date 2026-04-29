import { useSellerStats } from '../hooks/useSellerStats';
import StatsCard from '../components/StatsCard';
import { Package, Eye, Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShopDashboardPage = () => {
  const { stats, loading } = useSellerStats();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <StatsCard title="Total Products" value={stats?.totalProducts || 0} icon={<Package size={24} />} color="var(--primary)" />
        <StatsCard title="Total Views (Estimated)" value={stats?.totalViews || 0} icon={<Eye size={24} />} color="var(--success)" />
        <StatsCard title="Shop Rating" value="0.0" icon={<Star size={24} />} color="var(--accent)" />
      </div>

      <div className="card">
        <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Recent Products</h3>
          <Link to="/seller/products" className="btn btn-ghost" style={{ fontSize: 13, padding: '6px 12px' }}>View All</Link>
        </div>

        {stats?.recentProducts?.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: 16 }}>No products added yet.</p>
            <Link to="/seller/add-product" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 14 }}>
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Date Added</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentProducts?.map(product => (
                  <tr key={product._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={product.images?.[0] || 'https://placehold.co/40x40'} alt={product.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                        <span style={{ fontWeight: 500, color: 'var(--text)' }}>{product.name}</span>
                      </div>
                    </td>
                    <td>₹{product.discountPrice || product.price}</td>
                    <td>
                      <span className={`badge badge-${product.isActive ? 'approved' : 'pending'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDashboardPage;
