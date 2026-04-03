import { useState } from "react";

const ItemsInput = ({ items, onChange }) => {
  const [text, setText] = useState(items.join(", "));

  const handleChange = (value) => {
    setText(value);
    onChange(value.split(",").map((t) => t.trim()).filter(Boolean));
  };

  return (
    <input value={text} onChange={(e) => handleChange(e.target.value)} />
  );
};

const SkillsEditor = ({ skills, onChange }) => {
  const updateCategory = (index, field, value) => {
    const updated = skills.map((s, i) => {
      if (i !== index) return s;
      return { ...s, [field]: value };
    });
    onChange(updated);
  };

  const addCategory = () => {
    onChange([...skills, { category: "New Category", items: [] }]);
  };

  const removeCategory = (index) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div>
      {skills.map((group, i) => (
        <div key={i} className="editor-card">
          <div className="editor-card-header">
            <h4>{group.category}</h4>
            <button className="btn btn-danger" onClick={() => removeCategory(i)} aria-label="Remove category">
              &times;
            </button>
          </div>
          <div className="field">
            <label>Category Name</label>
            <input value={group.category} onChange={(e) => updateCategory(i, "category", e.target.value)} />
          </div>
          <div className="field">
            <label>Skills (comma-separated)</label>
            <ItemsInput key={`items-${i}`} items={group.items} onChange={(items) => updateCategory(i, "items", items)} />
          </div>
        </div>
      ))}
      <div className="add-row">
        <button className="btn btn-secondary" onClick={addCategory}>+ Add Category</button>
      </div>
    </div>
  );
};

export default SkillsEditor;
