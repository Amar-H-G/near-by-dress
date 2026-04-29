import { useState } from 'react';
import { useSettings } from '../../../context/SettingsContext';
import API from '../../../shared/services/api';
import toast from 'react-hot-toast';
import { Tags, Plus, Edit2, Trash2, X } from 'lucide-react';

const Categories = () => {
  const { categories, refreshCategories } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', isActive: true });
  const [loading, setLoading] = useState(false);

  const openModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({ name: cat.name, slug: cat.slug, isActive: cat.isActive });
    } else {
      setEditingCat(null);
      setFormData({ name: '', slug: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCat(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCat) {
        await API.put(`/admin/categories/${editingCat._id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await API.post('/admin/categories', formData);
        toast.success('Category created successfully');
      }
      refreshCategories();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await API.delete(`/admin/categories/${id}`);
      toast.success('Category deleted successfully');
      refreshCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 12, background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: 12 }}>
            <Tags size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>Categories</h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage global product categories</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)' }}>Name</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)' }}>Slug</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map(cat => (
                <tr key={cat._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>{cat.name}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{cat.slug}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: cat.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: cat.isActive ? '#10B981' : '#EF4444'
                    }}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button onClick={() => openModal(cat)} style={{ padding: 8, background: 'var(--bg-2)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(cat._id)} style={{ padding: 8, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, color: '#EF4444', cursor: 'pointer', border: 'none' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 24, position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', right: 16, top: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: 20, marginBottom: 24 }}>{editingCat ? 'Edit Category' : 'Add Category'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Category Name</label>
                <input type="text" name="name" className="input" required
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} 
                />
              </div>
              
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Slug (URL friendly)</label>
                <input type="text" name="slug" className="input" required
                  value={formData.slug} 
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                <label htmlFor="isActive">Active Status</label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={loading}>
                {loading ? 'Saving...' : 'Save Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
