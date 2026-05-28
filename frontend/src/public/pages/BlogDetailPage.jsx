import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Clock, ArrowLeft, Tag, Sparkles } from 'lucide-react';
import { getBlogBySlug } from '../../shared/services/blog.service';
import { usePageTransition } from '../../shared/animations/usePageTransition';
import { useSettings } from '../../core/contexts/useSettings';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import SEO from '../../shared/seo/SEO';
import SchemaMarkup from '../../shared/seo/SchemaMarkup';

const BlogDetailPage = () => {
  const pageRef = usePageTransition();
  const { slug } = useParams();
  const { settings } = useSettings();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await getBlogBySlug(slug);
        setPost(data.data || data);
      } catch (err) {
        console.error('Error fetching blog detail:', err);
        setError(err.response?.data?.message || 'Blog article not found');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBlogPost();
  }, [slug]);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0', minHeight: '80vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', minHeight: '80vh' }}>
        <div style={{ padding: '40px 20px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '1.25rem', fontWeight: 600 }}>Error</h3>
          <p>{error || 'The requested article could not be located.'}</p>
          <Link to="/blogs" className="btn btn-secondary" style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blogs' },
    { name: post.title, url: `/blogs/${post.slug}` }
  ];

  return (
    <div ref={pageRef} className="blog-detail-page luxury-shell" style={{ paddingBottom: '80px' }}>
      <SEO
        title={post.title}
        description={post.excerpt || post.content?.substring(0, 150) || ''}
        keywords={post.keywords?.join(', ') || post.tags?.join(', ') || ''}
        ogImage={post.coverImage}
        ogType="article"
      />
      <SchemaMarkup type="article" data={post} />
      <SchemaMarkup type="breadcrumbs" data={breadcrumbs} />

      {/* Main Container */}
      <article className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Back Link */}
        <Link 
          to="/blogs" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--text-muted)', 
            textDecoration: 'none', 
            fontSize: '0.9rem', 
            marginBottom: '32px',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#fff'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={16} /> Back to articles
        </Link>

        {/* Article Header */}
        <header style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {post.tags?.map((tag, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)', color: '#c084fc', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', color: '#fff', marginBottom: '20px' }}>
            {post.title}
          </h1>

          {/* Author metadata */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                {post.author ? post.author.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <span style={{ color: '#fff', fontWeight: 600, display: 'block' }}>{post.author || 'Editorial Team'}</span>
                <span style={{ fontSize: '0.8rem' }}>Fashion Advisor</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> {formatDate(post.createdAt)}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} /> {calculateReadTime(post.content)} min read
              </span>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div style={{ width: '100%', maxHeight: '450px', borderRadius: '16px', overflow: 'hidden', marginBottom: '40px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <img 
            src={post.coverImage || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200'} 
            alt={post.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Content body */}
        <div 
          className="blog-content-body"
          style={{ 
            fontSize: '1.1rem', 
            lineHeight: '1.8', 
            color: 'rgba(255, 255, 255, 0.85)',
            letterSpacing: '-0.003em',
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Styled headings, paragraphs, and list layout injected inline */}
      <style>{`
        .blog-content-body p {
          margin-bottom: 24px;
        }
        .blog-content-body h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #fff;
          margin-top: 40px;
          margin-bottom: 16px;
          letter-spacing: -0.01em;
        }
        .blog-content-body h3 {
          font-size: 1.4rem;
          font-weight: 650;
          color: #fff;
          margin-top: 32px;
          margin-bottom: 12px;
        }
        .blog-content-body ul, .blog-content-body ol {
          margin-bottom: 24px;
          padding-left: 20px;
        }
        .blog-content-body li {
          margin-bottom: 8px;
        }
        .blog-content-body blockquote {
          border-left: 4px solid var(--primary-color, #7c3aed);
          background: rgba(124, 58, 237, 0.05);
          padding: 16px 24px;
          margin: 32px 0;
          border-radius: 0 12px 12px 0;
          font-style: italic;
          color: rgba(255,255,255,0.95);
        }
        .blog-content-body img {
          max-width: 100%;
          border-radius: 12px;
          margin: 32px 0;
        }
      `}</style>
    </div>
  );
};

export default BlogDetailPage;
