import { Activity } from 'lucide-react';

const StatsCard = ({ title, value, icon, color = 'var(--primary)' }) => {
  return (
    <div className="admin-stat-card" style={{ '--stat-color': color }}>
      <div className="admin-stat-icon-wrap">
        {icon || <Activity size={24} />}
      </div>
      <div className="admin-stat-body">
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{title}</div>
      </div>
    </div>
  );
};

export default StatsCard;
