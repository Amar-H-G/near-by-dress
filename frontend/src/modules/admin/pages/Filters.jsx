import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Loader2, GripVertical, Check, X, Database, Settings2 } from 'lucide-react';
import { adminGetFilters, adminCreateFilter, adminUpdateFilter, adminToggleFilter, adminDeleteFilter } from '../services/admin.service';
import toast from 'react-hot-toast';
import { useSettings } from '../../../context/SettingsContext';
import InputField from '../../../shared/components/form/InputField';
import SelectField from '../../../shared/components/form/SelectField';

// Custom Components
import TagInput from '../components/FilterBuilder/TagInput';
import RangeSlider from '../components/FilterBuilder/RangeSlider';
import ToggleSwitch from '../components/FilterBuilder/ToggleSwitch';
import ConfirmModal from '../components/ConfirmModal';

const INITIAL_FILTERS = [
  { name: "Category", key: "category", type: "select", isActive: true, order: 1, isDynamic: true },
  { name: "Price", key: "price", type: "range", min: 0, max: 5000, isActive: true, order: 2 },
  { name: "Color", key: "color", type: "multi-select", options: ["Black","White","Red","Blue","Green","Yellow","Pink","Grey"], isActive: true, order: 3 },
  { name: "Size", key: "size", type: "multi-select", options: ["XS","S","M","L","XL","XXL"], isActive: true, order: 4 },
  { name: "Fabric", key: "fabric", type: "select", options: ["Cotton","Silk","Denim","Linen","Polyester"], isActive: true, order: 5 },
  { name: "Shop", key: "shop", type: "select", isActive: true, order: 6, isDynamic: true },
  { name: "Rating", key: "rating", type: "select", options: ["4 & above","3 & above"], isActive: false, order: 7 },
  { name: "Discount", key: "discount", type: "select", options: ["10%+","25%+","50%+"], isActive: false, order: 8 }
];

