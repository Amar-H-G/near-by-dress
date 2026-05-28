import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Clock, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { getBlogs } from '../../shared/services/blog.service';
import { usePageTransition } from '../../shared/animations/usePageTransition';
import { useSettings } from '../../core/contexts/useSettings';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import SEO from '../../shared/seo/SEO';
import SchemaMarkup from '../../shared/seo/SchemaMarkup';

const BlogsPage = () => {
  const pageRef = usePageTransition();
  const { settings } = useSettings();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const { data } = await getBlogs();
        setBlogs(data.data || data || []);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError(err.response?.data?.message || 'Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content ? content.trim().split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div ref={pageRef} className="blogs-page luxury-shell" style={{ minHeight: '80vh' }}>
      <SEO
        title="Fashion Tech Blog & Styling Guides | NearByDress"
        description="Explore the NearByDress blog for local fashion guides, styling insights, product updates, and features from verified local boutique shops."
      />
      <SchemaMarkup type="website" data={settings} />
      {blogs.length > 0 && (
        <SchemaMarkup 
          type="itemlist" 
          data={blogs.map(b => ({ id: b._id, name: b.title, url: `/blogs/${b.slug}` }))} 
        />
      )}

      {/* Hero Section */}
      <header className="listing-hero" style={{ background: 'linear-gradient(135deg, #0f0c20 0%, #15102a 100%)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <span className="luxury-eyebrow fashion-hero-kicker" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: '0 auto 12px auto' }}>
            <Sparkles size={14} /> The Chronicles
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, rgba(255, 255, 255, 0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>
            Fashion, Styling & Local Boutique Insights
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Stay ahead of seasonal fashion trends and discover stories from boutiques right in your neighborhood.
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container" style={{ padding: '60px 24px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444' }}>
            {error}
          </div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
            <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>No blog posts available</h3>
            <p style={{ color: 'var(--text-muted)' }}>Check back later for fresh styling tips and updates.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {blogs.map((post) => (
              <article 
                key={post._id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid rgba(255, 255, 255, 0.06)', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(124, 58, 237, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Link to={`/blogs/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Cover Image */}
                  <div style={{ width: '100%', height: '200px', overflow: 'hidden', background: '#25203b', position: 'relative' }}>
                    <img 
                      src={post.coverImage || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600'} 
                      alt={post.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
                      onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                    />
                    {post.tags && post.tags.length > 0 && (
                      <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--brand-gradient)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {post.tags[0]}
                      </span>
                    )}
                  </div>

                  {/* Post Content */}
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    {/* Metadata row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {formatDate(post.createdAt)}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {calculateReadTime(post.content)} min read
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '12px', color: '#fff' }}>
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.excerpt || post.content?.replace(/<[^>]*>/g, '') || ''}
                    </p>

                    {/* Action link */}
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#a78bfa', fontWeight: 600 }}>
                      Read Article <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogsPage;
