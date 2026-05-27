import { useState, useEffect } from 'react';
import { Loader2, Plus, Sparkles, Tag, Shirt, Info } from 'lucide-react';
import { useSettings } from '../../core/contexts/useSettings';
import InputField from '../../shared/components/form/InputField';
import SelectField from '../../shared/components/form/SelectField';
import TextArea from '../../shared/components/form/TextArea';
import FileUpload from '../../shared/components/form/FileUpload';

const ProductForm = ({ initialData, onSubmit, isSubmitting }) => {
  const { categories, filters } = useSettings();
  
  // ─── Extract Admin-Controlled Dynamic Filter Configuration ───
  const sizeFilter = filters.find(f => f.key === 'size') || { options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'] };
  const sizesList = sizeFilter.options || [];

  const colorFilter = filters.find(f => f.key === 'color') || { options: ['Black', 'White', 'Red', 'Blue', 'Green'] };
  const colorsList = colorFilter.options || [];

  // Filter out price, category, shop, size, and color to get custom dynamic attributes
  const customFilters = filters.filter(f => 
    f.isActive && !f.isDeleted && !['price', 'category', 'shop', 'size', 'color'].includes(f.key)
  );

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    price: initialData?.price || '',
    discountPrice: initialData?.discountPrice || '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    stock: initialData?.stock || 0,
    isActive: initialData?.isActive ?? true,
    sizes: initialData?.sizes || [],
    colors: initialData?.colors || [],
    materials: initialData?.materials || [],
    styleTags: initialData?.styleTags || [],
    fashionLabels: initialData?.fashionLabels || [],
    customAttributes: initialData?.customAttributes || {},
  });

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState(initialData?.images || []);
  const [removedImages, setRemovedImages] = useState([]);
  const [errors, setErrors] = useState({});

  // Sync state with initialData when it changes (essential for Edit Mode)
  useEffect(() => {
    if (initialData) {
      queueMicrotask(() => {
        setFormData({
          name: initialData.name || '',
          price: initialData.price || '',
          discountPrice: initialData.discountPrice || '',
          category: initialData.category?._id || initialData.category || '',
          description: initialData.description || '',
          stock: initialData.stock || 0,
          isActive: initialData.isActive ?? true,
          sizes: initialData.sizes || [],
          colors: initialData.colors || [],
          materials: initialData.materials || [],
          styleTags: initialData.styleTags || [],
          fashionLabels: initialData.fashionLabels || [],
          customAttributes: initialData.customAttributes || {},
        });
        setPreviewUrls(initialData.images || []);
        setRemovedImages([]);
      });
    }
  }, [initialData]);

  const handleRemoveImage = (idx, isExisting) => {
    if (isExisting) {
      const removed = previewUrls[idx];
      if (removed?.public_id) {
        setRemovedImages((prev) => [...prev, removed.public_id]);
      }
      setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
    } else {
      setImages((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const toggleSize = (s) =>
    setFormData((f) => ({
      ...f,
      sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s],
    }));

  const toggleColor = (c) =>
    setFormData((f) => ({
      ...f,
      colors: f.colors.includes(c) ? f.colors.filter((x) => x !== c) : [...f.colors, c],
    }));

  const handleCustomFieldChange = (key, value, type) => {
    if (key === 'fabric' || key === 'material') {
      const arrVal = typeof value === 'string' ? [value] : value;
      setFormData(f => ({ ...f, materials: arrVal }));
    } else if (key === 'style' || key === 'tag') {
      const arrVal = typeof value === 'string' ? [value] : value;
      setFormData(f => ({ ...f, styleTags: arrVal }));
    } else if (key === 'label' || key === 'brand') {
      const arrVal = typeof value === 'string' ? [value] : value;
      setFormData(f => ({ ...f, fashionLabels: arrVal }));
    } else {
      setFormData(f => ({
        ...f,
        customAttributes: {
          ...f.customAttributes,
          [key]: value
        }
      }));
    }
  };

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
    
    submitData.append('name', formData.name);
    submitData.append('price', formData.price);
    submitData.append('discountPrice', formData.discountPrice || '');
    submitData.append('category', formData.category);
    submitData.append('description', formData.description);
    submitData.append('stock', formData.stock);
    submitData.append('isActive', formData.isActive);

    // Dynamic core arrays
    formData.sizes.forEach((s) => submitData.append('sizes', s));
    formData.colors.forEach((c) => submitData.append('colors', c));
    formData.materials.forEach((m) => submitData.append('materials', m));
    formData.styleTags.forEach((t) => submitData.append('styleTags', t));
    formData.fashionLabels.forEach((l) => submitData.append('fashionLabels', l));

    // Dynamic mixed object
    submitData.append('customAttributes', JSON.stringify(formData.customAttributes));

    // Images
    if (previewUrls.length === 0) {
      submitData.append('existingImages', '');
    } else {
      previewUrls.forEach(img => submitData.append('existingImages', JSON.stringify(img)));
    }
    removedImages.forEach(id => submitData.append('removedImages', id));
    images.forEach((img) => submitData.append('images', img));

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-product-form" noValidate>
      {/* Basic Details */}
      <div className="admin-section" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Sparkles size={20} color="var(--primary)" />
          <h3 className="admin-section-title" style={{ margin: 0 }}>Basic Details</h3>
        </div>

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
          maxLength={1000}
          style={{ marginBottom: 16 }}
        />
      </div>

      {/* Dynamic Product Attributes (Admin-Controlled) */}
      <div className="admin-section" style={{ padding: 28, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Shirt size={20} color="var(--primary)" />
          <h3 className="admin-section-title" style={{ margin: 0 }}>Dynamic Attributes</h3>
        </div>

        {/* Dynamic Sizes Grid */}
        <div className="form-field" style={{ marginBottom: 24 }}>
          <span className="form-label" style={{ display: 'block', marginBottom: 12, fontWeight: 700 }}>
            Sizes (Configured in Database)
          </span>
          <div className="admin-size-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {sizesList.map((s) => {
              const val = typeof s === 'object' ? s.value : s;
              const lbl = typeof s === 'object' ? s.label : s;
              const isSelected = formData.sizes.includes(String(val));
              return (
                <button
                  key={String(val)}
                  type="button"
                  className={`admin-size-btn ${isSelected ? 'admin-size-btn-active' : ''}`}
                  onClick={() => toggleSize(String(val))}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: isSelected ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                    background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'none',
                    color: isSelected ? 'var(--primary)' : 'var(--text)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Colors Grid */}
        <div className="form-field" style={{ marginBottom: 24 }}>
          <span className="form-label" style={{ display: 'block', marginBottom: 12, fontWeight: 700 }}>
            Colors (Configured in Database)
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {colorsList.map((c) => {
              const val = typeof c === 'object' ? c.value : c;
              const lbl = typeof c === 'object' ? c.label : c;
              const isSelected = formData.colors.includes(String(val));
              return (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => toggleColor(String(val))}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: isSelected ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                    background: isSelected ? 'var(--surface-3)' : 'var(--surface)',
                    color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: String(lbl).toLowerCase(),
                    border: '1px solid rgba(0,0,0,0.1)'
                  }} />
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Custom Fields configured by Admin (Materials, tags, etc.) */}
        {customFilters.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginTop: '20px',
            padding: '20px',
            background: 'var(--surface-2)',
            borderRadius: '16px',
            border: '1px solid var(--border)'
          }}>
            {customFilters.map((f) => {
              const isFabric = f.key === 'fabric' || f.key === 'material';
              const isStyle = f.key === 'style' || f.key === 'tag';
              const isLabel = f.key === 'label' || f.key === 'brand';

              let currentVal = '';
              if (isFabric) currentVal = formData.materials[0] || '';
              else if (isStyle) currentVal = formData.styleTags[0] || '';
              else if (isLabel) currentVal = formData.fashionLabels[0] || '';
              else currentVal = formData.customAttributes[f.key] || '';

              const fieldOptions = (f.options || []).map(opt => {
                const val = typeof opt === 'object' ? opt.value : opt;
                const lbl = typeof opt === 'object' ? opt.label : opt;
                return { value: String(val), label: String(lbl) };
              });

              return (
                <div key={f._id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                    {f.name}
                  </label>
                  {f.type === 'select' || f.type === 'multi-select' ? (
                    <select
                      className="admin-input"
                      value={currentVal}
                      onChange={(e) => handleCustomFieldChange(f.key, e.target.value, f.type)}
                      style={{ height: '42px', fontSize: '13px' }}
                    >
                      <option value="">Choose {f.name}</option>
                      {fieldOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <InputField
                      id={`custom-attr-${f.key}`}
                      label=""
                      value={currentVal}
                      onChange={(e) => handleCustomFieldChange(f.key, e.target.value, f.type)}
                      placeholder={`Enter ${f.name}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Active Toggle Switch */}
        <label style={{
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb',
          background: formData.isActive ? 'rgba(16,185,129,0.04)' : 'var(--bg-2)',
          transition: 'all 0.2s',
          marginTop: 24,
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
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
              Product is Active
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Visible to customers in the marketplace</div>
          </div>
        </label>
      </div>

      {/* Product Images */}
      <div className="admin-section" style={{ padding: 28, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Pocket size={20} color="var(--primary)" />
          <h3 className="admin-section-title" style={{ margin: 0 }}>Product Images</h3>
        </div>
        <FileUpload
          id="prod-images"
          accept="image/*"
          multiple={true}
          maxFiles={5}
          files={images}
          previews={previewUrls}
          onFilesChange={setImages}
          onRemove={handleRemoveImage}
          helper="Up to 5 images — first image will be the cover"
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '20px 28px', borderTop: '1px solid var(--border)' }}>
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
