const EmptyState = ({ icon = '📭', title = 'Nothing here yet', message = '', action }) => (
  <div style={{ textAlign: 'center', padding: '80px 24px' }}>
    <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
    <h3 style={{ color: 'var(--text)', marginBottom: 8, fontSize: 20 }}>{title}</h3>
    {message && <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>{message}</p>}
    {action}
  </div>
);

export default EmptyState;
