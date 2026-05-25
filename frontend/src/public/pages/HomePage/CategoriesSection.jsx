import { Link } from 'react-router-dom';
import { ArrowRight, Shirt } from 'lucide-react';

const CategoriesSection = ({ categories }) => {
  if (!categories?.length) return null;

  const rootCategories = categories.filter((category) => !category.parentId);
  const displayCategories = rootCategories.length ? rootCategories : categories;

  return (
    <section className="luxury-section-tight">
      <div className="container">
        <div className="luxury-section-header">
          <div>
            <span className="luxury-eyebrow">Shop by category</span>
            <h2 className="luxury-title luxury-title-sm">Find the rail that fits your mood</h2>
          </div>
          <Link to="/products" className="luxury-link">Browse everything</Link>
        </div>

        <div className="fashion-category-strip">
          {displayCategories.map((category) => (
            <Link key={category._id} to={`/products?category=${category._id}`} className="fashion-category-pill">
              <Shirt size={18} />
              {category.name}
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
