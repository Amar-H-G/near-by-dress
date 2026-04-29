import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Loader2, GripVertical, Check, X } from 'lucide-react';
import { adminGetFilters, adminCreateFilter, adminUpdateFilter, adminToggleFilter, adminDeleteFilter } from '../services/admin.service';
import toast from 'react-hot-toast';
import { useSettings } from '../../../context/SettingsContext';
import InputField from '../../../shared/components/form/InputField';
import SelectField from '../../../shared/components/form/SelectField';
import TextArea from '../../../shared/components/form/TextArea';

const Filters = () => {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFilter, setEditingFilter] = useState(null);
  const { refreshFilters } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    type: 'select',
    options: '',
    order: 0
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
        name: filter.name,
        key: filter.key,
        type: filter.type,
        options: filter.options.join(', '),
        order: filter.order || 0
      });
    } else {
      setEditingFilter(null);
      setFormData({
        name: '',
        key: '',
        type: 'select',
        options: '',
        order: filters.length
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this filter?')) return;
    try {
      await adminDeleteFilter(id);
      toast.success('Filter deleted');
      loadFilters();
      refreshFilters();
    } catch {
      toast.error('Failed to delete filter');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      ...formData,
      options: formData.options.split(',').map(o => o.trim()).filter(o => o !== '')
    };

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
          <h1 className="admin-page-title">Dynamic Filters</h1>
          <p className="admin-page-subtitle">Configure search and listing filters for your marketplace.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add Filter
        </button>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        {loading ? (
          <div style={{ padding: 100, textAlign: 'center' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>
        ) : filters.length === 0 ? (
          <div style={{ padding: 100, textAlign: 'center', color: 'var(--text-muted)' }}>
            No filters configured. Add your first filter.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Type</th>
                  <th>Options</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filters.map((f) => (
                  <tr key={f._id}>
                    <td><GripVertical size={16} color="var(--text-faint)" /></td>
                    <td><span className="admin-table-primary">{f.name}</span></td>
                    <td><code>{f.key}</code></td>
                    <td><span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>{f.type}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 300 }}>
                        {f.options.slice(0, 5).map(o => (
                          <span key={o} style={{ fontSize: 11, padding: '2px 6px', background: 'var(--surface-3)', borderRadius: 4 }}>{o}</span>
                        ))}
                        {f.options.length > 5 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{f.options.length - 5} more</span>}
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggle(f._id)}
                        className={`admin-icon-btn ${f.isActive ? 'text-success' : 'text-faint'}`}
                      >
                        {f.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="admin-icon-btn" onClick={() => handleOpenModal(f)}><Edit2 size={16} /></button>
                      <button className="admin-icon-btn text-danger" onClick={() => handleDelete(f._id)}><Trash2 size={16} /></button>
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
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editingFilter ? 'Edit Filter' : 'Add New Filter'}</h3>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="admin-form-row">
                <InputField
                  id="filter-name"
                  label="Display Name"
                  required
                  placeholder="e.g. Primary Color"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <InputField
                  id="filter-key"
                  label="Filter Key"
                  required
                  placeholder="e.g. color"
                  disabled={!!editingFilter}
                  value={formData.key}
                  onChange={e => setFormData({...formData, key: e.target.value})}
                  helper="Must match your product field name"
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
                    { value: 'range', label: 'Price/Number Range' },
                    { value: 'checkbox', label: 'Toggle Boolean' },
                  ]}
                  placeholder="Select type"
                />
                <InputField
                  id="filter-order"
                  label="Sort Order"
                  type="number"
                  value={formData.order}
                  onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                />
              </div>

              <TextArea
                id="filter-options"
                label="Options (Comma separated)"
                placeholder="Red, Blue, Green, Yellow"
                value={formData.options}
                onChange={e => setFormData({...formData, options: e.target.value})}
                disabled={formData.type === 'range' || formData.type === 'checkbox'}
                rows={3}
                helper="Not required for 'range' or 'checkbox' types"
              />

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingFilter ? 'Update Filter' : 'Create Filter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
