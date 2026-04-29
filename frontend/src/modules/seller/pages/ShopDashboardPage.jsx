import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getMyShop, createShop, updateShop } from '../services/shop.service';
import { getProducts, deleteProduct, createProduct, updateProduct } from '../../user/services/product.service';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import Pagination from '../../../shared/components/Pagination';
import EmptyState from '../../../shared/components/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Store, Package, X } from 'lucide-react';

const SIZES = ['XS','S','M','L','XL','XXL','Free Size'];
const CATEGORIES = ['ethnic wear','western','kids fashion','accessories','footwear','sarees','other'];

// --- Product Form Modal ---
const ProductModal = ({ shop, existing, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    price: existing?.price || '',
    discountPrice: existing?.discountPrice || '',
    category: existing?.category || '',
    stock: existing?.stock || 0,
    sizes: existing?.sizes || [],
    colors: existing?.colors || [],
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

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
      fd.append('shop', shop._id);
      images.forEach((img) => fd.append('images', img));

      if (existing) await updateProduct(existing._id, fd);
      else await createProduct(fd);

      toast.success(existing ? 'Product updated!' : 'Product created!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass-strong" style={{ borderRadius: 20, padding: 28, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20 }}>{existing ? 'Edit Product' : 'Add Product'}</h2>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: 8 }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input id="prod-name" className="input" placeholder="Product name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <textarea className="input" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} style={{ resize: 'vertical' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input id="prod-price" className="input" type="number" placeholder="Price (₹) *" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required min={0} />
            <input className="input" type="number" placeholder="Discount Price" value={form.discountPrice} onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))} min={0} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <select id="prod-category" className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required style={{ cursor: 'pointer' }}>
              <option value="">Select Category *</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="input" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} min={0} />
          </div>

          {/* Sizes */}
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Sizes</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SIZES.map((s) => (
                <button key={s} type="button" className={`btn ${form.sizes.includes(s) ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => toggleSize(s)}>{s}</button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Colors (comma separated)</p>
            <input className="input" placeholder="Red, Blue, Green" value={form.colors.join(', ')}
              onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value.split(',').map((c) => c.trim()).filter(Boolean) }))} />
          </div>

          {/* Images */}
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Product Images (max 5)</p>
            <input id="prod-images" type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))}
              style={{ color: 'var(--text-muted)', fontSize: 13 }} />
            {images.length > 0 && <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>{images.length} file(s) selected</p>}
          </div>

          <button id="prod-save" type="submit" className="btn btn-primary" style={{ padding: '13px', fontSize: 15 }} disabled={loading}>
            {loading ? 'Saving...' : existing ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main Dashboard ---
const ShopDashboardPage = () => {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('products');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [shopForm, setShopForm] = useState({ name: '', description: '', whatsappNumber: '', address: '', city: '', category: '' });
  const [shopFiles, setShopFiles] = useState({});
  const [shopLoading, setShopLoading] = useState(false);
  const [hasShop, setHasShop] = useState(false);

  const loadShop = async () => {
    try {
      const { data } = await getMyShop();
      setShop(data.data);
      setHasShop(true);
      setShopForm({
        name: data.data.name || '', description: data.data.description || '',
        whatsappNumber: data.data.whatsappNumber || '', address: data.data.address || '',
        city: data.data.city || '', category: data.data.category || '',
      });
    } catch { setHasShop(false); }
    finally { setLoading(false); }
  };

  const loadProducts = async () => {
    if (!shop) return;
    try {
      const { data } = await getProducts({ shop: shop._id, page, limit: 10 });
      setProducts(data.data);
      setPagination({ page: data.page, totalPages: data.totalPages });
    } catch (_) {}
  };

  useEffect(() => { loadShop(); }, []);
  useEffect(() => { if (shop) loadProducts(); }, [shop, page]);

  const handleShopSubmit = async (e) => {
    e.preventDefault();
    setShopLoading(true);
    try {
      const fd = new FormData();
      Object.entries(shopForm).forEach(([k, v]) => v && fd.append(k, v));
      if (shopFiles.logo) fd.append('logo', shopFiles.logo);
      if (shopFiles.coverImage) fd.append('coverImage', shopFiles.coverImage);

      if (hasShop) {
        await updateShop(shop._id, fd);
        toast.success('Shop updated!');
      } else {
        await createShop(fd);
        toast.success('Shop created! Awaiting admin approval.');
      }
      await loadShop();
      setTab('products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save shop');
    } finally {
      setShopLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 4 }}>
              <span className="gradient-text">Shop Dashboard</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Manage your shop and products</p>
          </div>
          {hasShop && shop?.status === 'approved' && (
            <button
              className="btn btn-primary"
              onClick={() => { setEditProduct(null); setShowModal(true); }}
              id="add-product-btn"
            >
              <Plus size={16} /> Add Product
            </button>
          )}
        </div>

        {/* Shop Status Banner */}
        {hasShop && shop?.status === 'pending' && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
            <p style={{ color: '#F59E0B', fontWeight: 600 }}>⏳ Your shop is under review. Admin will approve it shortly.</p>
          </div>
        )}
        {hasShop && shop?.status === 'rejected' && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
            <p style={{ color: '#EF4444', fontWeight: 600 }}>❌ Shop rejected: {shop.rejectionReason}</p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {[
            { id: 'products', label: 'Products', icon: <Package size={15} /> },
            { id: 'shop', label: hasShop ? 'Edit Shop' : 'Create Shop', icon: <Store size={15} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: `2px solid ${tab === t.id ? 'var(--primary)' : 'transparent'}`,
                color: tab === t.id ? 'var(--primary-light)' : 'var(--text-muted)',
                fontWeight: tab === t.id ? 600 : 400, fontSize: 14, transition: 'all 0.2s',
              }}
              id={`tab-${t.id}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {tab === 'products' && (
          <div>
            {!hasShop ? (
              <EmptyState icon="🏪" title="Create your shop first" message="Set up your shop profile before adding products" action={<button className="btn btn-primary" onClick={() => setTab('shop')}>Create Shop</button>} />
            ) : products.length === 0 ? (
              <EmptyState icon="📦" title="No products yet" message="Start adding products to your shop" action={shop?.status === 'approved' ? <button className="btn btn-primary" onClick={() => setShowModal(true)} id="empty-add-product"><Plus size={14} /> Add First Product</button> : null} />
            ) : (
              <>
                <div style={{ display: 'grid', gap: 16 }}>
                  {products.map((p) => (
                    <div key={p._id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <img src={p.images?.[0] || 'https://placehold.co/56x56/231845/9B8EC4?text=?'} alt={p.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                          <span>₹{p.price.toLocaleString()}</span>
                          <span>·</span>
                          <span>{p.category}</span>
                          <span>·</span>
                          <span>Stock: {p.stock}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button className="btn btn-ghost" style={{ padding: '7px 12px' }} onClick={() => { setEditProduct(p); setShowModal(true); }} id={`edit-${p._id}`}><Pencil size={14} /></button>
                        <button className="btn btn-danger" style={{ padding: '7px 12px' }} onClick={() => handleDeleteProduct(p._id)} id={`delete-${p._id}`}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        )}

        {/* Shop Tab */}
        {tab === 'shop' && (
          <div style={{ maxWidth: 600 }}>
            <form onSubmit={handleShopSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <input id="shop-name" className="input" placeholder="Shop Name *" value={shopForm.name} onChange={(e) => setShopForm((f) => ({ ...f, name: e.target.value }))} required />
              <textarea className="input" placeholder="Description" value={shopForm.description} onChange={(e) => setShopForm((f) => ({ ...f, description: e.target.value }))} rows={3} style={{ resize: 'vertical' }} />
              <input id="shop-wa" className="input" placeholder="WhatsApp Number (with country code) *" value={shopForm.whatsappNumber} onChange={(e) => setShopForm((f) => ({ ...f, whatsappNumber: e.target.value }))} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input className="input" placeholder="City" value={shopForm.city} onChange={(e) => setShopForm((f) => ({ ...f, city: e.target.value }))} />
                <input className="input" placeholder="Category" value={shopForm.category} onChange={(e) => setShopForm((f) => ({ ...f, category: e.target.value }))} />
              </div>
              <input className="input" placeholder="Address" value={shopForm.address} onChange={(e) => setShopForm((f) => ({ ...f, address: e.target.value }))} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Shop Logo</p>
                  <input id="shop-logo" type="file" accept="image/*" onChange={(e) => setShopFiles((f) => ({ ...f, logo: e.target.files[0] }))} style={{ color: 'var(--text-muted)', fontSize: 13 }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Cover Image</p>
                  <input id="shop-cover" type="file" accept="image/*" onChange={(e) => setShopFiles((f) => ({ ...f, coverImage: e.target.files[0] }))} style={{ color: 'var(--text-muted)', fontSize: 13 }} />
                </div>
              </div>

              <button id="shop-save" type="submit" className="btn btn-primary" style={{ padding: '13px', fontSize: 15 }} disabled={shopLoading}>
                {shopLoading ? 'Saving...' : hasShop ? 'Update Shop' : 'Create Shop'}
              </button>
            </form>
          </div>
        )}
      </div>

      {showModal && shop && (
        <ProductModal
          shop={shop}
          existing={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSaved={loadProducts}
        />
      )}
    </div>
  );
};

export default ShopDashboardPage;
