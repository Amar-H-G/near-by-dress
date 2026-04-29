/**
 * Used by: admin, user, seller
 * Purpose: Reusable pagination controls
 */
const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);

  for (let i = left; i <= right; i++) pages.push(i);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '32px 0', flexWrap: 'wrap' }}>
      {/* Prev */}
      <button
        className="btn btn-ghost"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        style={{ padding: '8px 16px', opacity: page === 1 ? 0.4 : 1 }}
        id="pagination-prev"
      >
        ← Prev
      </button>

      {/* First page */}
      {left > 1 && (
        <>
          <button className={`btn ${page === 1 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onPageChange(1)} style={{ padding: '8px 14px', minWidth: 40 }}>1</button>
          {left > 2 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>}
        </>
      )}

      {/* Page numbers */}
      {pages.map((p) => (
        <button
          key={p}
          className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onPageChange(p)}
          style={{ padding: '8px 14px', minWidth: 40 }}
          id={`pagination-page-${p}`}
        >
          {p}
        </button>
      ))}

      {/* Last page */}
      {right < totalPages && (
        <>
          {right < totalPages - 1 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>}
          <button className={`btn ${page === totalPages ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onPageChange(totalPages)} style={{ padding: '8px 14px', minWidth: 40 }}>{totalPages}</button>
        </>
      )}

      {/* Next */}
      <button
        className="btn btn-ghost"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        style={{ padding: '8px 16px', opacity: page === totalPages ? 0.4 : 1 }}
        id="pagination-next"
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
