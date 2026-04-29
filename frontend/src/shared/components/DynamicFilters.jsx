import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Filter as FilterIcon } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const DynamicFilters = ({ onFilterChange, activeFilters = {} }) => {
  const { filters } = useSettings();
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

  return (
    <div className="dynamic-filters">
      <div className="filter-header" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <FilterIcon size={18} color="var(--primary)" />
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Filters</h3>
      </div>

      {filters.map((f) => (
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
                  {f.options.map((opt, idx) => {
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
                  {f.options.map((opt, idx) => {
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
      ))}

      {Object.keys(activeFilters).length > 0 && (
        <button 
          className="btn btn-ghost" 
          style={{ width: '100%', fontSize: 12, marginTop: 10 }}
          onClick={() => {
            // Clear all filters except internal ones if any
            const cleared = {};
            // Usually we'd want to keep some params but for now clear all passed to this component
            Object.keys(activeFilters).forEach(k => cleared[k] = '');
            // We'll just call the parent with an empty object if they handle it
            // Or better, let the parent handle the clear
            if (window.confirm('Clear all filters?')) {
              window.location.reload(); // Simple way for now or better:
              // onFilterChange('all', null); 
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
