import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Loader2, Folder, FileText, ChevronRight, X } from 'lucide-react';
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../services/admin.service';
import toast from 'react-hot-toast';
import { useSettings } from '../../../context/SettingsContext';
import InputField from '../../../shared/components/form/InputField';
import SelectField from '../../../shared/components/form/SelectField';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { refreshCategories } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parentId: '',
    order: 0,
    isActive: true
  });
  const [expandedCats, setExpandedCats] = useState([]);

  const toggleExpand = (id) => {
    setExpandedCats(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getNextOrder = (parentId = '') => {
    const siblings = categories.filter(c => (c.parentId?._id || c.parentId || '') === parentId);
    return siblings.length + 1;
  };

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

  const handleOpenModal = (cat = null, parentId = '') => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        slug: cat.slug || '',
        parentId: cat.parentId?._id || '',
        order: cat.order || 0,
        isActive: cat.isActive
      });
    } else {
      setEditingCategory(null);
      const initialParent = parentId || '';
      setFormData({
        name: '',
        slug: '',
        parentId: initialParent,
        order: getNextOrder(initialParent),
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

  // Group categories by parent for hierarchical display
  const rootCategories = categories.filter(c => !c.parentId);
  const getSubCategories = (parentId) => categories.filter(c => c.parentId?._id === parentId);

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
                {rootCategories.map((cat) => {
                  const subs = getSubCategories(cat._id);
                  const isExpanded = expandedCats.includes(cat._id);

                  return (
                    <>
                      <tr key={cat._id} className={isExpanded ? 'row-expanded' : ''}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {subs.length > 0 ? (
                              <button
                                onClick={() => toggleExpand(cat._id)}
                                className="admin-icon-btn"
                                style={{ padding: 4, transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
                              >
                                <ChevronRight size={16} />
                              </button>
                            ) : (
                              <Folder size={16} color="var(--primary)" style={{ marginLeft: 28 }} />
                            )}
                            <span className="admin-table-primary" style={{ fontWeight: 600 }}>{cat.name}</span>
                            {subs.length > 0 && <span className="badge badge-pending" style={{ fontSize: 10, padding: '2px 6px' }}>{subs.length} Subs</span>}
                          </div>
                        </td>
                        <td><span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-faint)' }}>Root Category</span></td>
                        <td><span className="admin-table-date">{cat.order}</span></td>
                        <td>
                          <span className={`badge ${cat.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="admin-icon-btn"
                            onClick={() => handleOpenModal(null, cat._id)}
                            title="Add Sub-category"
                            style={{ color: 'var(--primary)' }}
                          >
                            <Plus size={16} />
                          </button>
                          <button className="admin-icon-btn" onClick={() => handleOpenModal(cat)}><Edit2 size={16} /></button>
                          <button className="admin-icon-btn text-danger" onClick={() => handleDelete(cat._id)}><Trash2 size={16} /></button>
                        </td>
                      </tr>

                      {/* Sub-categories */}
                      {isExpanded && subs.map(sub => (
                        <tr key={sub._id} style={{ background: 'rgba(124, 58, 237, 0.02)' }}>
                          <td style={{ paddingLeft: 48 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <FileText size={14} color="var(--text-faint)" />
                              <span className="admin-table-primary">{sub.name}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                              <span>{cat.name}</span>
                              <ChevronRight size={12} />
                              <span style={{ color: 'var(--text)' }}>{sub.name}</span>
                            </div>
                          </td>
                          <td><span className="admin-table-date">{sub.order}</span></td>
                          <td>
                            <span className={`badge ${sub.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                              {sub.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="admin-icon-btn" onClick={() => handleOpenModal(sub)}><Edit2 size={16} /></button>
                            <button className="admin-icon-btn text-danger" onClick={() => handleDelete(sub._id)}><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </>
                  );
                })}
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
            <form onSubmit={handleSubmit} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="admin-form-row">
                <InputField
                  id="cat-name"
                  label="Category Name"
                  required
                  placeholder="e.g. Ethnic Wear"
                  value={formData.name}
                  onChange={e => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                    setFormData({ ...formData, name, slug: editingCategory ? formData.slug : slug });
                  }}
                />
                <InputField
                  id="cat-slug"
                  label="Slug (URL Key)"
                  required
                  placeholder="ethnic-wear"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                />
              </div>

              <SelectField
                id="cat-parent"
                label="Parent Category (Optional)"
                value={formData.parentId}
                placeholderDisabled={false}
                onChange={e => {
                  const newParentId = e.target.value;
                  const parentChanged = String(newParentId) !== String(editingCategory?.parentId?._id || editingCategory?.parentId || '');
                  setFormData({
                    ...formData,
                    parentId: newParentId,
                    order: (editingCategory && !parentChanged) ? formData.order : getNextOrder(newParentId)
                  });
                }}
                options={parentOptions.filter(c => !c.parentId).map(c => ({ value: c._id, label: c.name }))}
                placeholder="--- Make this a Main Category ---"
                helper="If this is a sub-category, select its parent above. Otherwise, leave it as 'Main Category'."
              />

              <div className="admin-form-row">
                <InputField
                  id="cat-order"
                  label="Sort Order"
                  type="number"
                  value={formData.order}
                  onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                />
                <div className="form-field">
                  <span className="form-label">Status</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 48 }}>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: formData.isActive ? 'var(--success)' : 'var(--text-faint)' }}
                    >
                      {formData.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{formData.isActive ? 'Active' : 'Hidden'}</span>
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
