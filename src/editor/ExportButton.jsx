import { useState } from "react";

const generateContentJS = (profile, projects, skills) => {
  const indent = (obj, level = 1) => {
    const pad = "  ".repeat(level);
    return JSON.stringify(obj, null, 2)
      .split("\n")
      .map((line, i) => (i === 0 ? line : pad + line))
      .join("\n");
  };

  const profileStr = `export const profile = ${indent({
    name: profile.name,
    firstName: profile.firstName,
    lastName: profile.lastName,
    roles: profile.roles,
    tagline: profile.tagline,
    bio: profile.bio,
    extendedBio: profile.extendedBio,
    email: profile.email,
    github: profile.github,
    linkedin: profile.linkedin,
    cvPath: profile.cvPath,
  })};`;

  const projectsStr = `export const projects = ${indent(projects)};`;

  const skillsStr = `export const skills = ${indent(skills)};`;

  return `${profileStr}\n\n${projectsStr}\n\n${skillsStr}\n`;
};

const ExportButton = ({ profile, projects, skills }) => {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const content = generateContentJS(profile, projects, skills);
    const blob = new Blob([content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "content.js";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const content = generateContentJS(profile, projects, skills);
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <button className="btn btn-secondary" onClick={handleCopy}>
        {copied ? "Copied!" : "Copy"}
      </button>
      <button className="btn btn-primary" onClick={handleDownload}>
        Export content.js
      </button>
    </>
  );
};

export default ExportButton;
