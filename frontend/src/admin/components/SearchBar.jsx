import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ placeholder = 'Search...', onSearch, delay = 350, id }) => {
  const [value, setValue] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(value.trim()), delay);
    return () => clearTimeout(timer.current);
  }, [value, delay, onSearch]);

  return (
    <div className="admin-search-wrap">
      <Search size={16} className="admin-search-icon" />
      <input
        id={id || 'admin-search'}
        type="text"
        className="admin-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
      />
      {value && (
        <button
          className="admin-search-clear"
          onClick={() => setValue('')}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
