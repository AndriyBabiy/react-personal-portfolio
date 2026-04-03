import { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import { commitFiles, readFileAsBase64, MAX_BLOB_SIZE } from "./githubCommit";

const generateContentJS = (profile, projects, skills, { desktopBackgrounds }) => {
  const indent = (obj) => {
    return JSON.stringify(obj, null, 2)
      .split("\n")
      .map((line, i) => (i === 0 ? line : "  " + line))
      .join("\n");
  };

  const profileObj = {
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
    videoPath: profile.videoPath || "/video.mp4",
    profileImage: profile.profileImage || "/profile.png",
  };

  return [
    `export const profile = ${indent(profileObj)};`,
    "",
    `export const projects = ${indent(projects)};`,
    "",
    `export const desktopBackgrounds = ${indent(desktopBackgrounds || [])};`,
    "",
    `export const skills = ${indent(skills)};`,
    "",
  ].join("\n");
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
  const [saveStatus, setSaveStatus] = useState("idle");
  const [progressMsg, setProgressMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const getContentText = () =>
    generateContentJS(profile, projects, skills, { desktopBackgrounds });

  /* ─── Save & Deploy (direct to GitHub API) ─── */
  const handleSaveAndDeploy = async () => {
    setSaveStatus("saving");
    setProgressMsg("Preparing files...");
    setErrorMsg("");

    try {
      const files = [];

      // Always include content.js
      files.push({
        path: "src/data/content.js",
        content: getContentText(),
      });

      // CV PDF
      if (mediaFiles?.cv) {
        if (mediaFiles.cv.size > MAX_BLOB_SIZE) {
          throw new Error(`CV file too large (${(mediaFiles.cv.size / 1024 / 1024).toFixed(1)}MB). Use ZIP export for files over 50MB.`);
        }
        const base64 = await readFileAsBase64(mediaFiles.cv);
        files.push({ path: "public/cv.pdf", content: base64, encoding: "base64" });
      }

      // Profile image
      if (mediaFiles?.profileImage) {
        if (mediaFiles.profileImage.size > MAX_BLOB_SIZE) {
          throw new Error("Profile image too large. Use ZIP export.");
        }
        const base64 = await readFileAsBase64(mediaFiles.profileImage);
        files.push({ path: "public/profile.png", content: base64, encoding: "base64" });
      }

      // Video — warn if too large
      if (mediaFiles?.video) {
        if (mediaFiles.video.size > MAX_BLOB_SIZE) {
          throw new Error(`Video file too large (${(mediaFiles.video.size / 1024 / 1024).toFixed(0)}MB). Use ZIP export for video files.`);
        }
        const base64 = await readFileAsBase64(mediaFiles.video);
        files.push({ path: "public/video.mp4", content: base64, encoding: "base64" });
      }

      // Background images
      if (mediaFiles?.backgrounds?.length > 0) {
        for (const file of mediaFiles.backgrounds) {
          const base64 = await readFileAsBase64(file);
          files.push({
            path: `public/backgrounds/${file.name}`,
            content: base64,
            encoding: "base64",
          });
        }
      }

      // Commit directly to GitHub (no worker proxy)
      const result = await commitFiles(
        token,
        files,
        "Update content via CMS",
        (msg) => setProgressMsg(msg)
      );

      if (result.noChanges) {
        setSaveStatus("nochanges");
        setProgressMsg(result.message);
        timerRef.current = setTimeout(() => setSaveStatus("idle"), 4000);
        return;
      }

      setSaveStatus("deployed");
      setProgressMsg("Committed! Deploying (~45s)...");
      if (onSaveComplete) onSaveComplete();
      timerRef.current = setTimeout(() => setSaveStatus("idle"), 5000);
    } catch (err) {
      setSaveStatus("error");
      setErrorMsg(err.message || "Save failed");
      setProgressMsg("");
    }
  };

  /* ─── ZIP Export ─── */
  const handleExportZip = async () => {
    const zip = new JSZip();
    zip.file("src/data/content.js", getContentText());
    if (mediaFiles?.cv) zip.file("public/cv.pdf", mediaFiles.cv);
    if (mediaFiles?.video) zip.file("public/video.mp4", mediaFiles.video);
    if (mediaFiles?.profileImage) zip.file("public/profile.png", mediaFiles.profileImage);
    if (mediaFiles?.backgrounds?.length > 0) {
      for (const file of mediaFiles.backgrounds) {
        zip.file(`public/backgrounds/${file.name}`, file);
      }
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio-content.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ─── Copy ─── */
  const handleCopy = () => {
    navigator.clipboard.writeText(getContentText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ─── UI ─── */
  const changeCount = changes ? changes.size : 0;

  const getSaveLabel = () => {
    if (saveStatus === "saving") return progressMsg || "Saving...";
    if (saveStatus === "deployed") return progressMsg || "Deployed!";
    if (saveStatus === "nochanges") return progressMsg || "Already up to date";
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
    (saveStatus === "idle" && changeCount === 0) ||
    saveStatus === "saving" ||
    saveStatus === "deployed" ||
    saveStatus === "nochanges";

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
    </div>
  );
};

export default ExportButton;
