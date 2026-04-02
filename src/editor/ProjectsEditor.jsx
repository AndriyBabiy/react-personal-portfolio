const ProjectsEditor = ({ projects, onChange }) => {
  const updateProject = (index, field, value) => {
    const updated = projects.map((p, i) => {
      if (i !== index) return p;
      if (field === "tags") {
        return { ...p, tags: value.split(",").map((t) => t.trim()).filter(Boolean) };
      }
      return { ...p, [field]: value };
    });
    onChange(updated);
  };

  const addProject = () => {
    onChange([...projects, { title: "New Project", description: "", tags: [], link: "" }]);
  };

  const removeProject = (index) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  const moveProject = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= projects.length) return;
    const updated = [...projects];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div>
      {projects.map((project, i) => (
        <div key={i} className="editor-card">
          <div className="editor-card-header">
            <h4>{project.title || "Untitled"}</h4>
            <div style={{ display: "flex", gap: 4 }}>
              <button className="btn btn-secondary" onClick={() => moveProject(i, -1)} disabled={i === 0} aria-label="Move up">
                &uarr;
              </button>
              <button className="btn btn-secondary" onClick={() => moveProject(i, 1)} disabled={i === projects.length - 1} aria-label="Move down">
                &darr;
              </button>
              <button className="btn btn-danger" onClick={() => removeProject(i)} aria-label="Remove project">
                &times;
              </button>
            </div>
          </div>
          <div className="field">
            <label>Title</label>
            <input value={project.title} onChange={(e) => updateProject(i, "title", e.target.value)} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={project.description} onChange={(e) => updateProject(i, "description", e.target.value)} rows={2} />
          </div>
          <div className="field">
            <label>Tags (comma-separated)</label>
            <input value={project.tags.join(", ")} onChange={(e) => updateProject(i, "tags", e.target.value)} />
          </div>
          <div className="field">
            <label>Link</label>
            <input type="url" value={project.link} onChange={(e) => updateProject(i, "link", e.target.value)} />
          </div>
        </div>
      ))}
      <div className="add-row">
        <button className="btn btn-secondary" onClick={addProject}>+ Add Project</button>
      </div>
    </div>
  );
};

export default ProjectsEditor;
