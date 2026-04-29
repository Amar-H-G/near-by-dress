/**
 * Used by: admin, user, seller
 * Purpose: Centered loading indicator
 */
const LoadingSpinner = ({ fullScreen = false, size = 40 }) => {
  const spinner = (
    <div className="flex items-center justify-center" style={fullScreen ? { minHeight: '100vh' } : {}}>
      <div
        style={{
          width: size,
          height: size,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  return spinner;
};

export default LoadingSpinner;
