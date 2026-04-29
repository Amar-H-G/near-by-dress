import { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { adminCreateProduct, adminUpdateProduct } from '../services/admin.service';
import { getShops } from '../../seller/services/shop.service';
import { useSettings } from '../../../context/SettingsContext';
import toast from 'react-hot-toast';
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const EMPTY = {
  name: '', description: '', price: '', discountPrice: '',
  category: '', stock: 0, sizes: [], colors: '', isSystemProduct: true,
};

const ProductModal = ({ open, product, onClose, onSaved }) => {
  const { categories } = useSettings();
  const isEdit = !!product;
  const [form, setForm] = useState(EMPTY);
  const [shopList, setShopList] = useState([]);
  const [selectedShop, setSelectedShop] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reset / populate form
  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        category: product.category || '',
        stock: product.stock || 0,
        sizes: product.sizes || [],
        colors: (product.colors || []).join(', '),
        isSystemProduct: !product.shop,
      });
      setSelectedShop(product.shop?._id || product.shop || '');
    } else {
      setForm(EMPTY);
      setSelectedShop('');
    }
    setImages([]);
  }, [open, product, isEdit]);

  // Load shops for dropdown
  useEffect(() => {
    if (open) {
      getShops({ limit: 200 })
        .then(({ data }) => setShopList(data.data || []))
        .catch(() => {});
    }
  }, [open]);

  if (!open) return null;

  const toggleSize = (s) =>
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('discountPrice', form.discountPrice);
      fd.append('category', form.category);
      fd.append('stock', form.stock);
      form.sizes.forEach((s) => fd.append('sizes', s));
      form.colors.split(',').map((c) => c.trim()).filter(Boolean).forEach((c) => fd.append('colors', c));

      if (selectedShop) {
        fd.append('shop', selectedShop);
        fd.append('isSystemProduct', 'false');
      } else {
        fd.append('isSystemProduct', 'true');
      }
      images.forEach((img) => fd.append('images', img));

      if (isEdit) {
        await adminUpdateProduct(product._id, fd);
        toast.success('Product updated!');
      } else {
        await adminCreateProduct(fd);
        toast.success('Product added!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-box admin-modal-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-modal-icon admin-modal-icon-primary">
            <Package size={20} />
          </div>
          <button className="admin-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <h3 className="admin-modal-title" id="product-modal-title">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h3>
        <p className="admin-modal-msg">
          {isEdit ? 'Update product details below.' : 'Fill in the product details. Shop assignment is optional.'}
        </p>

        <form onSubmit={handleSubmit} className="admin-product-form">
          {/* Shop assignment */}
          <div className="admin-form-group">
            <label className="admin-form-label">Assign to Shop</label>
            <select
              id="admin-prod-shop"
              className="admin-input"
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
            >
              <option value="">System Product (no shop)</option>
              {shopList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} {s.city ? `— ${s.city}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Product Name *</label>
              <input
                id="admin-prod-name"
                className="admin-input"
                placeholder="e.g. Floral Summer Dress"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Category *</label>
              <select
                id="admin-prod-cat"
                className="admin-input"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.parentId ? `${c.parentId.name} → ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Description</label>
            <textarea
              className="admin-input"
              placeholder="Product description..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Price (₹) *</label>
              <input
                id="admin-prod-price"
                className="admin-input"
                type="number"
                placeholder="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
                min={0}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Discount Price (₹)</label>
              <input
                className="admin-input"
                type="number"
                placeholder="0"
                value={form.discountPrice}
                onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))}
                min={0}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Stock</label>
              <input
                className="admin-input"
                type="number"
                placeholder="0"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                min={0}
              />
            </div>
          </div>

          {/* Sizes */}
          <div className="admin-form-group">
            <label className="admin-form-label">Sizes</label>
            <div className="admin-size-grid">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`admin-size-btn ${form.sizes.includes(s) ? 'admin-size-btn-active' : ''}`}
                  onClick={() => toggleSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Colors (comma separated)</label>
              <input
                className="admin-input"
                placeholder="Red, Blue, Green"
                value={form.colors}
                onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
              />
            </div>
          </div>

          {/* Images */}
          <div className="admin-form-group">
            <label className="admin-form-label">
              {isEdit ? 'Replace Images (optional)' : 'Product Images'}
            </label>
            <input
              id="admin-prod-images"
              type="file"
              multiple
              accept="image/*"
              className="admin-file-input"
              onChange={(e) => setImages(Array.from(e.target.files))}
            />
          </div>

          <div className="admin-modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              id="admin-prod-save"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
