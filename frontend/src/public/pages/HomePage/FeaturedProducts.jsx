import { Link } from 'react-router-dom';

const FeaturedProducts = ({ products }) => {
  if (!products.length) return null;

  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 12 }}>Featured <span className="gradient-text">Products</span></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {products.map((p) => (
            <Link to={`/products/${p._id}`} key={p._id} className="card" style={{ display: 'block', textDecoration: 'none', overflow: 'hidden' }}>
              <img src={(typeof p.images?.[0] === 'object' ? p.images[0]?.url : p.images?.[0]) || 'https://placehold.co/400x400'} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>{p.name}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: 600 }}>â‚¹{p.discountPrice || p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
