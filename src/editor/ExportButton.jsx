import { useState } from "react";
import JSZip from "jszip";

const generateContentJS = (profile, projects, skills, { videoPath, profileImage, desktopBackgrounds }) => {
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
    videoPath: videoPath,
    profileImage: profileImage,
  })};`;

  const projectsStr = `export const projects = ${indent(projects)};`;

  const skillsStr = `export const skills = ${indent(skills)};`;

  const backgroundsStr = `export const desktopBackgrounds = ${indent(desktopBackgrounds)};`;

  return `${profileStr}\n\n${projectsStr}\n\n${skillsStr}\n\n${backgroundsStr}\n`;
};

const ExportButton = ({ profile, projects, skills, mediaFiles, desktopBackgrounds }) => {
  const [copied, setCopied] = useState(false);

  const getContentParams = () => ({
    videoPath: profile.videoPath || "/video.mp4",
    profileImage: profile.profileImage || "/profile.png",
    desktopBackgrounds: desktopBackgrounds || [],
  });

  const getContentText = () => {
    return generateContentJS(profile, projects, skills, getContentParams());
  };

  const handleExportZip = async () => {
    const contentText = getContentText();
    const zip = new JSZip();

    // Add content.js
    zip.file("src/data/content.js", contentText);

    // Add CV if provided
    if (mediaFiles && mediaFiles.cv) {
      zip.file("public/cv.pdf", mediaFiles.cv);
    }

    // Add video if provided
    if (mediaFiles && mediaFiles.video) {
      zip.file("public/video.mp4", mediaFiles.video);
    }

    // Add profile image if provided
    if (mediaFiles && mediaFiles.profileImage) {
      zip.file("public/profile.png", mediaFiles.profileImage);
    }

    // Add background images
    if (mediaFiles && mediaFiles.backgrounds && mediaFiles.backgrounds.length > 0) {
      for (const file of mediaFiles.backgrounds) {
        zip.file(`public/backgrounds/${file.name}`, file);
      }
    }

    // Generate and download
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio-content.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const content = getContentText();
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
      <button className="btn btn-primary" onClick={handleExportZip}>
        Export Bundle (.zip)
      </button>
    </>
  );
};

export default ExportButton;
