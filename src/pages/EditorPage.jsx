import { useState, useEffect } from "react";
import { Link } from "react-router";
import { profile as fallbackProfile, projects as fallbackProjects, skills as fallbackSkills, desktopBackgrounds as fallbackBackgrounds } from "../data/content";
import { fetchRepoFile, parseContentJS } from "../editor/githubCommit";
import ProfileEditor from "../editor/ProfileEditor";
import ProjectsEditor from "../editor/ProjectsEditor";
import SkillsEditor from "../editor/SkillsEditor";
import MediaEditor from "../editor/MediaEditor";
import ExportButton from "../editor/ExportButton";
import "../editor/ContentEditor.css";

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
const AUTH_WORKER_URL = import.meta.env.VITE_AUTH_WORKER_URL || "https://andriybabiy.com/api/auth";
const REDIRECT_URI = `${window.location.origin}/edit`;
const STORAGE_KEY = "editor_user";

const TABS = ["Profile", "Projects", "Skills", "Media"];

function LoginPrompt() {
  const handleLogin = () => {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "read:user,repo",
    });
    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  };

  return (
    <div className="editor-page">
      <div className="auth-gate">
        <div className="auth-card">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ marginBottom: 16 }}>
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <h2>Content Editor</h2>
          <p>Sign in with GitHub to access the editor.</p>
          <button className="btn btn-primary auth-btn" onClick={handleLogin}>
            Sign in with GitHub
          </button>
          <Link to="/" className="editor-back" style={{ marginTop: 16, display: "inline-block" }}>
            &larr; Back to portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="editor-page">
      <div className="auth-gate">
        <div className="auth-card">
          <h2>Access Denied</h2>
          <p>This editor is only available to the site owner.</p>
          <Link to="/" className="btn btn-secondary" style={{ marginTop: 12, display: "inline-block", textDecoration: "none" }}>
            Back to portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

function EditorPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Profile");

  // Content state — initialized empty, loaded from GitHub API after auth
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState(null);
  const [skills, setSkills] = useState(null);
  const [desktopBackgrounds, setDesktopBackgrounds] = useState(null);
  const [mediaFiles, setMediaFiles] = useState({ profileImage: null, cv: null, video: null, backgrounds: [] });
  const [changes, setChanges] = useState(new Set());

  // Track changes
  const trackChange = (file) => setChanges((prev) => new Set([...prev, file]));
  const handleProfileChange = (p) => { setProfile(p); trackChange("src/data/content.js"); };
  const handleProjectsChange = (p) => { setProjects(p); trackChange("src/data/content.js"); };
  const handleSkillsChange = (s) => { setSkills(s); trackChange("src/data/content.js"); };
  const handleMediaChange = (m) => {
    setMediaFiles(m);
    if (m.cv) trackChange("public/cv.pdf");
    if (m.video) trackChange("public/video.mp4");
    if (m.profileImage) trackChange("public/profile.png");
    if (m.backgrounds.length) trackChange("public/backgrounds");
  };
  const handleSaveComplete = () => setChanges(new Set());

  const handleSignOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (changes.size === 0) return;
    const handler = (e) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [changes.size]);

  // Auth: use localStorage so token persists across page refreshes
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!parsed.token) {
        localStorage.removeItem(STORAGE_KEY);
        setAuthLoading(false);
        return;
      }
      setUser(parsed);
      setAuthLoading(false);
      return;
    }

    // Check for OAuth callback code in URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      fetch(`${AUTH_WORKER_URL}/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject("denied")))
        .then((data) => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          setUser(data);
          window.history.replaceState({}, "", "/edit");
        })
        .catch(() => setUser(false))
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Load content from GitHub API after auth (not from deployed build)
  useEffect(() => {
    if (!user || !user.token || profile !== null) return;

    setContentLoading(true);
    fetchRepoFile(user.token, "src/data/content.js")
      .then((text) => {
        const parsed = parseContentJS(text);
        setProfile(parsed.profile || { ...fallbackProfile });
        setProjects(parsed.projects || [...fallbackProjects]);
        setSkills(parsed.skills || [...fallbackSkills]);
        setDesktopBackgrounds(parsed.desktopBackgrounds || [...fallbackBackgrounds]);
      })
      .catch(() => {
        // Fallback to static imports if GitHub API fails
        setProfile({ ...fallbackProfile, roles: [...fallbackProfile.roles] });
        setProjects(fallbackProjects.map((p) => ({ ...p, tags: [...p.tags] })));
        setSkills(fallbackSkills.map((s) => ({ ...s, items: [...s.items] })));
        setDesktopBackgrounds([...fallbackBackgrounds]);
      })
      .finally(() => setContentLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="editor-page">
        <div className="auth-gate"><p>Authenticating...</p></div>
      </div>
    );
  }

  if (user === false) return <AccessDenied />;
  if (!user) return <LoginPrompt />;

  if (contentLoading || !profile) {
    return (
      <div className="editor-page">
        <div className="auth-gate"><p>Loading content from GitHub...</p></div>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <div className="editor-header">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link to="/" className="editor-back">&larr; Back</Link>
          <h1>Content Editor</h1>
        </div>
        <div className="editor-header-actions">
          <span style={{ fontSize: 13, color: "var(--form-text-color)" }}>
            {user.login}
          </span>
          {user.avatar_url && (
            <img src={user.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: "50%" }} />
          )}
          <ExportButton
            profile={profile}
            projects={projects}
            skills={skills}
            mediaFiles={mediaFiles}
            desktopBackgrounds={desktopBackgrounds}
            token={user.token}
            changes={changes}
            onSaveComplete={handleSaveComplete}
          />
          <button className="btn btn-secondary" onClick={handleSignOut} style={{ fontSize: 12 }}>
            Sign out
          </button>
        </div>
      </div>

      <div className="editor-body">
        <div className="editor-panel">
          <div className="editor-tabs">
            {TABS.map((tab) => {
              const hasChanges =
                (tab === "Profile" || tab === "Projects" || tab === "Skills") && changes.has("src/data/content.js") ||
                tab === "Media" && (changes.has("public/cv.pdf") || changes.has("public/video.mp4") || changes.has("public/profile.png") || changes.has("public/backgrounds"));
              return (
                <button
                  key={tab}
                  className={`editor-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                  {hasChanges && <span className="change-dot" />}
                </button>
              );
            })}
          </div>
          <div className="editor-content">
            {activeTab === "Profile" && <ProfileEditor profile={profile} onChange={handleProfileChange} />}
            {activeTab === "Projects" && <ProjectsEditor projects={projects} onChange={handleProjectsChange} />}
            {activeTab === "Skills" && <SkillsEditor skills={skills} onChange={handleSkillsChange} />}
            {activeTab === "Media" && <MediaEditor profile={profile} mediaFiles={mediaFiles} onMediaChange={handleMediaChange} />}
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-frame">
            <div style={{ padding: "40px 20px", maxWidth: 700, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <img
                  src={mediaFiles.profileImage ? URL.createObjectURL(mediaFiles.profileImage) : profile.profileImage}
                  alt="Profile"
                  style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", marginBottom: 16 }}
                />
                <h1 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 32, textTransform: "uppercase", margin: "0 0 12px" }}>
                  {profile.firstName}<br />{profile.lastName}
                </h1>
                <h2 style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 20, textTransform: "uppercase", margin: "0 0 16px" }}>
                  {profile.roles.join(" · ")}
                </h2>
                <p style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 16, fontWeight: 300, maxWidth: "24ch", margin: "0 auto 16px" }}>
                  {profile.bio}
                </p>
              </div>
              <h1 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 32, textTransform: "uppercase", textAlign: "center", marginBottom: 24 }}>
                Projects
              </h1>
              {projects.map((project, i) => (
                <div key={i} style={{ padding: 20, borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 18, margin: "0 0 8px" }}>{project.title}</h3>
                  <p style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 16, fontWeight: 300, lineHeight: 1.5, margin: "0 0 12px" }}>{project.description}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {project.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 6, border: "1px solid var(--btn-color)", color: "var(--text-color)", opacity: 0.7 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="editor-status-bar">
        {changes.size > 0
          ? `${changes.size} file${changes.size > 1 ? "s" : ""} modified`
          : "No changes · Content loaded from GitHub"}
      </div>
    </div>
  );
}

export default EditorPage;
