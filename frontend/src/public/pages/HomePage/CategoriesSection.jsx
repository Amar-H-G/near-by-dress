import { Link } from 'react-router-dom';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useSettings } from '../../../core/contexts/useSettings';

const CategoriesSection = ({ categories }) => {
  const { settings } = useSettings();
  const header = settings?.categoriesHeader || {};

  const eyebrow = header.eyebrow || 'Shop by category';
  const title   = header.title   || 'Find the rail that fits your mood';

  if (!categories?.length) return null;

  // Filter root categories for the homepage category grid
  const rootCategories = categories.filter((category) => !category.parentId);
  const displayCategories = rootCategories.length ? rootCategories : categories;

  // Predefined beautiful gradients for category fallbacks to look wow!
  const fallbackGradients = [
    'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
    'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
    'linear-gradient(135deg, #34d399 0%, #059669 100%)',
    'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
  ];

  return (
    <section className="luxury-section-tight">
      <div className="container">
        <div className="luxury-section-header">
          <div>
            <span className="luxury-eyebrow">{eyebrow}</span>
            <h2 className="luxury-title luxury-title-sm">{title}</h2>
          </div>
          <Link to="/products" className="luxury-link">Browse everything</Link>
        </div>

        {/* ── Dynamic Category Card Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginTop: '16px'
        }}>
          {displayCategories.map((category, index) => {
            const gradient = fallbackGradients[index % fallbackGradients.length];
            return (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="fashion-mood-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '0px',
                  overflow: 'hidden',
                  borderRadius: '16px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s',
                  textDecoration: 'none',
                  minHeight: '260px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(124, 58, 237, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Image / Gradient Container */}
                <div style={{
                  width: '100%',
                  height: '150px',
                  background: category.image ? `url(${category.image})` : gradient,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  {!category.image && (
                    <ImageIcon size={32} style={{ opacity: 0.8 }} />
                  )}
                  {/* Subtle fade-in overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)'
                  }} />
                </div>

                {/* Info Container */}
                <div style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--text)',
                      marginBottom: '6px',
                      textTransform: 'capitalize'
                    }}>
                      {category.name}
                    </h3>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      lineHeight: '1.4',
                      margin: '0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {category.description || `Explore handpicked, high-quality ethnic and western styles in our ${category.name} collections.`}
                    </p>
                  </div>

                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    marginTop: '12px'
                  }}>
                    Browse products <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