const Filters = () => {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFilter, setEditingFilter] = useState(null);
  const { refreshFilters } = useSettings();

  // Confirm Modal States
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    type: 'select',
    options: [],
    min: 0,
    max: 5000,
    isActive: true,
    order: 0,
    isDynamic: false
  });

  const loadFilters = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetFilters();
      setFilters(data.data || []);
    } catch {
      toast.error('Failed to load filters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFilters(); }, []);

  const handleOpenModal = (filter = null) => {
    if (filter) {
      setEditingFilter(filter);
      setFormData({
        name: filter.name || '',
        key: filter.key || '',
        type: filter.type || 'select',
        options: filter.options || [],
        min: filter.min || 0,
        max: filter.max || 5000,
        isActive: filter.isActive !== undefined ? filter.isActive : true,
        order: filter.order || 0,
        isDynamic: filter.isDynamic || false
      });
    } else {
      setEditingFilter(null);
      setFormData({
        name: '',
        key: '',
        type: 'select',
        options: [],
        min: 0,
        max: 5000,
        isActive: true,
        order: filters.length + 1,
        isDynamic: false
      });
    }
    setIsModalOpen(true);
  };

  const handleToggle = async (id) => {
    try {
      await adminToggleFilter(id);
      toast.success('Filter status updated');
      loadFilters();
      refreshFilters();
    } catch {
      toast.error('Failed to toggle filter');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await adminDeleteFilter(confirmDeleteId);
      toast.success('Filter deleted');
      setConfirmDeleteId(null);
      loadFilters();
      refreshFilters();
    } catch {
      toast.error('Failed to delete filter');
    }
  };

  const handleSeedDefaults = async () => {
    setLoading(true);
    setShowSeedConfirm(false);
    try {
      for (const filter of INITIAL_FILTERS) {
        await adminCreateFilter(filter);
      }
      toast.success('Default filters initialized');
      loadFilters();
    } catch (err) {
      toast.error('Failed to seed filters');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = { ...formData };
    if (payload.type === 'range') {
      payload.options = [];
    } else {
      payload.min = undefined;
      payload.max = undefined;
    }

    try {
      if (editingFilter) {
        await adminUpdateFilter(editingFilter._id, payload);
        toast.success('Filter updated');
      } else {
        await adminCreateFilter(payload);
        toast.success('Filter created');
      }
      setIsModalOpen(false);
      loadFilters();
      refreshFilters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Filter Builder</h1>
          <p className="admin-page-subtitle">Manage how users search and discover products in the marketplace.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {filters.length === 0 && (
            <button className="btn btn-ghost" onClick={() => setShowSeedConfirm(true)}>
              <Settings2 size={18} /> Load Defaults
            </button>
          )}
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Add Filter
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        {loading ? (
          <div style={{ padding: 100, textAlign: 'center' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>
        ) : filters.length === 0 ? (
          <div style={{ padding: 100, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ marginBottom: 16, opacity: 0.5 }}><Settings2 size={48} style={{ margin: '0 auto' }} /></div>
            <p>No filters configured yet.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowSeedConfirm(true)}>Initialize Marketplace Filters</button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Filter Name</th>
                  <th>Key</th>
                  <th>Type</th>
                  <th>Behavior</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filters.sort((a, b) => a.order - b.order).map((f) => (
                  <tr key={f._id}>
                    <td><GripVertical size={16} color="var(--text-faint)" /></td>
                    <td>
                      <div className="admin-table-primary">{f.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Order: {f.order}</div>
                    </td>
                    <td><code>{f.key}</code></td>
                    <td>
                      <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                        {f.type.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {f.isDynamic ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: 13 }}>
                          <Database size={14} /> <span>Dynamic (API)</span>
                        </div>
                      ) : f.type === 'range' ? (
                        <span style={{ fontSize: 13 }}>{f.min} - {f.max}</span>
                      ) : (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 250 }}>
                          {f.options?.slice(0, 3).map(o => (
                            <span key={o} style={{ fontSize: 10, padding: '2px 6px', background: 'var(--surface-3)', borderRadius: 4 }}>{o}</span>
                          ))}
                          {f.options?.length > 3 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{f.options.length - 3}</span>}
                        </div>
                      )}
                    </td>
                    <td>
                      <ToggleSwitch 
                        checked={f.isActive} 
                        onChange={() => handleToggle(f._id)} 
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="admin-icon-btn" onClick={() => handleOpenModal(f)}><Edit2 size={16} /></button>
                      <button className="admin-icon-btn text-danger" onClick={() => setConfirmDeleteId(f._id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Main Edit/Create Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-box" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editingFilter ? 'Edit Filter' : 'Create New Filter'}</h3>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="admin-form-row">
                <InputField
                  id="filter-name"
                  label="Display Name"
                  required
                  placeholder="e.g. Fabric Material"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <InputField
                  id="filter-key"
                  label="Filter Key"
                  required
                  placeholder="e.g. fabric"
                  disabled={!!editingFilter}
                  value={formData.key}
                  onChange={e => setFormData({...formData, key: e.target.value})}
                  helper="Database identifier"
                />
              </div>

              <div className="admin-form-row">
                <SelectField
                  id="filter-type"
                  label="Input Type"
                  required
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  options={[
                    { value: 'select', label: 'Dropdown Selection' },
                    { value: 'multi-select', label: 'Multiple Checkboxes' },
                    { value: 'range', label: 'Range Slider' },
                    { value: 'checkbox', label: 'Simple Boolean' },
                  ]}
                />
                <InputField
                  id="filter-order"
                  label="Sort Order"
                  type="number"
                  value={formData.order}
                  onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                />
              </div>

              <div className="admin-form-divider"></div>

              {formData.type === 'range' ? (
                <RangeSlider 
                  label="Range Configuration"
                  min={formData.min}
                  max={formData.max}
                  onChangeMin={(val) => setFormData({...formData, min: val})}
                  onChangeMax={(val) => setFormData({...formData, max: val})}
                />
              ) : formData.isDynamic ? (
                <div className="dynamic-info-card">
                  <Database size={20} className="text-primary" />
                  <div>
                    <p className="dynamic-title">Dynamic Data Source</p>
                    <p className="dynamic-desc">Options for this filter are automatically pulled from the <strong>{formData.key}s</strong> collection.</p>
                  </div>
                </div>
              ) : (
                <TagInput 
                  label="Filter Options"
                  tags={formData.options}
                  setTags={(tags) => setFormData({...formData, options: tags})}
                  placeholder="Add an option and press Enter..."
                />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <ToggleSwitch 
                  label="Active Status"
                  checked={formData.isActive}
                  onChange={(val) => setFormData({...formData, isActive: val})}
                />
                <div className="admin-modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingFilter ? 'Save Changes' : 'Create Filter')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modals */}
      <ConfirmModal 
        open={!!confirmDeleteId}
        title="Delete Filter?"
        message="Are you sure you want to remove this filter? This will affect how customers search for products."
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <ConfirmModal 
        open={showSeedConfirm}
        title="Initialize Filters?"
        message="This will add the standard marketplace filters (Price, Color, Size, etc.). Are you sure you want to proceed?"
        onConfirm={handleSeedDefaults}
        onCancel={() => setShowSeedConfirm(false)}
        loading={loading}
      />

      <style jsx>{`
        .admin-form-divider {
          height: 1px;
          background: var(--border);
          margin: 4px 0;
        }
        .dynamic-info-card {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: var(--primary-light, #eef2ff);
          border-radius: 12px;
          border: 1px solid rgba(99, 102, 241, 0.2);
          align-items: center;
        }
        .dynamic-title {
          font-weight: 600;
          font-size: 14px;
          color: var(--primary);
          margin: 0;
        }
        .dynamic-desc {
          font-size: 12px;
          color: var(--text-muted);
          margin: 4px 0 0 0;
        }
      `}</style>
    </div>
  );
};

export default Filters;

