import { useState } from "react";
import { Link } from "react-router";
import { profile as initialProfile, projects as initialProjects, skills as initialSkills } from "../data/content";
import ProfileEditor from "../editor/ProfileEditor";
import ProjectsEditor from "../editor/ProjectsEditor";
import SkillsEditor from "../editor/SkillsEditor";
import ExportButton from "../editor/ExportButton";
import "../editor/ContentEditor.css";

const TABS = ["Profile", "Projects", "Skills"];

function EditorPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [profile, setProfile] = useState({ ...initialProfile, roles: [...initialProfile.roles] });
  const [projects, setProjects] = useState(initialProjects.map((p) => ({ ...p, tags: [...p.tags] })));
  const [skills, setSkills] = useState(initialSkills.map((s) => ({ ...s, items: [...s.items] })));

  return (
    <div className="editor-page">
      <div className="editor-header">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link to="/" className="editor-back">&larr; Back</Link>
          <h1>Content Editor</h1>
        </div>
        <div className="editor-header-actions">
          <ExportButton profile={profile} projects={projects} skills={skills} />
        </div>
      </div>

      <div className="editor-body">
        <div className="editor-panel">
          <div className="editor-tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`editor-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="editor-content">
            {activeTab === "Profile" && (
              <ProfileEditor profile={profile} onChange={setProfile} />
            )}
            {activeTab === "Projects" && (
              <ProjectsEditor projects={projects} onChange={setProjects} />
            )}
            {activeTab === "Skills" && (
              <SkillsEditor skills={skills} onChange={setSkills} />
            )}
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-frame">
            <div style={{ padding: "40px 20px", maxWidth: 700, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
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
                <div
                  key={i}
                  style={{
                    padding: 20,
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.06)",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 18, margin: "0 0 8px" }}>
                    {project.title}
                  </h3>
                  <p style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 16, fontWeight: 300, lineHeight: 1.5, margin: "0 0 12px" }}>
                    {project.description}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          padding: "3px 10px",
                          borderRadius: 6,
                          border: "1px solid var(--btn-color)",
                          color: "var(--text-color)",
                          opacity: 0.7,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
