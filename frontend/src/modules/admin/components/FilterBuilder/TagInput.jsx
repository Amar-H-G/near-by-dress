import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import './TagInput.css';

const TagInput = ({ tags, setTags, placeholder = "Add option...", label }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      setInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="tag-input-container">
      {label && <label className="tag-input-label">{label}</label>}
      <div className="tag-input-wrapper">
        <div className="tags-list">
          {tags.map(tag => (
            <span key={tag} className="tag-item">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="tag-remove">
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            type="text"
            className="tag-main-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={tags.length === 0 ? placeholder : ""}
          />
        </div>
      </div>
      <p className="tag-input-helper">Press Enter or comma to add</p>
    </div>
  );
};

export default TagInput;
