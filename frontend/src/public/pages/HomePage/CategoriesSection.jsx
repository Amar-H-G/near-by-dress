import { Link } from 'react-router-dom';

const CategoriesSection = ({ categories }) => {
  if (!categories?.length) return null;

  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 12 }}>Shop by <span className="gradient-text">Category</span></h2>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="btn btn-ghost"
              style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none', borderRadius: 999 }}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
