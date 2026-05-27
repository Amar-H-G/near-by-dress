import { Sparkles, ArrowRight } from 'lucide-react';

const COLLECTION_TYPES = [
  { name: 'Bridal & Lehenga', count: '12 styles', image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=300&q=80' },
  { name: 'Heritage Sarees', count: '24 styles', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80' },
  { name: 'Modern Anarkali', count: '16 styles', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80' },
  { name: 'Bespoke Kurtis', count: '30 styles', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80' }
];

const ShopCollections = () => {
  return (
    <section className="luxury-shop-collections">
      <div className="container">
        
        <div className="collections-header-row">
          <div>
            <span className="luxury-eyebrow">
              <Sparkles size={11} />
              Boutique Departments
            </span>
            <h2 className="collections-title">Curated Collections</h2>
          </div>
          <p className="collections-subtitle-right">Handcrafted garments categorised for seamless exploration. Discover bespoke designs and ethnic rails.</p>
        </div>

        <div className="collections-list-grid">
          {COLLECTION_TYPES.map((col, idx) => (
            <div key={idx} className="collection-card-item">
              <div className="collection-card-image">
                <img src={col.image} alt={col.name} loading="lazy" />
                <div className="image-overlay" />
              </div>
              <div className="collection-card-content">
                <span className="style-count">{col.count}</span>
                <h3>{col.name}</h3>
                <span className="explore-arrow">
                  Explore <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ShopCollections;
