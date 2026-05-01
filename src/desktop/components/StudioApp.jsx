import { useEffect, useMemo, useState } from "react";
import { useStudioContent } from "../hooks/useStudioContent";
import * as content from "../../data/content";
import {
  readOverlay,
  setOverlayKey,
  clearOverlayKey,
  clearOverlay,
  subscribe as subscribeOverlay,
} from "../utils/contentOverlay";
import "./StudioApp.css";

const COLLECTIONS = [
  { group: "Content", items: [
    { id: "profile", label: "Profile", icon: "user" },
    { id: "blogPosts", label: "Blog", icon: "doc" },
    { id: "projects", label: "Projects", icon: "folder" },
    { id: "skills", label: "Skills", icon: "stack" },
  ]},
  { group: "Configuration", items: [
    { id: "siteConfig", label: "Site Settings", icon: "gear" },
    { id: "desktopConfig", label: "Desktop", icon: "grid" },
  ]},
];

const SidebarIcon = ({ id }) => {
  const props = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (id) {
    case "user": return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case "doc": return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
    case "folder": return <svg {...props}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
    case "stack": return <svg {...props}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
    case "gear": return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 4 0v.09c0 .66.39 1.26 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82c.25.61.85 1 1.51 1H21a2 2 0 0 1 0 4h-.09c-.66 0-1.26.39-1.51 1z" /></svg>;
    case "grid": return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
    default: return null;
  }
};

const useOverlayState = () => {
  const [overlay, setOverlay] = useState(() => readOverlay());
  useEffect(() => {
    const unsub = subscribeOverlay(() => setOverlay(readOverlay()));
    return unsub;
  }, []);
  return overlay;
};

const Field = ({ label, children, hint }) => (
  <label className="studio-field">
    <span className="studio-field-label">{label}</span>
    {children}
    {hint ? <span className="studio-field-hint">{hint}</span> : null}
  </label>
);

const ProfileEditor = () => {
  const profile = useStudioContent("profile") || {};
  const update = (patch) => setOverlayKey("profile", { ...profile, ...patch });
  const updateRoles = (text) =>
    update({ roles: text.split(",").map((r) => r.trim()).filter(Boolean) });

  return (
    <div className="studio-form">
      <Field label="Name">
        <input className="studio-input" value={profile.name || ""} onChange={(e) => update({ name: e.target.value })} />
      </Field>
      <div className="studio-row">
        <Field label="First name">
          <input className="studio-input" value={profile.firstName || ""} onChange={(e) => update({ firstName: e.target.value })} />
        </Field>
        <Field label="Last name">
          <input className="studio-input" value={profile.lastName || ""} onChange={(e) => update({ lastName: e.target.value })} />
        </Field>
      </div>
      <Field label="Tagline">
        <input className="studio-input" value={profile.tagline || ""} onChange={(e) => update({ tagline: e.target.value })} />
      </Field>
      <Field label="Roles" hint="Comma-separated.">
        <input className="studio-input" value={(profile.roles || []).join(", ")} onChange={(e) => updateRoles(e.target.value)} />
      </Field>
      <Field label="Bio">
        <textarea className="studio-input studio-textarea" rows={3} value={profile.bio || ""} onChange={(e) => update({ bio: e.target.value })} />
      </Field>
      <Field label="Extended bio">
        <textarea className="studio-input studio-textarea" rows={5} value={profile.extendedBio || ""} onChange={(e) => update({ extendedBio: e.target.value })} />
      </Field>
      <div className="studio-row">
        <Field label="Email">
          <input className="studio-input" type="email" value={profile.email || ""} onChange={(e) => update({ email: e.target.value })} />
        </Field>
        <Field label="GitHub URL">
          <input className="studio-input" value={profile.github || ""} onChange={(e) => update({ github: e.target.value })} />
        </Field>
      </div>
      <Field label="LinkedIn URL">
        <input className="studio-input" value={profile.linkedin || ""} onChange={(e) => update({ linkedin: e.target.value })} />
      </Field>

      <h4 className="studio-section-heading">Landing page media</h4>
      <Field
        label="Profile image"
        hint="Path under /public (e.g. /uploads/profile.png). Upload new files via Publish to GitHub."
      >
        <div className="studio-media-row">
          <input
            className="studio-input"
            value={profile.profileImage || ""}
            onChange={(e) => update({ profileImage: e.target.value })}
            placeholder="/uploads/profile.png"
          />
          {profile.profileImage ? (
            <img
              className="studio-media-thumb"
              src={profile.profileImage}
              alt="Profile preview"
              onError={(e) => { e.currentTarget.style.opacity = "0.2"; }}
            />
          ) : (
            <div className="studio-media-thumb studio-media-thumb-empty" aria-hidden="true">—</div>
          )}
        </div>
      </Field>
      <Field
        label="Resume / CV file"
        hint="Path under /public (e.g. /uploads/cv.pdf). Used by the landing-page Resume button and the CV app."
      >
        <div className="studio-media-row">
          <input
            className="studio-input"
            value={profile.cvPath || ""}
            onChange={(e) => update({ cvPath: e.target.value })}
            placeholder="/uploads/cv.pdf"
          />
          {profile.cvPath ? (
            <a
              className="studio-pop-btn"
              href={profile.cvPath}
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview
            </a>
          ) : null}
        </div>
      </Field>
    </div>
  );
};

