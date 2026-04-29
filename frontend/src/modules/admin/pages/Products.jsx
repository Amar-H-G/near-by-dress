import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Star, Flame } from 'lucide-react';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import ConfirmModal from '../components/ConfirmModal';
import ProductModal from '../components/ProductModal';
import Pagination from '../../../shared/components/Pagination';
import { adminGetProducts, adminDeleteProduct, adminToggleFeature } from '../services/admin.service';
import { adminGetShops } from '../services/admin.service';
import toast from 'react-hot-toast';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const Products = () => {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotal]    = useState(1);
  const [search, setSearch]       = useState('');
  const [shopFilter, setShopFilter] = useState('');
  const [shopList, setShopList]   = useState([]);
  const [toDelete, setToDelete]   = useState(null);
  const [deleting, setDeleting]   = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (shopFilter) params.shop = shopFilter;
      const { data } = await adminGetProducts(params);
      setProducts(data.data || []);
      setTotal(data.totalPages || 1);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, shopFilter]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Load shop list for filter dropdown
  useEffect(() => {
    adminGetShops({ limit: 200, status: 'approved' })
      .then(({ data }) => setShopList(data.data || []))
      .catch(() => {});
  }, []);

  const handleSearch = useCallback((q) => { setSearch(q); setPage(1); }, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminDeleteProduct(toDelete._id);
      toast.success(`"${toDelete.name}" deleted`);
      setToDelete(null);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFeature = async (product, type) => {
    try {
      const payload = {
        isFeatured: type === 'featured' ? !product.isFeatured : product.isFeatured,
        isTrending: type === 'trending' ? !product.isTrending : product.isTrending,
      };
      await adminToggleFeature(product._id, payload);
      toast.success('Product updated');
      loadProducts();
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const openAdd  = () => { setEditProduct(null); setModalOpen(true); };
  const openEdit = (p) => { setEditProduct(p);   setModalOpen(true); };

  const columns = [
    {
      key: 'image',
      label: '',
      width: 52,
      render: (p) => (
        <img
          src={p.images?.[0] || 'https://placehold.co/40x40/1A1033/9B8EC4?text=?'}
          alt={p.name}
          className="admin-table-product-img"
        />
      ),
    },
    {
      key: 'name',
      label: 'Product',
      render: (p) => (
        <div>
          <p className="admin-table-primary">{p.name}</p>
          <p className="admin-table-secondary" style={{ textTransform: 'capitalize' }}>{p.category}</p>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (p) => (
        <div>
          <p className="admin-table-primary">₹{p.price}</p>
          {p.discountPrice > 0 && (
            <p className="admin-table-secondary" style={{ textDecoration: 'line-through' }}>₹{p.discountPrice}</p>
          )}
        </div>
      ),
    },
    {
      key: 'shop',
      label: 'Shop',
      render: (p) => (
        <span className="admin-table-date">
          {p.shop?.name || <span style={{ color: 'var(--text-faint)' }}>System</span>}
        </span>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (p) => (
        <span className={`badge ${p.stock > 0 ? 'badge-approved' : 'badge-rejected'}`}>
          {p.stock > 0 ? p.stock : 'Out'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Added',
      render: (p) => <span className="admin-table-date">{formatDate(p.createdAt)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="admin-table-actions">
          <button
            className="admin-icon-btn"
            style={{ color: p.isFeatured ? '#EAB308' : 'var(--text-faint)', background: p.isFeatured ? 'rgba(234, 179, 8, 0.1)' : 'transparent' }}
            onClick={() => handleToggleFeature(p, 'featured')}
            title={p.isFeatured ? 'Unfeature' : 'Feature Product'}
          >
            <Star size={14} fill={p.isFeatured ? 'currentColor' : 'none'} />
          </button>
          <button
            className="admin-icon-btn"
            style={{ color: p.isTrending ? '#EF4444' : 'var(--text-faint)', background: p.isTrending ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}
            onClick={() => handleToggleFeature(p, 'trending')}
            title={p.isTrending ? 'Remove Trending' : 'Mark Trending'}
          >
            <Flame size={14} fill={p.isTrending ? 'currentColor' : 'none'} />
          </button>
          <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }}></div>
          <button
            className="admin-icon-btn admin-icon-btn-primary"
            onClick={() => openEdit(p)}
            title="Edit product"
            id={`edit-product-${p._id}`}
          >
            <Pencil size={14} />
          </button>
          <button
            className="admin-icon-btn admin-icon-btn-danger"
            onClick={() => setToDelete(p)}
            title="Delete product"
            id={`delete-product-${p._id}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Product Management</h1>
          <p className="admin-page-subtitle">Manage all products across the platform — add, edit, or remove.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="admin-add-product">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <SearchBar
          placeholder="Search products..."
          onSearch={handleSearch}
          id="products-search"
        />
        <select
          className="admin-input admin-filter-select"
          value={shopFilter}
          onChange={(e) => { setShopFilter(e.target.value); setPage(1); }}
          id="products-shop-filter"
        >
          <option value="">All Shops</option>
          <option value="system">System Products</option>
          {shopList.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        emptyIcon="📦"
        emptyTitle="No products found"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Product Modal (add / edit) */}
      <ProductModal
        open={modalOpen}
        product={editProduct}
        onClose={() => setModalOpen(false)}
        onSaved={loadProducts}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!toDelete}
        title="Delete Product"
        message={`Permanently delete "${toDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        danger
        loading={deleting}
      />
    </div>
  );
};

export default Products;
