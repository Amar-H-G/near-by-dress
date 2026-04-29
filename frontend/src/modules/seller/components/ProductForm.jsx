import { useState, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import InputField from '../../../shared/components/form/InputField';
import SelectField from '../../../shared/components/form/SelectField';
import TextArea from '../../../shared/components/form/TextArea';
import FileUpload from '../../../shared/components/form/FileUpload';

const ProductForm = ({ initialData, onSubmit, isSubmitting }) => {
  const { categories } = useSettings();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    price: initialData?.price || '',
    discountPrice: initialData?.discountPrice || '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    stock: initialData?.stock || 0,
    isActive: initialData?.isActive ?? true,
  });

  const [images, setImages] = useState([]);
  const [previewUrls] = useState(initialData?.images || []);
  const [errors, setErrors] = useState({});

  const categoryOptions = categories.map((cat) => ({
    value: cat._id,
    label: cat.parentId ? `${cat.parentId.name} → ${cat.name}` : cat.name,
  }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((err) => ({ ...err, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.category) errs.category = 'Category is required';
    if (!formData.price) errs.price = 'Price is required';
    else if (Number(formData.price) < 0) errs.price = 'Price must be 0 or more';
    if (formData.discountPrice && Number(formData.discountPrice) >= Number(formData.price)) {
      errs.discountPrice = 'Discount price must be less than price';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => submitData.append(key, value));
    images.forEach((img) => submitData.append('images', img));
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-product-form" noValidate>
      {/* ── Basic Details ─────────────────────────────────── */}
      <div className="admin-section" style={{ padding: 28 }}>
        <h3 className="admin-section-title" style={{ marginBottom: 24 }}>Basic Details</h3>

        <div className="form-row" style={{ marginBottom: 20 }}>
          <InputField
            id="prod-name"
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Floral Summer Dress"
            required
            error={errors.name}
          />
          <SelectField
            id="prod-category"
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categoryOptions}
            placeholder="Select Category"
            required
            error={errors.category}
          />
        </div>

        <div className="form-row-3" style={{ marginBottom: 20 }}>
          <InputField
            id="prod-price"
            label="Price (₹)"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0"
            required
            error={errors.price}
          />
          <InputField
            id="prod-discount"
            label="Discount Price (₹)"
            type="number"
            name="discountPrice"
            value={formData.discountPrice}
            onChange={handleChange}
            placeholder="Optional"
            error={errors.discountPrice}
          />
          <InputField
            id="prod-stock"
            label="Stock Quantity"
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <TextArea
          id="prod-description"
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the product — fabric, fit, occasions…"
          rows={4}
          maxLength={600}
          style={{ marginBottom: 16 }}
        />

        {/* Active toggle */}
        <label style={{
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb',
          background: formData.isActive ? 'rgba(16,185,129,0.04)' : 'var(--bg-2)',
          transition: 'all 0.2s',
          marginTop: 4,
        }}>
          <input
            type="checkbox"
            name="isActive"
            id="prod-isActive"
            checked={formData.isActive}
            onChange={handleChange}
            style={{ width: 18, height: 18, accentColor: '#10b981', cursor: 'pointer' }}
          />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: "'Outfit', sans-serif" }}>
              Product is Active
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Visible to customers in the marketplace</div>
          </div>
        </label>
      </div>

      {/* ── Product Images ────────────────────────────────── */}
      <div className="admin-section" style={{ padding: 28 }}>
        <h3 className="admin-section-title" style={{ marginBottom: 20 }}>Product Images</h3>
        <FileUpload
          id="prod-images"
          accept="image/*"
          multiple
          maxFiles={5}
          files={images}
          previews={previewUrls}
          onFilesChange={setImages}
          onRemove={(idx, isExisting) => {
            if (!isExisting) setImages((prev) => prev.filter((_, i) => i !== idx - previewUrls.length));
          }}
          helper="Up to 5 images — first image will be the cover"
        />
      </div>

      {/* ── Actions ───────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '20px 28px' }}>
        <button type="button" onClick={() => window.history.back()} className="btn btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ minWidth: 140, borderRadius: 14 }}>
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