const ProjectsEditor = () => {
  const projects = useStudioContent("projects") || [];
  const [active, setActive] = useState(0);
  const set = (next) => setOverlayKey("projects", next);
  const update = (patch) => {
    const next = projects.map((p, i) => (i === active ? { ...p, ...patch } : p));
    set(next);
  };
  const updateTags = (text) =>
    update({ tags: text.split(",").map((t) => t.trim()).filter(Boolean) });
  const addProject = () => {
    const next = [...projects, { title: "New project", description: "", tags: [], link: "" }];
    set(next);
    setActive(next.length - 1);
  };
  const removeActive = () => {
    if (!projects.length) return;
    const next = projects.filter((_, i) => i !== active);
    set(next);
    setActive(Math.max(0, active - 1));
  };

  const current = projects[active] || null;

  return (
    <div className="studio-list-editor">
      <div className="studio-list-pane">
        <div className="studio-list-toolbar">
          <button type="button" className="studio-pop-btn" onClick={addProject}>+ New</button>
          <button type="button" className="studio-pop-btn" onClick={removeActive} disabled={!current}>Delete</button>
        </div>
        <ul className="studio-list">
          {projects.map((p, i) => (
            <li key={i}>
              <button
                type="button"
                className={`studio-list-item ${i === active ? "selected" : ""}`}
                onClick={() => setActive(i)}
              >
                <span className="studio-list-title">{p.title || "Untitled"}</span>
                <span className="studio-list-meta">{p.tags?.length ? p.tags.join(" · ") : "no tags"}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="studio-list-detail">
        {current ? (
          <div className="studio-form">
            <Field label="Title">
              <input className="studio-input" value={current.title || ""} onChange={(e) => update({ title: e.target.value })} />
            </Field>
            <Field label="Description">
              <textarea className="studio-input studio-textarea" rows={3} value={current.description || ""} onChange={(e) => update({ description: e.target.value })} />
            </Field>
            <Field label="Tags" hint="Comma-separated.">
              <input className="studio-input" value={(current.tags || []).join(", ")} onChange={(e) => updateTags(e.target.value)} />
            </Field>
            <Field label="Link">
              <input className="studio-input" value={current.link || ""} onChange={(e) => update({ link: e.target.value })} />
            </Field>
          </div>
        ) : (
          <div className="studio-empty">Select a project, or create a new one.</div>
        )}
      </div>
    </div>
  );
};

const blockToText = (block) => {
  if (!block) return "";
  if (block.type === "list") return (block.items || []).join("\n");
  if (block.type === "heading") return block.text || "";
  return block.text || "";
};

const BlogEditor = () => {
  const blogPosts = useStudioContent("blogPosts") || [];
  const [active, setActive] = useState(0);
  const set = (next) => setOverlayKey("blogPosts", next);
  const update = (patch) => {
    const next = blogPosts.map((p, i) => (i === active ? { ...p, ...patch } : p));
    set(next);
  };
  const updateBlock = (idx, patch) => {
    const blocks = [...(current?.content || [])];
    blocks[idx] = { ...blocks[idx], ...patch };
    update({ content: blocks });
  };
  const removeBlock = (idx) => {
    const blocks = (current?.content || []).filter((_, i) => i !== idx);
    update({ content: blocks });
  };
  const addBlock = (type) => {
    const blocks = [...(current?.content || [])];
    if (type === "list") blocks.push({ type: "list", items: ["First item"] });
    else if (type === "heading") blocks.push({ type: "heading", level: 3, text: "New heading" });
    else blocks.push({ type: "paragraph", text: "" });
    update({ content: blocks });
  };
  const addPost = () => {
    const id = `post-${Date.now()}`;
    const next = [
      { id, title: "New post", date: new Date().toISOString().slice(0, 10), readingMinutes: 1, tags: [], excerpt: "", content: [{ type: "paragraph", text: "" }] },
      ...blogPosts,
    ];
    set(next);
    setActive(0);
  };
  const removeActive = () => {
    if (!blogPosts.length) return;
    const next = blogPosts.filter((_, i) => i !== active);
    set(next);
    setActive(Math.max(0, active - 1));
  };
  const updateTags = (text) =>
    update({ tags: text.split(",").map((t) => t.trim()).filter(Boolean) });

  const current = blogPosts[active] || null;

  return (
    <div className="studio-list-editor">
      <div className="studio-list-pane">
        <div className="studio-list-toolbar">
          <button type="button" className="studio-pop-btn" onClick={addPost}>+ New post</button>
          <button type="button" className="studio-pop-btn" onClick={removeActive} disabled={!current}>Delete</button>
        </div>
        <ul className="studio-list">
          {blogPosts.map((p, i) => (
            <li key={p.id || i}>
              <button
                type="button"
                className={`studio-list-item ${i === active ? "selected" : ""}`}
                onClick={() => setActive(i)}
              >
                <span className="studio-list-title">{p.title || "Untitled"}</span>
                <span className="studio-list-meta">{p.date}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="studio-list-detail">
        {current ? (
          <div className="studio-form">
            <Field label="Slug (id)">
              <input className="studio-input" value={current.id || ""} onChange={(e) => update({ id: e.target.value })} />
            </Field>
            <Field label="Title">
              <input className="studio-input" value={current.title || ""} onChange={(e) => update({ title: e.target.value })} />
            </Field>
            <div className="studio-row">
              <Field label="Date">
                <input className="studio-input" type="date" value={current.date || ""} onChange={(e) => update({ date: e.target.value })} />
              </Field>
              <Field label="Reading minutes">
                <input className="studio-input" type="number" min="1" value={current.readingMinutes || 1} onChange={(e) => update({ readingMinutes: Number(e.target.value) || 1 })} />
              </Field>
            </div>
            <Field label="Tags" hint="Comma-separated.">
              <input className="studio-input" value={(current.tags || []).join(", ")} onChange={(e) => updateTags(e.target.value)} />
            </Field>
            <Field label="Excerpt">
              <textarea className="studio-input studio-textarea" rows={2} value={current.excerpt || ""} onChange={(e) => update({ excerpt: e.target.value })} />
            </Field>

            <div className="studio-blocks">
              <div className="studio-blocks-header">
                <span className="studio-field-label">Content blocks</span>
                <div className="studio-blocks-add">
                  <button type="button" className="studio-pop-btn" onClick={() => addBlock("paragraph")}>+ Paragraph</button>
                  <button type="button" className="studio-pop-btn" onClick={() => addBlock("heading")}>+ Heading</button>
                  <button type="button" className="studio-pop-btn" onClick={() => addBlock("list")}>+ List</button>
                </div>
              </div>
              {(current.content || []).map((block, i) => (
                <div key={i} className="studio-block">
                  <div className="studio-block-row">
                    <span className="studio-block-type">{block.type}</span>
                    <button type="button" className="studio-link-btn" onClick={() => removeBlock(i)}>Remove</button>
                  </div>
                  {block.type === "list" ? (
                    <textarea
                      className="studio-input studio-textarea"
                      rows={Math.min(8, Math.max(3, (block.items || []).length + 1))}
                      value={blockToText(block)}
                      onChange={(e) => updateBlock(i, { items: e.target.value.split("\n").filter(Boolean) })}
                    />
                  ) : block.type === "heading" ? (
                    <div className="studio-row">
                      <select
                        className="studio-input studio-select"
                        value={block.level || 3}
                        onChange={(e) => updateBlock(i, { level: Number(e.target.value) })}
                      >
                        <option value={2}>H2</option>
                        <option value={3}>H3</option>
                        <option value={4}>H4</option>
                      </select>
                      <input
                        className="studio-input"
                        value={block.text || ""}
                        onChange={(e) => updateBlock(i, { text: e.target.value })}
                      />
                    </div>
                  ) : (
                    <textarea
                      className="studio-input studio-textarea"
                      rows={3}
                      value={block.text || ""}
                      onChange={(e) => updateBlock(i, { text: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="studio-empty">Select a post, or create a new one.</div>
        )}
      </div>
    </div>
  );
};

const SkillsEditor = () => {
  const skills = useStudioContent("skills") || [];
  const set = (next) => setOverlayKey("skills", next);
  const updateGroup = (idx, patch) => {
    const next = skills.map((g, i) => (i === idx ? { ...g, ...patch } : g));
    set(next);
  };
  const updateItems = (idx, text) =>
    updateGroup(idx, { items: text.split(",").map((s) => s.trim()).filter(Boolean) });
  const addGroup = () => set([...skills, { category: "New category", items: [] }]);
  const removeGroup = (idx) => set(skills.filter((_, i) => i !== idx));

  return (
    <div className="studio-form">
      {skills.map((group, i) => (
        <div key={i} className="studio-group">
          <div className="studio-row">
            <Field label="Category">
              <input className="studio-input" value={group.category || ""} onChange={(e) => updateGroup(i, { category: e.target.value })} />
            </Field>
            <button type="button" className="studio-link-btn" onClick={() => removeGroup(i)}>Remove</button>
          </div>
          <Field label="Items" hint="Comma-separated.">
            <textarea className="studio-input studio-textarea" rows={2} value={(group.items || []).join(", ")} onChange={(e) => updateItems(i, e.target.value)} />
          </Field>
        </div>
      ))}
      <button type="button" className="studio-pop-btn" onClick={addGroup}>+ Add category</button>
    </div>
  );
};

const SiteSettingsEditor = () => {
  const siteConfig = useStudioContent("siteConfig") || {};
  const update = (patch) => setOverlayKey("siteConfig", { ...siteConfig, ...patch });
  const updateNested = (key, patch) => update({ [key]: { ...(siteConfig[key] || {}), ...patch } });

  return (
    <div className="studio-form">
      <h4 className="studio-section-heading">SEO</h4>
      <Field label="Title">
        <input className="studio-input" value={siteConfig.seo?.title || ""} onChange={(e) => updateNested("seo", { title: e.target.value })} />
      </Field>
      <Field label="Description">
        <textarea className="studio-input studio-textarea" rows={2} value={siteConfig.seo?.description || ""} onChange={(e) => updateNested("seo", { description: e.target.value })} />
      </Field>

      <h4 className="studio-section-heading">Hero</h4>
      <div className="studio-row">
        <Field label="Resume button">
          <input className="studio-input" value={siteConfig.hero?.resumeButtonText || ""} onChange={(e) => updateNested("hero", { resumeButtonText: e.target.value })} />
        </Field>
        <Field label="Desktop link">
          <input className="studio-input" value={siteConfig.hero?.desktopLinkText || ""} onChange={(e) => updateNested("hero", { desktopLinkText: e.target.value })} />
        </Field>
      </div>

      <h4 className="studio-section-heading">Footer</h4>
      <Field label="Footer text" hint="Use {year} for the current year.">
        <input className="studio-input" value={siteConfig.footer?.text || ""} onChange={(e) => updateNested("footer", { text: e.target.value })} />
      </Field>
    </div>
  );
};

const DesktopConfigEditor = () => {
  const desktopConfig = useStudioContent("desktopConfig") || {};
  const update = (patch) => setOverlayKey("desktopConfig", { ...desktopConfig, ...patch });
  const updateNested = (key, patch) => update({ [key]: { ...(desktopConfig[key] || {}), ...patch } });

  return (
    <div className="studio-form">
      <h4 className="studio-section-heading">About</h4>
      <Field label="About heading">
        <input className="studio-input" value={desktopConfig.aboutApp?.aboutHeading || ""} onChange={(e) => updateNested("aboutApp", { aboutHeading: e.target.value })} />
      </Field>
      <Field label="Skills heading">
        <input className="studio-input" value={desktopConfig.aboutApp?.skillsHeading || ""} onChange={(e) => updateNested("aboutApp", { skillsHeading: e.target.value })} />
      </Field>
      <Field label="Links heading">
        <input className="studio-input" value={desktopConfig.aboutApp?.linksHeading || ""} onChange={(e) => updateNested("aboutApp", { linksHeading: e.target.value })} />
      </Field>

      <h4 className="studio-section-heading">Contact</h4>
      <Field label="Heading">
        <input className="studio-input" value={desktopConfig.contactApp?.heading || ""} onChange={(e) => updateNested("contactApp", { heading: e.target.value })} />
      </Field>
      <Field label="Subheading">
        <input className="studio-input" value={desktopConfig.contactApp?.subheading || ""} onChange={(e) => updateNested("contactApp", { subheading: e.target.value })} />
      </Field>

      <h4 className="studio-section-heading">Projects</h4>
      <Field label="Heading">
        <input className="studio-input" value={desktopConfig.projectsApp?.heading || ""} onChange={(e) => updateNested("projectsApp", { heading: e.target.value })} />
      </Field>
      <Field label="Subheading">
        <input className="studio-input" value={desktopConfig.projectsApp?.subheading || ""} onChange={(e) => updateNested("projectsApp", { subheading: e.target.value })} />
      </Field>
    </div>
  );
};

const COLLECTION_EDITORS = {
  profile: ProfileEditor,
  projects: ProjectsEditor,
  blogPosts: BlogEditor,
  skills: SkillsEditor,
  siteConfig: SiteSettingsEditor,
  desktopConfig: DesktopConfigEditor,
};

const StudioApp = ({ onOpenBrowser }) => {
  const [activeId, setActiveId] = useState("profile");
  const overlay = useOverlayState();
  const overlayKeys = useMemo(() => new Set(Object.keys(overlay || {})), [overlay]);
  const Editor = COLLECTION_EDITORS[activeId];

  const activeMeta = useMemo(() => {
    for (const group of COLLECTIONS) {
      const found = group.items.find((i) => i.id === activeId);
      if (found) return found;
    }
    return null;
  }, [activeId]);

  const isModified = overlayKeys.has(activeId);
  const totalModified = overlayKeys.size;

  const resetActive = () => clearOverlayKey(activeId);
  const resetAll = () => clearOverlay();

  const publish = () => {
    const url = content.siteConfig?.studio?.publishUrl || "/admin/";
    if (onOpenBrowser) {
      onOpenBrowser({ url, title: "Sveltia CMS — Publish" });
    } else if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="studio-app">
      <aside className="studio-sidebar" aria-label="Collections">
        {COLLECTIONS.map((group) => (
          <div key={group.group} className="studio-sidebar-group">
            <div className="studio-sidebar-heading">{group.group}</div>
            <ul className="studio-sidebar-list">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`studio-sidebar-item ${activeId === item.id ? "selected" : ""}`}
                    onClick={() => setActiveId(item.id)}
                  >
                    <SidebarIcon id={item.icon} />
                    <span className="studio-sidebar-label">{item.label}</span>
                    {overlayKeys.has(item.id) ? (
                      <span className="studio-modified-dot" aria-label="modified" />
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      <section className="studio-main">
        <header className="studio-toolbar">
          <div className="studio-toolbar-title">
            <span>{activeMeta?.label || "Studio"}</span>
            {isModified ? <span className="studio-pill">local changes</span> : null}
          </div>
          <div className="studio-toolbar-actions">
            <button
              type="button"
              className="studio-pop-btn"
              onClick={resetActive}
              disabled={!isModified}
              title="Discard local changes for this collection"
            >
              Reset
            </button>
            <button
              type="button"
              className="studio-pop-btn"
              onClick={resetAll}
              disabled={totalModified === 0}
              title="Discard all local changes"
            >
              Reset all{totalModified ? ` (${totalModified})` : ""}
            </button>
            <button
              type="button"
              className="studio-pop-btn primary"
              onClick={publish}
              title="Open Sveltia CMS to commit changes to GitHub"
            >
              Publish to GitHub
            </button>
          </div>
        </header>

        <div className="studio-banner" role="note">
          Edits are stored locally for instant preview. Use <strong>Publish to GitHub</strong> to commit changes via Sveltia CMS.
        </div>

        <div className="studio-content">
          {Editor ? <Editor /> : <div className="studio-empty">Pick a collection.</div>}
        </div>
      </section>
    </div>
  );
};

export default StudioApp;
