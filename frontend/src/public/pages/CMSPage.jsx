import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSettings } from '../../core/contexts/useSettings';
import SEO from '../../shared/seo/SEO';
import { HelpCircle, Shield, FileText, Info, BookOpen } from 'lucide-react';

const iconMap = {
  about: Info,
  privacy: Shield,
  terms: FileText,
  faq: HelpCircle,
  help: BookOpen
};

const CMSPage = () => {
  const { slug } = useParams();
  const { settings } = useSettings();

  const activePages = useMemo(() => {
    return (settings.customPages || []).filter(p => p.isActive);
  }, [settings.customPages]);

  const currentPage = useMemo(() => {
    return activePages.find(p => p.slug === slug);
  }, [activePages, slug]);

  if (!currentPage) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px', maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 64, fontWeight: 800, marginBottom: 16, background: 'linear-gradient(90deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Content Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 14 }}>The custom page you are looking for is either disabled or does not exist.</p>
        <Link to="/" className="btn btn-primary" style={{ padding: '12px 32px' }}>Go Back Home</Link>
      </div>
    );
  }

  const IconComponent = iconMap[currentPage.slug] || FileText;

  return (
    <div style={{ background: 'var(--surface)', minHeight: '80vh', padding: '40px 24px' }}>
      <SEO 
        title={`${currentPage.title} | ${settings.siteName || 'NearByDress'}`}
        description={`${currentPage.title} information page for ${settings.siteName || 'NearByDress'}`}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--text)', fontWeight: 500 }}>{currentPage.title}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, alignItems: 'start' }}>
          
          {/* Sidebar */}
          <div style={{ 
            background: 'var(--surface-2)', 
            border: '1px solid var(--border)', 
            borderRadius: 16, 
            padding: 24, 
            position: 'sticky', 
            top: 100 
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 16 }}>
              Quick Navigation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activePages.map((page) => {
                const PageIcon = iconMap[page.slug] || FileText;
                const isSelected = page.slug === slug;
                return (
                  <Link
                    key={page.slug}
                    to={`/pages/${page.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 10,
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: 600,
                      color: isSelected ? '#fff' : 'var(--text)',
                      background: isSelected ? 'var(--primary)' : 'transparent',
                      transition: 'all 0.2s',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'var(--border)';
                        e.currentTarget.style.color = 'var(--primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text)';
                      }
                    }}
                  >
                    <PageIcon size={16} />
                    {page.title}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Main content area */}
          <div style={{ 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            borderRadius: 20, 
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
          }}>
            {/* Header Hero banner */}
            <div style={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--accent2))', 
              padding: '48px 40px', 
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 20
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                width: 64,
                height: 64,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)'
              }}>
                <IconComponent size={32} />
              </div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{currentPage.title}</h1>
                <p style={{ margin: '8px 0 0', opacity: 0.85, fontSize: 14 }}>Last updated recently</p>
              </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '40px 48px', minHeight: 400 }}>
              <div style={{ 
                fontSize: 16, 
                lineHeight: 1.8, 
                color: 'var(--text)', 
                whiteSpace: 'pre-line' 
              }}>
                {currentPage.content}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CMSPage;
