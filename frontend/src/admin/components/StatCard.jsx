import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ icon, label, value, color, trend, trendLabel, loading }) => (
  <div className="admin-stat-card" style={{ '--stat-color': color }}>
    <div className="admin-stat-icon-wrap">
      {icon}
    </div>
    <div className="admin-stat-body">
      {loading ? (
        <div className="admin-stat-skeleton" />
      ) : (
        <p className="admin-stat-value">{value ?? '—'}</p>
      )}
      <p className="admin-stat-label">{label}</p>
      {trend !== undefined && (
        <div className={`admin-stat-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  </div>
);

export default StatCard;
