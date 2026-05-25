import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ShoppingBag, Store, Package, Clock, MapPin, CheckCircle, XCircle, ArrowRight,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import RejectionModal from '../components/RejectionModal';
import { adminGetStats, adminGetShops, adminUpdateShopStatus } from '../services/admin.service.js';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pendingShops, setPendingShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [rejectingShop, setRejectingShop] = useState(null);
  const [actioning, setActioning] = useState(false);
  const navigate = useNavigate();

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await adminGetStats();
      setStats(data.data);
    } catch {
      toast.error('Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadPending = useCallback(async () => {
    setShopsLoading(true);
    try {
      const { data } = await adminGetShops({ status: 'pending', limit: 5 });
      setPendingShops(data.data || []);
    } catch {
      /* silent */
    } finally {
      setShopsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadStats();
      loadPending();
    });
  }, [loadStats, loadPending]);

  const handleShopStatus = async (id, status, rejectionReason = null) => {
    if (status === 'rejected' && !rejectionReason) {
      setRejectingShop(id);
      return;
    }

    setActioning(true);
    try {
      await adminUpdateShopStatus(id, { status, rejectionReason });
      toast.success(`Shop ${status}`);
      setRejectingShop(null);
      loadPending();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActioning(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: <Users size={22} />, color: '#7C3AED' },
    { label: 'Total Sellers', value: stats?.totalSellers, icon: <ShoppingBag size={22} />, color: '#EC4899' },
    { label: 'Total Shops', value: stats?.totalShops, icon: <Store size={22} />, color: '#06B6D4' },
    { label: 'Total Products', value: stats?.totalProducts, icon: <Package size={22} />, color: '#10B981' },
    { label: 'Pending Approval', value: stats?.pendingShops, icon: <Clock size={22} />, color: '#F59E0B' },
    { label: 'Approved Shops', value: stats?.approvedShops, icon: <CheckCircle size={22} />, color: '#10B981' },
    { label: 'Rejected Shops', value: stats?.rejectedShops, icon: <XCircle size={22} />, color: '#EF4444' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard Overview</h1>
          <p className="admin-page-subtitle">Welcome back, Admin. Here's what's happening today.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="admin-stat-grid">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} loading={statsLoading} />
        ))}
      </div>

      {/* Pending Approvals */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Pending Shop Approvals</h2>
          <button
            className="admin-section-link"
            onClick={() => navigate('/admin/shops')}
            id="dashboard-view-all-shops"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        {shopsLoading ? (
          <div className="admin-pending-list">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="admin-pending-skeleton" />
            ))}
          </div>
        ) : pendingShops.length === 0 ? (
          <div className="admin-empty admin-empty-inline">
            <CheckCircle size={32} style={{ color: '#10B981' }} />
            <p className="admin-empty-title">All caught up!</p>
            <p className="admin-empty-sub">No shops awaiting approval.</p>
          </div>
        ) : (
          <div className="admin-pending-grid">
            {pendingShops.map((shop) => (
              <div key={shop._id} className="admin-pending-card">
                <div className="admin-pending-card-top">
                  <div
                    className="admin-pending-card-cover"
                    style={{
                      background: shop.coverImage
                        ? `url(${shop.coverImage}) center/cover`
                        : 'linear-gradient(135deg, #1e1b4b, #312e81)'
                    }}
                  />
                  <div className="admin-pending-card-status">
                    <Clock size={10} /> Pending
                  </div>
                </div>

                <div className="admin-pending-card-body">
                  <div className="admin-pending-card-main">
                    <img
                      src={shop.logo || `https://placehold.co/40x40/1A1033/9B8EC4?text=${shop.name?.charAt(0)}`}
                      alt={shop.name}
                      className="admin-pending-card-logo"
                    />
                    <div className="admin-pending-card-titles">
                      <h4 className="admin-pending-card-name">{shop.name}</h4>
                      <p className="admin-pending-card-cat">{shop.category || 'General Fashion'}</p>
                    </div>
                  </div>

                  <div className="admin-pending-card-details">
                    <div className="admin-pending-detail-item">
                      <MapPin size={12} />
                      <span>{shop.city || 'Location N/A'}</span>
                    </div>
                    <div className="admin-pending-detail-item">
                      <Users size={12} />
                      <span>{shop.owner?.name || 'Unknown Owner'}</span>
                    </div>
                  </div>

                  <div className="admin-pending-card-footer">
                    <button
                      className="admin-btn-action admin-btn-approve"
                      onClick={() => handleShopStatus(shop._id, 'approved')}
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      className="admin-btn-icon admin-btn-reject"
                      onClick={() => handleShopStatus(shop._id, 'rejected')}
                      title="Reject"
                    >
                      <XCircle size={16} />
                    </button>
                    <button
                      className="admin-btn-icon"
                      onClick={() => navigate(`/admin/shops`)}
                      title="View Details"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RejectionModal
        open={!!rejectingShop}
        onClose={() => setRejectingShop(null)}
        onConfirm={(reason) => handleShopStatus(rejectingShop, 'rejected', reason)}
        loading={actioning}
      />
    </div>
  );
};

export default Dashboard;
