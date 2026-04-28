import { useEffect, useState, useCallback } from 'react';
import { adminGetStats, adminGetUsers, adminGetProducts, deleteProduct, createProduct } from '../services/product.service';
import { adminGetShops, updateShopStatus, getShops } from '../services/shop.service';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { LayoutDashboard, Store, Package, Users, CheckCircle, XCircle, Plus, Trash2, X } from 'lucide-react';

const CATEGORIES = ['ethnic wear','western','kids fashion','accessories','footwear','sarees','other'];
const SIZES = ['XS','S','M','L','XL','XXL','Free Size'];

// Admin Add Product Modal
const AdminProductModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({ name: '', description: '', price: '', discountPrice: '', category: '', stock: 0, sizes: [], colors: [], isSystemProduct: true });
  const [shopList, setShopList] = useState([]);
  const [selectedShop, setSelectedShop] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getShops({ limit: 100 }).then(({ data }) => setShopList(data.data)).catch(() => {});
  }, []);

  const toggleSize = (s) => setForm((f) => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((i) => fd.append(k, i));
        else fd.append(k, v);
      });
      if (selectedShop) { fd.append('shop', selectedShop); fd.set('isSystemProduct', false); }
      images.forEach((img) => fd.append('images', img));
      await createProduct(fd);
      toast.success('Product added!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass-strong" style={{ borderRadius: 20, padding: 28, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20 }}>Admin: Add Product</h2>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: 8 }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Shop assignment */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Assign to Shop (optional – leave empty for system product)</label>
            <select id="admin-prod-shop" className="input" value={selectedShop} onChange={(e) => setSelectedShop(e.target.value)} style={{ cursor: 'pointer' }}>
              <option value="">System Product (no shop)</option>
              {shopList.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.city || 'N/A'})</option>)}
            </select>
          </div>
          <input id="admin-prod-name" className="input" placeholder="Product name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <textarea className="input" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} style={{ resize: 'vertical' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input id="admin-prod-price" className="input" type="number" placeholder="Price (₹) *" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required min={0} />
            <input className="input" type="number" placeholder="Discount Price" value={form.discountPrice} onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))} min={0} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <select id="admin-prod-cat" className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required style={{ cursor: 'pointer' }}>
              <option value="">Category *</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="input" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} min={0} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SIZES.map((s) => <button key={s} type="button" className={`btn ${form.sizes.includes(s) ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => toggleSize(s)}>{s}</button>)}
          </div>
          <input className="input" placeholder="Colors (comma separated)" value={form.colors.join(', ')} onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value.split(',').map((c) => c.trim()).filter(Boolean) }))} />
          <input id="admin-prod-images" type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} style={{ color: 'var(--text-muted)', fontSize: 13 }} />
          <button id="admin-prod-save" type="submit" className="btn btn-primary" style={{ padding: '13px', fontSize: 15 }} disabled={loading}>
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Stat Card
const StatCard = ({ icon, label, value, color }) => (
  <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>{value ?? '—'}</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</p>
    </div>
  </div>
);

// Main Admin Dashboard
const AdminDashboardPage = () => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [shopPage, setShopPage] = useState(1);
  const [prodPage, setProdPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [shopPagination, setShopPagination] = useState({ page: 1, totalPages: 1 });
  const [prodPagination, setProdPagination] = useState({ page: 1, totalPages: 1 });
  const [userPagination, setUserPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const loadStats = useCallback(async () => {
    try { const { data } = await adminGetStats(); setStats(data.data); } catch (_) {}
  }, []);

  const loadShops = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminGetShops({ page: shopPage, limit: 10, status: statusFilter });
      setShops(data.data); setShopPagination({ page: data.page, totalPages: data.totalPages });
    } catch (_) {} finally { setLoading(false); }
  }, [shopPage, statusFilter]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminGetProducts({ page: prodPage, limit: 10 });
      setProducts(data.data); setProdPagination({ page: data.page, totalPages: data.totalPages });
    } catch (_) {} finally { setLoading(false); }
  }, [prodPage]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminGetUsers({ page: userPage, limit: 10 });
      setUsers(data.data); setUserPagination({ page: data.page, totalPages: data.totalPages });
    } catch (_) {} finally { setLoading(false); }
  }, [userPage]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (tab === 'shops' || tab === 'overview') loadShops(); }, [tab, loadShops]);
  useEffect(() => { if (tab === 'products') loadProducts(); }, [tab, loadProducts]);
  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab, loadUsers]);

  const handleShopStatus = async (id, status) => {
    const reason = status === 'rejected' ? prompt('Rejection reason:') : null;
    if (status === 'rejected' && !reason) return;
    try {
      await updateShopStatus(id, { status, rejectionReason: reason });
      toast.success(`Shop ${status}`);
      loadShops(); loadStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await deleteProduct(id); toast.success('Deleted'); loadProducts(); loadStats(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={15} /> },
    { id: 'shops', label: 'Shops', icon: <Store size={15} /> },
    { id: 'products', label: 'Products', icon: <Package size={15} /> },
    { id: 'users', label: 'Users', icon: <Users size={15} /> },
  ];

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}><span className="gradient-text">Admin Dashboard</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Full control over NearByDress platform</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: `2px solid ${tab === t.id ? 'var(--primary)' : 'transparent'}`,
              color: tab === t.id ? 'var(--primary-light)' : 'var(--text-muted)',
              fontWeight: tab === t.id ? 600 : 400, fontSize: 14, whiteSpace: 'nowrap',
            }} id={`admin-tab-${t.id}`}>{t.icon} {t.label}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
              <StatCard icon={<Users size={22} />} label="Total Users" value={stats?.totalUsers} color="#7C3AED" />
              <StatCard icon={<Store size={22} />} label="Total Shops" value={stats?.totalShops} color="#EC4899" />
              <StatCard icon={<Package size={22} />} label="Total Products" value={stats?.totalProducts} color="#10B981" />
              <StatCard icon={<Store size={22} />} label="Pending Approval" value={stats?.pendingShops} color="#F59E0B" />
            </div>

            {/* Pending shops */}
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Pending Shop Approvals</h2>
            {shops.filter((s) => s.status === 'pending').length === 0 ? (
              <EmptyState icon="✅" title="All caught up!" message="No shops awaiting approval" />
            ) : (
              shops.filter((s) => s.status === 'pending').map((s) => (
                <div key={s._id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <img src={s.logo || `https://placehold.co/48x48/231845/9B8EC4?text=${s.name?.charAt(0)}`} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600 }}>{s.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.owner?.email} · {s.city}</p>
                  </div>
                  <span className="badge badge-pending">pending</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-accent" style={{ padding: '7px 14px', fontSize: 13 }} onClick={() => handleShopStatus(s._id, 'approved')} id={`approve-${s._id}`}><CheckCircle size={14} /> Approve</button>
                    <button className="btn btn-danger" style={{ padding: '7px 14px', fontSize: 13 }} onClick={() => handleShopStatus(s._id, 'rejected')} id={`reject-${s._id}`}><XCircle size={14} /> Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Shops */}
        {tab === 'shops' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['', 'pending', 'approved', 'rejected'].map((s) => (
                <button key={s} className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '7px 18px', fontSize: 13, borderRadius: 999, textTransform: 'capitalize' }} onClick={() => { setStatusFilter(s); setShopPage(1); }} id={`shop-filter-${s || 'all'}`}>
                  {s || 'All'}
                </button>
              ))}
            </div>
            {loading ? <LoadingSpinner /> : shops.length === 0 ? <EmptyState icon="🏪" title="No shops" /> : (
              <>
                {shops.map((s) => (
                  <div key={s._id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                    <img src={s.logo || `https://placehold.co/48x48/231845/9B8EC4?text=${s.name?.charAt(0)}`} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <p style={{ fontWeight: 600 }}>{s.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.owner?.email} · {s.city}</p>
                    </div>
                    <span className={`badge badge-${s.status}`}>{s.status}</span>
                    {s.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-accent" style={{ padding: '7px 14px', fontSize: 12 }} onClick={() => handleShopStatus(s._id, 'approved')} id={`approve-shop-${s._id}`}><CheckCircle size={13} /> Approve</button>
                        <button className="btn btn-danger" style={{ padding: '7px 14px', fontSize: 12 }} onClick={() => handleShopStatus(s._id, 'rejected')} id={`reject-shop-${s._id}`}><XCircle size={13} /> Reject</button>
                      </div>
                    )}
                  </div>
                ))}
                <Pagination page={shopPagination.page} totalPages={shopPagination.totalPages} onPageChange={setShopPage} />
              </>
            )}
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button className="btn btn-primary" onClick={() => setShowProductModal(true)} id="admin-add-product"><Plus size={15} /> Add Product</button>
            </div>
            {loading ? <LoadingSpinner /> : products.length === 0 ? <EmptyState icon="📦" title="No products" /> : (
              <>
                {products.map((p) => (
                  <div key={p._id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                    <img src={p.images?.[0] || 'https://placehold.co/48x48/231845/9B8EC4?text=?'} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <p style={{ fontWeight: 600 }}>{p.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>₹{p.price} · {p.category} · Shop: {p.shop?.name || 'System'}</p>
                    </div>
                    <button className="btn btn-danger" style={{ padding: '7px 12px' }} onClick={() => handleDeleteProduct(p._id)} id={`admin-delete-${p._id}`}><Trash2 size={14} /></button>
                  </div>
                ))}
                <Pagination page={prodPagination.page} totalPages={prodPagination.totalPages} onPageChange={setProdPage} />
              </>
            )}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            {loading ? <LoadingSpinner /> : users.length === 0 ? <EmptyState icon="👥" title="No users" /> : (
              <>
                {users.map((u) => (
                  <div key={u._id} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 15, flexShrink: 0 }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600 }}>{u.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</p>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)', background: 'var(--surface-2)', padding: '3px 10px', borderRadius: 999, textTransform: 'capitalize' }}>{u.role.replace('_', ' ')}</span>
                  </div>
                ))}
                <Pagination page={userPagination.page} totalPages={userPagination.totalPages} onPageChange={setUserPage} />
              </>
            )}
          </div>
        )}
      </div>

      {showProductModal && (
        <AdminProductModal onClose={() => setShowProductModal(false)} onSaved={() => { loadProducts(); loadStats(); }} />
      )}
    </div>
  );
};

export default AdminDashboardPage;
