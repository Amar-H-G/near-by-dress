import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Loader2, Folder, FileText, ChevronRight, X } from 'lucide-react';
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../services/admin.service';
import toast from 'react-hot-toast';
import { useSettings } from '../../../context/SettingsContext';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { refreshCategories } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    order: 0,
    isActive: true
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetCategories();
      setCategories(data.data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        parentId: cat.parentId?._id || '',
        order: cat.order || 0,
        isActive: cat.isActive
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        parentId: '',
        order: categories.length,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will hide the category from the platform.')) return;
    try {
      await adminDeleteCategory(id);
      toast.success('Category deleted');
      loadCategories();
      refreshCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await adminUpdateCategory(editingCategory._id, formData);
        toast.success('Category updated');
      } else {
        await adminCreateCategory(formData);
        toast.success('Category created');
      }
      setIsModalOpen(false);
      loadCategories();
      refreshCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out the category itself from parent options when editing
  const parentOptions = categories.filter(c => !editingCategory || c._id !== editingCategory._id);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Category System</h1>
          <p className="admin-page-subtitle">Manage hierarchical categories for your marketplace.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        {loading ? (
          <div style={{ padding: 100, textAlign: 'center' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>
        ) : categories.length === 0 ? (
          <div style={{ padding: 100, textAlign: 'center', color: 'var(--text-muted)' }}>No categories found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Hierarchy</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {cat.parentId ? <FileText size={16} color="var(--text-faint)" /> : <Folder size={16} color="var(--primary)" />}
                        <span className="admin-table-primary">{cat.name}</span>
                      </div>
                    </td>
                    <td>
                      {cat.parentId ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                          <span>{cat.parentId.name}</span>
                          <ChevronRight size={12} />
                          <span style={{ color: 'var(--text)' }}>{cat.name}</span>
                        </div>
                      ) : (
                        <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-faint)' }}>Root Category</span>
                      )}
                    </td>
                    <td><span className="admin-table-date">{cat.order}</span></td>
                    <td>
                      <span className={`badge ${cat.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="admin-icon-btn" onClick={() => handleOpenModal(cat)}><Edit2 size={16} /></button>
                      <button className="admin-icon-btn text-danger" onClick={() => handleDelete(cat._id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Category Name *</label>
                <input 
                  required 
                  type="text" 
                  className="admin-input" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Ethnic Wear"
                />
              </div>

              <div className="admin-form-group" style={{ marginTop: 16 }}>
                <label className="admin-form-label">Parent Category</label>
                <select 
                  className="admin-input"
                  value={formData.parentId}
                  onChange={e => setFormData({...formData, parentId: e.target.value})}
                >
                  <option value="">None (Root Category)</option>
                  {parentOptions.filter(c => !c.parentId).map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Leave empty to make this a top-level category.</p>
              </div>

              <div className="admin-form-row" style={{ marginTop: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Sort Order</label>
                  <input 
                    type="number" 
                    className="admin-input" 
                    value={formData.order}
                    onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44 }}>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                      className={`admin-icon-btn ${formData.isActive ? 'text-success' : 'text-faint'}`}
                      style={{ border: 'none', background: 'none', width: 'auto' }}
                    >
                      {formData.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                    <span style={{ fontSize: 14 }}>{formData.isActive ? 'Active' : 'Hidden'}</span>
                  </div>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingCategory ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
