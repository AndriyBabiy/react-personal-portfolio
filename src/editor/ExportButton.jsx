import { useState, useRef, useEffect } from "react";
import JSZip from "jszip";

const AUTH_WORKER_URL =
  import.meta.env.VITE_AUTH_WORKER_URL || "https://andriybabiy.com/api/auth";

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]); // strip data:...;base64, prefix
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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

const ExportButton = ({
  profile,
  projects,
  skills,
  mediaFiles,
  desktopBackgrounds,
  token,
  changes,
  onSaveComplete,
}) => {
  const [copied, setCopied] = useState(false);
  // "idle" | "saving" | "deployed" | "error"
  const [saveStatus, setSaveStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const deployTimerRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (deployTimerRef.current) clearTimeout(deployTimerRef.current);
    };
  }, []);

  const getContentParams = () => ({
    videoPath: profile.videoPath || "/video.mp4",
    profileImage: profile.profileImage || "/profile.png",
    desktopBackgrounds: desktopBackgrounds || [],
  });

  const getContentText = () => {
    return generateContentJS(profile, projects, skills, getContentParams());
  };

  /* ─── Save & Deploy ─── */
  const handleSaveAndDeploy = async () => {
    setSaveStatus("saving");
    setErrorMsg("");

    try {
      const files = [];

      // Always include content.js
      files.push({
        path: "src/data/content.js",
        content: getContentText(),
      });

      // CV
      if (mediaFiles && mediaFiles.cv) {
        const base64 = await readFileAsBase64(mediaFiles.cv);
        files.push({ path: "public/cv.pdf", content: base64, encoding: "base64" });
      }

      // Video
      if (mediaFiles && mediaFiles.video) {
        const base64 = await readFileAsBase64(mediaFiles.video);
        files.push({ path: "public/video.mp4", content: base64, encoding: "base64" });
      }

      // Profile image
      if (mediaFiles && mediaFiles.profileImage) {
        const base64 = await readFileAsBase64(mediaFiles.profileImage);
        files.push({ path: "public/profile.png", content: base64, encoding: "base64" });
      }

      // Background images
      if (mediaFiles && mediaFiles.backgrounds && mediaFiles.backgrounds.length > 0) {
        for (const file of mediaFiles.backgrounds) {
          const base64 = await readFileAsBase64(file);
          files.push({
            path: `public/backgrounds/${file.name}`,
            content: base64,
            encoding: "base64",
          });
        }
      }

      const res = await fetch(`${AUTH_WORKER_URL}/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          files,
          message: "Update content via CMS",
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }

      const result = await res.json();

      if (result.noChanges) {
        setSaveStatus("nochanges");
        setErrorMsg(result.message || "Content is already up to date.");
        deployTimerRef.current = setTimeout(() => setSaveStatus("idle"), 4000);
        return;
      }

      setSaveStatus("deployed");
      if (onSaveComplete) onSaveComplete();

      deployTimerRef.current = setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    } catch (err) {
      setSaveStatus("error");
      setErrorMsg(err.message || "Deploy failed");
    }
  };

  /* ─── ZIP Export (existing) ─── */
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

  /* ─── Copy (existing) ─── */
  const handleCopy = () => {
    const content = getContentText();
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ─── Save button label & style ─── */
  const changeCount = changes ? changes.size : 0;

  const getSaveLabel = () => {
    if (saveStatus === "saving") return "Committing to GitHub...";
    if (saveStatus === "deployed") return "Committed! Deploying (~45s)...";
    if (saveStatus === "nochanges") return "Already up to date";
    if (saveStatus === "error") return "Failed — Retry";
    if (changeCount > 0) return `Save & Deploy · ${changeCount} file${changeCount > 1 ? "s" : ""}`;
    return "Save & Deploy";
  };

  const getSaveClassName = () => {
    const base = "btn btn-save";
    if (saveStatus === "deployed") return `${base} btn-success`;
    if (saveStatus === "nochanges") return `${base} btn-secondary`;
    if (saveStatus === "error") return `${base} btn-error`;
    return `${base} btn-primary`;
  };

  const isSaveDisabled =
    (saveStatus === "idle" && changeCount === 0) || saveStatus === "saving" || saveStatus === "deployed" || saveStatus === "nochanges";

  return (
    <>
      <button
        className={getSaveClassName()}
        onClick={handleSaveAndDeploy}
        disabled={isSaveDisabled}
        title={saveStatus === "error" ? errorMsg : undefined}
      >
        {getSaveLabel()}
      </button>
      <button className="btn btn-secondary" onClick={handleExportZip}>
        Export .zip
      </button>
      <button className="btn btn-secondary" onClick={handleCopy}>
        {copied ? "Copied!" : "Copy"}
      </button>
    </>
  );
};

export default ExportButton;
