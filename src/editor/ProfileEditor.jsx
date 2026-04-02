const ProfileEditor = ({ profile, onChange }) => {
  const handleChange = (field, value) => {
    const updated = { ...profile, [field]: value };
    if (field === "firstName" || field === "lastName") {
      updated.name = `${field === "firstName" ? value : profile.firstName} ${field === "lastName" ? value : profile.lastName}`;
    }
    if (field === "roles") {
      const roles = value.split(",").map((r) => r.trim()).filter(Boolean);
      updated.roles = roles;
      updated.tagline = roles.join(" \u00b7 ");
    }
    onChange(updated);
  };

  return (
    <div>
      <div className="field">
        <label>First Name</label>
        <input value={profile.firstName} onChange={(e) => handleChange("firstName", e.target.value)} />
      </div>
      <div className="field">
        <label>Last Name</label>
        <input value={profile.lastName} onChange={(e) => handleChange("lastName", e.target.value)} />
      </div>
      <div className="field">
        <label>Roles (comma-separated)</label>
        <input value={profile.roles.join(", ")} onChange={(e) => handleChange("roles", e.target.value)} />
      </div>
      <div className="field">
        <label>Short Bio</label>
        <textarea value={profile.bio} onChange={(e) => handleChange("bio", e.target.value)} rows={2} />
      </div>
      <div className="field">
        <label>Extended Bio</label>
        <textarea value={profile.extendedBio} onChange={(e) => handleChange("extendedBio", e.target.value)} rows={3} />
      </div>
      <div className="field">
        <label>Email</label>
        <input type="email" value={profile.email} onChange={(e) => handleChange("email", e.target.value)} />
      </div>
      <div className="field">
        <label>GitHub URL</label>
        <input type="url" value={profile.github} onChange={(e) => handleChange("github", e.target.value)} />
      </div>
      <div className="field">
        <label>LinkedIn URL</label>
        <input type="url" value={profile.linkedin} onChange={(e) => handleChange("linkedin", e.target.value)} />
      </div>
      <div className="field">
        <label>CV Path</label>
        <input value={profile.cvPath} onChange={(e) => handleChange("cvPath", e.target.value)} />
      </div>
    </div>
  );
};

export default ProfileEditor;
