import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';

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
  const [previewUrls, setPreviewUrls] = useState(initialData?.images || []);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) return alert('Maximum 5 images allowed');
    
    setImages(files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...(initialData?.images || []), ...urls]);
  };

  const removeImage = (index) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    // Complex to manage files array for removal without a custom hook, 
    // for simplicity we will just reset if they want to clear
    if (index >= (initialData?.images?.length || 0)) {
      setImages([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });
    images.forEach((img) => submitData.append('images', img));
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-product-form">
      <div className="admin-section" style={{ padding: 24 }}>
        <h3 className="admin-section-title" style={{ marginBottom: 20 }}>Basic Details</h3>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Product Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="admin-input" placeholder="e.g. Floral Summer Dress" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Category *</label>
            <select required name="category" value={formData.category} onChange={handleChange} className="admin-input">
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.parentId ? `${cat.parentId.name} → ${cat.name}` : cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-form-row" style={{ marginTop: 16 }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Price (₹) *</label>
            <input required type="number" min="0" name="price" value={formData.price} onChange={handleChange} className="admin-input" placeholder="0.00" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Discount Price (₹)</label>
            <input type="number" min="0" name="discountPrice" value={formData.discountPrice} onChange={handleChange} className="admin-input" placeholder="0.00 (Optional)" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Stock Quantity</label>
            <input type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} className="admin-input" placeholder="0" />
          </div>
        </div>

        <div className="admin-form-group" style={{ marginTop: 16 }}>
          <label className="admin-form-label">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="admin-input" rows="4" placeholder="Describe the product..."></textarea>
        </div>

        <div className="admin-form-group" style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="isActive" style={{ width: 16, height: 16 }} />
          <label htmlFor="isActive" className="admin-form-label" style={{ cursor: 'pointer' }}>Product is Active (Visible to customers)</label>
        </div>
      </div>

      <div className="admin-section" style={{ padding: 24 }}>
        <h3 className="admin-section-title" style={{ marginBottom: 20 }}>Product Images</h3>
        
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {previewUrls.map((url, i) => (
            <div key={i} style={{ position: 'relative', width: 100, height: 100, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img src={url} alt={`Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', padding: 4, cursor: 'pointer' }}>
                <X size={12} />
              </button>
            </div>
          ))}

          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{ width: 100, height: 100, borderRadius: 12, border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--surface-2)', color: 'var(--text-faint)' }}
          >
            <UploadCloud size={24} style={{ marginBottom: 4 }} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>Upload</span>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple style={{ display: 'none' }} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>You can upload up to 5 images. First image will be the cover.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
        <button type="button" onClick={() => window.history.back()} className="btn btn-ghost">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ minWidth: 140 }}>
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
