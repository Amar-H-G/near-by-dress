import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ExternalLink, Settings } from 'lucide-react';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Pagination from '../../shared/components/Pagination';
import RejectionModal from '../components/RejectionModal';
import { adminGetSellers, adminUpdateShopStatus } from '../services/admin.service.js';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['', 'pending', 'approved', 'rejected'];

const statusLabel = { '': 'All', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const Sellers = () => {
  const navigate = useNavigate();
  const [sellers, setSellers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotal]  = useState(1);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [actioning, setActioning] = useState(null);
  const [rejectingShop, setRejectingShop] = useState(null);

  const loadSellers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminGetSellers({ page, limit: 10, search, status });
      setSellers(data.data || []);
      setTotal(data.totalPages || 1);
    } catch {
      toast.error('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { queueMicrotask(loadSellers); }, [loadSellers]);

  const handleSearch = useCallback((q) => { setSearch(q); setPage(1); }, []);
  const handleStatus = (s) => { setStatus(s); setPage(1); };

  const handleShopAction = async (shopId, newStatus, rejectionReason = null) => {
    if (newStatus === 'rejected' && !rejectionReason) {
      setRejectingShop(shopId);
      return;
    }

    setActioning(shopId);
    try {
      await adminUpdateShopStatus(shopId, { status: newStatus, rejectionReason });
      toast.success(`Shop ${newStatus}`);
      setRejectingShop(null);
      loadSellers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActioning(null);
    }
  };

  const columns = [
    {
      key: 'seller',
      label: 'Seller',
      render: (s) => (
        <div className="admin-table-user">
          <div className="admin-table-avatar">{s.name?.charAt(0).toUpperCase()}</div>
          <div>
            <p className="admin-table-primary">{s.name}</p>
            <p className="admin-table-secondary">{s.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'shop',
      label: 'Shop',
      render: (s) =>
        s.shop ? (
          <div>
            <p className="admin-table-primary">{s.shop.name}</p>
            <p className="admin-table-secondary">{s.shop.city || 'No city'}</p>
          </div>
        ) : (
          <span className="admin-table-date">No shop yet</span>
        ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (s) =>
        s.shop ? (
          <span className={`badge badge-${s.shop.status}`}>{s.shop.status}</span>
        ) : (
          <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-faint)' }}>
            No shop
          </span>
        ),
    },
    {
      key: 'joined',
      label: 'Joined',
      render: (s) => <span className="admin-table-date">{formatDate(s.createdAt)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (s) => {
        if (!s.shop) return <span className="admin-table-date">—</span>;
        const busy = actioning === s.shop._id;
        return (
          <div className="admin-table-actions">
            {s.shop.status === 'pending' && (
              <>
                <button
                  className="btn btn-accent"
                  style={{ padding: '5px 12px', fontSize: 12 }}
                  onClick={() => handleShopAction(s.shop._id, 'approved')}
                  disabled={busy}
                  id={`approve-seller-${s._id}`}
                >
                  <CheckCircle size={12} /> Approve
                </button>
                <button
                  className="btn btn-danger"
                  style={{ padding: '5px 12px', fontSize: 12 }}
                  onClick={() => handleShopAction(s.shop._id, 'rejected')}
                  disabled={busy}
                  id={`reject-seller-${s._id}`}
                >
                  <XCircle size={12} /> Reject
                </button>
              </>
            )}
            {s.shop.status === 'approved' && (
              <button
                className="btn btn-danger"
                style={{ padding: '5px 12px', fontSize: 12 }}
                onClick={() => handleShopAction(s.shop._id, 'rejected')}
                disabled={busy}
                id={`revoke-seller-${s._id}`}
              >
                Revoke
              </button>
            )}
            {s.shop.status === 'rejected' && (
              <button
                className="btn btn-accent"
                style={{ padding: '5px 12px', fontSize: 12 }}
                onClick={() => handleShopAction(s.shop._id, 'approved')}
                disabled={busy}
                id={`re-approve-seller-${s._id}`}
              >
                Re-Approve
              </button>
            )}
            <button
              className="admin-icon-btn"
              onClick={() => navigate(`/admin/shops/edit/${s.shop._id}`)}
              title="Edit Shop Details"
            >
              <Settings size={14} />
            </button>
            <a
              href={`/shops/${s.shop._id}`}
              target="_blank"
              rel="noreferrer"
              className="admin-icon-btn"
              title="View shop"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        );
      },
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Seller Management</h1>
          <p className="admin-page-subtitle">Manage shop owners and approve or reject their shops.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <SearchBar
          placeholder="Search sellers by name or email..."
          onSearch={handleSearch}
          id="sellers-search"
        />
        <div className="admin-filter-pills">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s || 'all'}
              className={`admin-pill ${status === s ? 'admin-pill-active' : ''}`}
              onClick={() => handleStatus(s)}
              id={`seller-filter-${s || 'all'}`}
            >
              {statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={sellers}
        loading={loading}
        emptyIcon="🛍️"
        emptyTitle="No sellers found"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <RejectionModal
        open={!!rejectingShop}
        onClose={() => setRejectingShop(null)}
        onConfirm={(reason) => handleShopAction(rejectingShop, 'rejected', reason)}
        loading={!!actioning}
      />
    </div>
  );
};

export default Sellers;
