import { useEffect, useState, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, ExternalLink, Plus, Settings } from 'lucide-react';
import DataTable from '../components/DataTable';
import Pagination from '../../shared/components/Pagination';
import SearchBar from '../components/SearchBar';
import RejectionModal from '../components/RejectionModal';
import { adminGetShops, adminUpdateShopStatus } from '../services/admin.service.js';
import { getShopProducts } from '../../shared/services/shop.service.js';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['', 'pending', 'approved', 'rejected'];
const statusLabel = { '': 'All', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

const Shops = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotal] = useState(1);
  const [statusFilter, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [shopProducts, setShopProds] = useState({});
  const [prodsLoading, setProdsLoading] = useState(false);
  const [rejectingShop, setRejectingShop] = useState(null);
  const [actioning, setActioning] = useState(false);

  const loadShops = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminGetShops({ page, limit: 10, status: statusFilter, search });
      setShops(data.data || []);
      setTotal(data.totalPages || 1);
    } catch {
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { queueMicrotask(loadShops); }, [loadShops]);

  const handleSearch = useCallback((q) => { setSearch(q); setPage(1); }, []);
  const handleStatusFilter = (s) => { setStatus(s); setPage(1); };

  const handleToggleProducts = async (shopId) => {
    if (expanded === shopId) { setExpanded(null); return; }
    setExpanded(shopId);
    if (shopProducts[shopId]) return; // already loaded
    setProdsLoading(true);
    try {
      const { data } = await getShopProducts(shopId, { limit: 5 });
      setShopProds((prev) => ({ ...prev, [shopId]: data.data || [] }));
    } catch {
      setShopProds((prev) => ({ ...prev, [shopId]: [] }));
    } finally {
      setProdsLoading(false);
    }
  };

  const handleShopAction = async (id, status, rejectionReason = null) => {
    if (status === 'rejected' && !rejectionReason) {
      setRejectingShop(id);
      return;
    }

    setActioning(true);
    try {
      await adminUpdateShopStatus(id, { status, rejectionReason });
      toast.success(`Shop ${status}`);
      setRejectingShop(null);
      loadShops();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActioning(false);
    }
  };

  const columns = [
    {
      key: 'info',
      label: 'Shop',
      render: (s) => (
        <div className="admin-table-shop">
          <img
            src={s.logo || `https://placehold.co/40x40/1A1033/9B8EC4?text=${s.name?.charAt(0)}`}
            alt={s.name}
            className="admin-table-shop-logo"
          />
          <div>
            <p className="admin-table-primary">{s.name}</p>
            <p className="admin-table-secondary">{s.city || 'No city'} · {s.owner?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (s) => <span className={`badge badge-${s.status}`}>{s.status}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="admin-table-actions">
          {s.status === 'pending' && (
            <>
              <button
                className="btn btn-accent"
                style={{ padding: '5px 12px', fontSize: 12 }}
                onClick={() => handleShopAction(s._id, 'approved')}
                id={`shop-approve-${s._id}`}
              >
                <CheckCircle size={12} /> Approve
              </button>
              <button
                className="btn btn-danger"
                style={{ padding: '5px 12px', fontSize: 12 }}
                onClick={() => handleShopAction(s._id, 'rejected')}
                id={`shop-reject-${s._id}`}
              >
                <XCircle size={12} /> Reject
              </button>
            </>
          )}
          {s.status === 'approved' && (
            <button
              className="btn btn-danger"
              style={{ padding: '5px 12px', fontSize: 12 }}
              onClick={() => handleShopAction(s._id, 'rejected')}
              id={`shop-revoke-${s._id}`}
            >
              Revoke
            </button>
          )}
          {s.status === 'rejected' && (
            <button
              className="btn btn-accent"
              style={{ padding: '5px 12px', fontSize: 12 }}
              onClick={() => handleShopAction(s._id, 'approved')}
              id={`shop-reapprove-${s._id}`}
            >
              Re-Approve
            </button>
          )}
          <button
            className="admin-icon-btn"
            onClick={() => navigate(`/admin/shops/edit/${s._id}`)}
            title="Edit Shop Details"
          >
            <Settings size={14} />
          </button>
          <button
            className="admin-icon-btn"
            onClick={() => handleToggleProducts(s._id)}
            title="View products"
            id={`shop-toggle-${s._id}`}
          >
            {expanded === s._id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <a
            href={`/shops/${s._id}`}
            target="_blank"
            rel="noreferrer"
            className="admin-icon-btn"
            title="View shop page"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Shop Management</h1>
          <p className="admin-page-subtitle">View all shops, manage status and browse their products.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/admin/shops/add')}
          id="add-new-shop-btn"
        >
          <Plus size={18} /> Add New Shop
        </button>
      </div>

      <div className="admin-toolbar">
        <SearchBar
          placeholder="Search shops..."
          onSearch={handleSearch}
          id="shops-search"
        />
        <div className="admin-filter-pills">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s || 'all'}
              className={`admin-pill ${statusFilter === s ? 'admin-pill-active' : ''}`}
              onClick={() => handleStatusFilter(s)}
              id={`shop-filter-${s || 'all'}`}
            >
              {statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table + expandable product rows */}
      {loading ? (
        <DataTable columns={columns} data={[]} loading />
      ) : shops.length === 0 ? (
        <DataTable columns={columns} data={[]} emptyIcon="🏪" emptyTitle="No shops found" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} style={{ textAlign: col.align || 'left' }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <Fragment key={shop._id}>
                  <tr>
                    {columns.map((col) => (
                      <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                        {col.render ? col.render(shop) : shop[col.key]}
                      </td>
                    ))}
                  </tr>
                  {expanded === shop._id && (
                    <tr key={`${shop._id}-products`} className="admin-table-expand-row">
                      <td colSpan={columns.length}>
                        <div className="admin-expand-panel">
                          <p className="admin-expand-label">Products in this shop</p>
                          {prodsLoading ? (
                            <p className="admin-table-date">Loading...</p>
                          ) : !shopProducts[shop._id] || shopProducts[shop._id].length === 0 ? (
                            <p className="admin-table-date">No products found.</p>
                          ) : (
                            <div className="admin-expand-products">
                              {shopProducts[shop._id].map((p) => (
                                <div key={p._id} className="admin-expand-product-item">
                                  <img
                                    src={(typeof p.images?.[0] === 'object' ? p.images[0]?.url : p.images?.[0]) || 'https://placehold.co/44x44/1A1033/9B8EC4?text=?'}
                                    alt={p.name}
                                    className="admin-expand-product-img"
                                  />
                                  <div>
                                    <p className="admin-table-primary" style={{ fontSize: 13 }}>{p.name}</p>
                                    <p className="admin-table-secondary">₹{p.price}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <RejectionModal
        open={!!rejectingShop}
        onClose={() => setRejectingShop(null)}
        onConfirm={(reason) => handleShopAction(rejectingShop, 'rejected', reason)}
        loading={actioning}
      />
    </div>
  );
};

export default Shops;
