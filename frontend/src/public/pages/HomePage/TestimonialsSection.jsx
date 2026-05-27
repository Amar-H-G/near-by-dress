import { useState } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from '../../../core/contexts/useSettings';

const TestimonialsSection = () => {
  const { settings } = useSettings();
  const list = settings?.testimonials || [];
  const [index, setIndex] = useState(0);

  if (!list?.length) return null;

  const next = () => setIndex((index + 1) % list.length);
  const prev = () => setIndex((index - 1 + list.length) % list.length);

  const t = list[index];

  return (
    <section className="luxury-section-tight" style={{ background: 'rgba(124, 58, 237, 0.03)' }}>
      <div className="container" style={{ maxWidth: '800px', textAlign: 'center', position: 'relative' }}>
        <div style={{
          display: 'inline-flex',
          padding: '12px',
          background: 'rgba(124, 58, 237, 0.08)',
          color: 'var(--primary)',
          borderRadius: '50%',
          marginBottom: '20px'
        }}>
          <Quote size={28} />
        </div>

        <blockquote style={{
          fontSize: '20px',
          lineHeight: '1.6',
          fontStyle: 'italic',
          color: 'var(--text)',
          marginBottom: '24px',
          fontWeight: 400
        }}>
          "{t.quote}"
        </blockquote>

        <div>
          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--text)' }}>{t.author}</strong>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.role}</span>
        </div>

        {list.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '28px' }}>
            <button
              onClick={prev}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '1px solid var(--border)', background: 'var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)'
              }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '1px solid var(--border)', background: 'var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)'
              }}
              aria-label="Next testimonial"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
