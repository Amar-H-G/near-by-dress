import { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { adminCreateProduct, adminUpdateProduct } from '../services/admin.service';
import { getShops } from '../../seller/services/shop.service';
import { useSettings } from '../../../context/SettingsContext';
import toast from 'react-hot-toast';
import InputField from '../../../shared/components/form/InputField';
import SelectField from '../../../shared/components/form/SelectField';
import TextArea from '../../../shared/components/form/TextArea';
import FileUpload from '../../../shared/components/form/FileUpload';

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
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);

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
      setPreviewUrls(product.images || []);
    } else {
      setForm(EMPTY);
      setSelectedShop('');
      setPreviewUrls([]);
    }
    setImages([]);
  }, [open, product, isEdit]);

  const handleRemoveImage = (idx, isExisting) => {
    if (isExisting) {
      setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
    } else {
      setImages((prev) => prev.filter((_, i) => i !== idx));
    }
  };

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

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const categoryOptions = categories.reduce((acc, cat) => {
    if (!cat.parentId) {
      let group = acc.find(g => g.id === cat._id);
      if (!group) {
        group = { id: cat._id, group: cat.name, options: [], isParent: true };
        acc.push(group);
      } else {
        group.group = cat.name;
        group.isParent = true;
      }
    } else {
      const pId = typeof cat.parentId === 'object' ? cat.parentId._id : cat.parentId;
      const pName = typeof cat.parentId === 'object' ? cat.parentId.name : 'Other';
      let group = acc.find(g => g.id === pId);
      if (!group) {
        group = { id: pId, group: pName, options: [] };
        acc.push(group);
      }
      group.options.push({ value: cat._id, label: cat.name });
    }
    return acc;
  }, [])
  .map(item => {
    if (item.isParent && item.options.length === 0) {
      return { value: item.id, label: item.group };
    }
    return item;
  })
  .sort((a, b) => (a.group || a.label).localeCompare(b.group || b.label));

  const shopOptions = shopList.map((s) => ({
    value: s._id,
    label: `${s.name}${s.city ? ` — ${s.city}` : ''}`,
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
      
      // Send existing images to keep
      if (previewUrls.length === 0) {
        fd.append('existingImages', '');
      } else {
        previewUrls.forEach(url => fd.append('existingImages', url));
      }

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

        <form onSubmit={handleSubmit} className="admin-product-form" noValidate>
          {/* Shop */}
          <SelectField
            id="admin-prod-shop"
            label="Assign to Shop"
            name="selectedShop"
            value={selectedShop}
            onChange={(e) => setSelectedShop(e.target.value)}
            options={shopOptions}
            placeholder="System Product (no shop)"
            className="form-field"
          />

          <div className="form-row" style={{ marginTop: 20 }}>
            <InputField
              id="admin-prod-name"
              label="Product Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Floral Summer Dress"
              required
            />
            <SelectField
              id="admin-prod-cat"
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              options={categoryOptions}
              placeholder="Select category"
              required
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <TextArea
              id="admin-prod-desc"
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Product description…"
              rows={3}
            />
          </div>

          <div className="form-row-3" style={{ marginTop: 20 }}>
            <InputField
              id="admin-prod-price"
              label="Price (₹)"
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="0"
              required
            />
            <InputField
              id="admin-prod-discount"
              label="Discount Price (₹)"
              type="number"
              name="discountPrice"
              value={form.discountPrice}
              onChange={handleChange}
              placeholder="0"
            />
            <InputField
              id="admin-prod-stock"
              label="Stock"
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          {/* Sizes */}
          <div className="form-field" style={{ marginTop: 20 }}>
            <span className="form-label">Sizes</span>
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

          <div style={{ marginTop: 20 }}>
            <InputField
              id="admin-prod-colors"
              label="Colors (comma separated)"
              name="colors"
              value={form.colors}
              onChange={handleChange}
              placeholder="Red, Blue, Green"
            />
          </div>

          {/* Images */}
          <div style={{ marginTop: 20 }}>
            <FileUpload
              id="admin-prod-images"
              label="Product Images"
              accept="image/*"
              multiple={true}
              maxFiles={5}
              files={images}
              previews={previewUrls}
              onFilesChange={setImages}
              onRemove={handleRemoveImage}
              helper="Up to 5 images — first will be the cover"
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
              style={{ borderRadius: 14 }}
            >
              {loading ? 'Saving…' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
