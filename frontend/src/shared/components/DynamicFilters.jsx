import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Filter as FilterIcon } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const DynamicFilters = ({ onFilterChange, activeFilters = {} }) => {
  const { filters, categories } = useSettings();
  const [expanded, setExpanded] = useState({});

  // Initialize expanded state for all filters
  useEffect(() => {
    const initial = {};
    filters.forEach(f => initial[f.key] = true);
    setExpanded(initial);
  }, [filters]);

  const toggleExpand = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheckboxChange = (key, val) => {
    const current = activeFilters[key] ? activeFilters[key].split(',') : [];
    let next;
    if (current.includes(val)) {
      next = current.filter(v => v !== val);
    } else {
      next = [...current, val];
    }
    onFilterChange(key, next.join(','));
  };

  const handleSelectChange = (key, val) => {
    onFilterChange(key, val);
  };

  const getGroupedCategories = () => {
    return categories.reduce((acc, cat) => {
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
  };

  return (
    <div className="dynamic-filters">
      <div className="filter-header" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <FilterIcon size={18} color="var(--primary)" />
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Filters</h3>
      </div>

      {filters.map((f) => {
        const isCategoryFilter = f.key === 'category';
        const displayOptions = isCategoryFilter ? getGroupedCategories() : f.options;

        return (
          <div key={f._id} className="filter-group" style={{ marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
            <div
              className="filter-group-header"
              onClick={() => toggleExpand(f.key)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: expanded[f.key] ? 12 : 0 }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{f.name}</span>
              {expanded[f.key] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {expanded[f.key] && (
              <div className="filter-options">
                {f.type === 'multi-select' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {displayOptions.map((opt, idx) => {
                      if (typeof opt === 'object' && opt.group) {
                        return (
                          <div key={opt.group + idx}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: idx > 0 ? 12 : 0 }}>{opt.group}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 12 }}>
                              {opt.options.map((subOpt) => (
                                <label key={subOpt.value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                                  <input
                                    type="checkbox"
                                    checked={(activeFilters[f.key] || '').split(',').includes(String(subOpt.value))}
                                    onChange={() => handleCheckboxChange(f.key, String(subOpt.value))}
                                    style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                                  />
                                  <span>{subOpt.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      const label = typeof opt === 'object' ? opt.label : opt;
                      const value = typeof opt === 'object' ? opt.value : opt;
                      const key = typeof opt === 'object' ? (opt.id || opt.value || idx) : opt;

                      return (
                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                          <input
                            type="checkbox"
                            checked={(activeFilters[f.key] || '').split(',').includes(String(value))}
                            onChange={() => handleCheckboxChange(f.key, String(value))}
                            style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {f.type === 'select' && (
                  <select
                    className="admin-input"
                    style={{ fontSize: 13, height: 38 }}
                    value={activeFilters[f.key] || ''}
                    onChange={(e) => handleSelectChange(f.key, e.target.value)}
                  >
                    <option value="">All {f.name}</option>
                    {displayOptions.map((opt, idx) => {
                      if (typeof opt === 'object' && opt.group) {
                        return (
                          <optgroup key={opt.group + idx} label={opt.group} style={{ fontWeight: 700 }}>
                            {opt.options.map((subOpt) => (
                              <option key={subOpt.value} value={subOpt.value} style={{ fontWeight: 400 }}>{subOpt.label}</option>
                            ))}
                          </optgroup>
                        );
                      }

                      const label = typeof opt === 'object' ? opt.label : opt;
                      const value = typeof opt === 'object' ? opt.value : opt;
                      const key = typeof opt === 'object' ? (opt.id || opt.value || idx) : opt;

                      return (
                        <option key={key} value={value}>{label}</option>
                      );
                    })}
                  </select>
                )}

                {f.type === 'checkbox' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={activeFilters[f.key] === 'true'}
                      onChange={(e) => onFilterChange(f.key, e.target.checked ? 'true' : '')}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <span>Enable {f.name}</span>
                  </label>
                )}

                {f.type === 'range' && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="Min"
                      className="admin-input"
                      style={{ fontSize: 12, height: 32 }}
                      value={activeFilters[`min${f.key.charAt(0).toUpperCase() + f.key.slice(1)}`] || ''}
                      onChange={(e) => onFilterChange(`min${f.key.charAt(0).toUpperCase() + f.key.slice(1)}`, e.target.value)}
                    />
                    <span style={{ color: 'var(--text-faint)' }}>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="admin-input"
                      style={{ fontSize: 12, height: 32 }}
                      value={activeFilters[`max${f.key.charAt(0).toUpperCase() + f.key.slice(1)}`] || ''}
                      onChange={(e) => onFilterChange(`max${f.key.charAt(0).toUpperCase() + f.key.slice(1)}`, e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {Object.keys(activeFilters).length > 0 && (
        <button
          className="btn btn-ghost"
          style={{ width: '100%', fontSize: 12, marginTop: 10 }}
          onClick={() => {
            if (window.confirm('Clear all filters?')) {
              window.location.reload();
            }
          }}
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default DynamicFilters;
