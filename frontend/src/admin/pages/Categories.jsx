import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Loader2, Folder, FileText, ChevronRight, X, ChevronUp, ChevronDown, Image } from 'lucide-react';
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../services/admin.service.js';
import toast from 'react-hot-toast';
import { useSettings } from '../../core/contexts/useSettings';
import InputField from '../../shared/components/form/InputField';
import SelectField from '../../shared/components/form/SelectField';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const { refreshCategories } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parentId: '',
    order: 0,
    isActive: true,
    description: ''
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

  useEffect(() => { queueMicrotask(loadCategories); }, []);

  const handleOpenModal = (cat = null, parentId = '') => {
    setImageFile(null);
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        slug: cat.slug || '',
        parentId: cat.parentId?._id || '',
        order: cat.order || 0,
        isActive: cat.isActive,
        description: cat.description || ''
      });
    } else {
      setEditingCategory(null);
      const initialParent = parentId || '';
      setFormData({
        name: '',
        slug: '',
        parentId: initialParent,
        order: getNextOrder(initialParent),
        isActive: true,
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (cat) => {
    setCatToDelete(cat);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!catToDelete) return;
    setIsSubmitting(true);
    try {
      await adminDeleteCategory(catToDelete._id);
      toast.success('Category deleted successfully');
      setIsDeleteModalOpen(false);
      loadCategories();
      refreshCategories();
    } catch {
      toast.error('Failed to delete category');
    } finally {
      setIsSubmitting(false);
      setCatToDelete(null);
    }
  };

  const moveCategoryOrder = async (cat, direction) => {
    const siblings = categories
      .filter(c => (c.parentId?._id || c.parentId || null) === (cat.parentId?._id || cat.parentId || null))
      .sort((a, b) => a.order - b.order);
    
    const index = siblings.findIndex(s => s._id === cat._id);
    if (index === -1) return;

    let targetIndex = -1;
    if (direction === 'up' && index > 0) targetIndex = index - 1;
    if (direction === 'down' && index < siblings.length - 1) targetIndex = index + 1;

    if (targetIndex !== -1) {
      const targetCat = siblings[targetIndex];
      const originalOrder = cat.order;
      const targetOrder = targetCat.order;

      try {
        toast.loading('Reordering...', { id: 'reorder' });
        // Swap orders in parallel
        const f1 = new FormData();
        f1.append('order', targetOrder);
        const f2 = new FormData();
        f2.append('order', originalOrder);

        await Promise.all([
          adminUpdateCategory(cat._id, f1),
          adminUpdateCategory(targetCat._id, f2)
        ]);

        toast.success('Reordered successfully', { id: 'reorder' });
        loadCategories();
        refreshCategories();
      } catch (err) {
        toast.error('Failed to swap orders', { id: 'reorder' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('slug', formData.slug);
    data.append('parentId', formData.parentId || '');
    data.append('order', formData.order);
    data.append('isActive', formData.isActive);
    data.append('description', formData.description);

    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (editingCategory) {
        await adminUpdateCategory(editingCategory._id, data);
        toast.success('Category updated successfully');
      } else {
        await adminCreateCategory(data);
        toast.success('Category created successfully');
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

  const parentOptions = categories.filter(c => !editingCategory || c._id !== editingCategory._id);
  const rootCategories = categories.filter(c => !c.parentId);
  const getSubCategories = (parentId) => categories.filter(c => c.parentId?._id === parentId);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Category Management</h1>
          <p className="admin-page-subtitle">Configure main rails, subcategories, custom images, and visibility.</p>
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
                  <th style={{ width: 60 }}>Cover</th>
                  <th>Category Name</th>
                  <th>Hierarchy</th>
                  <th>Description</th>
                  <th style={{ width: 100 }}>Order</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', width: 200 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rootCategories.map((cat, rootIdx) => {
                  const subs = getSubCategories(cat._id);
                  const isExpanded = expandedCats.includes(cat._id);

                  return (
                    <>
                      <tr key={cat._id} className={isExpanded ? 'row-expanded' : ''}>
                        <td>
                          {cat.image ? (
                            <img src={cat.image} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
                          ) : (
                            <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(124, 58, 237, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                              <Image size={18} />
                            </div>
                          )}
                        </td>
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
                            <div>
                              <span className="admin-table-primary" style={{ fontWeight: 700 }}>{cat.name}</span>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/{cat.slug}</div>
                            </div>
                            {subs.length > 0 && <span className="badge badge-pending" style={{ fontSize: 10, padding: '2px 6px' }}>{subs.length} Subs</span>}
                          </div>
                        </td>
                        <td><span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-faint)' }}>Root Category</span></td>
                        <td><span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cat.description || '—'}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ minWidth: 20, fontWeight: 700, fontSize: 13 }}>{cat.order}</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <button type="button" onClick={() => moveCategoryOrder(cat, 'up')} disabled={rootIdx === 0}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-muted)', opacity: rootIdx === 0 ? 0.3 : 1 }}>
                                <ChevronUp size={14} />
                              </button>
                              <button type="button" onClick={() => moveCategoryOrder(cat, 'down')} disabled={rootIdx === rootCategories.length - 1}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-muted)', opacity: rootIdx === rootCategories.length - 1 ? 0.3 : 1 }}>
                                <ChevronDown size={14} />
                              </button>
                            </div>
                          </div>
                        </td>
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
                          <button className="admin-icon-btn text-danger" onClick={() => handleDeleteClick(cat)}><Trash2 size={16} /></button>
                        </td>
                      </tr>

                      {/* Sub-categories */}
                      {isExpanded && subs.sort((a,b)=>a.order-b.order).map((sub, subIdx) => (
                        <tr key={sub._id} style={{ background: 'rgba(124, 58, 237, 0.02)' }}>
                          <td>
                            {sub.image ? (
                              <img src={sub.image} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }} />
                            ) : (
                              <div style={{ width: 36, height: 36, borderRadius: 6, background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
                                <Image size={14} />
                              </div>
                            )}
                          </td>
                          <td style={{ paddingLeft: 48 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <FileText size={14} color="var(--text-faint)" />
                              <div>
                                <span className="admin-table-primary" style={{ fontWeight: 600 }}>{sub.name}</span>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>/{sub.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                              <span>{cat.name}</span>
                              <ChevronRight size={12} />
                              <span style={{ color: 'var(--text)', fontWeight: 600 }}>{sub.name}</span>
                            </div>
                          </td>
                          <td><span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{sub.description || '—'}</span></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ minWidth: 20, fontWeight: 700, fontSize: 13 }}>{sub.order}</span>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <button type="button" onClick={() => moveCategoryOrder(sub, 'up')} disabled={subIdx === 0}
                                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 1, color: 'var(--text-muted)', opacity: subIdx === 0 ? 0.3 : 1 }}>
                                  <ChevronUp size={13} />
                                </button>
                                <button type="button" onClick={() => moveCategoryOrder(sub, 'down')} disabled={subIdx === subs.length - 1}
                                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 1, color: 'var(--text-muted)', opacity: subIdx === subs.length - 1 ? 0.3 : 1 }}>
                                  <ChevronDown size={13} />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${sub.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                              {sub.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="admin-icon-btn" onClick={() => handleOpenModal(sub)}><Edit2 size={16} /></button>
                            <button className="admin-icon-btn text-danger" onClick={() => handleDeleteClick(sub)}><Trash2 size={16} /></button>
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

      {isDeleteModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ width: 64, height: 64, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444' }}>
              <Trash2 size={32} />
            </div>
            <h3 className="admin-modal-title" style={{ marginBottom: 12 }}>Delete Category?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
              Are you sure you want to delete <strong>{catToDelete?.name}</strong>? This will hide it from the platform. This action cannot be easily undone.
            </p>
            <div className="admin-modal-actions" style={{ justifyContent: 'center', gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => setIsDeleteModalOpen(false)} style={{ minWidth: 100 }}>Cancel</button>
              <button
                className="btn"
                onClick={confirmDelete}
                disabled={isSubmitting}
                style={{ background: '#ef4444', color: '#fff', minWidth: 120 }}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
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

              <InputField
                id="cat-desc"
                label="Description"
                placeholder="Brief description for category cards..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />

              <div className="form-field">
                <span className="form-label">Category Image / Banner</span>
                {editingCategory?.image && !imageFile && (
                  <img src={editingCategory.image} alt="" style={{ height: 60, borderRadius: 8, marginBottom: 8, objectFit: 'cover' }} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])}
                  className="input"
                  style={{ padding: '8px 12px' }}
                />
              </div>

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
