import { useMemo } from "react";

const MediaEditor = ({ mediaFiles, onMediaChange, profile }) => {
  const profileImagePreview = useMemo(() => {
    if (mediaFiles.profileImage) {
      return URL.createObjectURL(mediaFiles.profileImage);
    }
    return profile.profileImage || null;
  }, [mediaFiles.profileImage, profile.profileImage]);

  const backgroundPreviews = useMemo(() => {
    return mediaFiles.backgrounds.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
  }, [mediaFiles.backgrounds]);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0] || null;
    onMediaChange({ ...mediaFiles, profileImage: file });
  };

  const handleCVChange = (e) => {
    const file = e.target.files[0] || null;
    onMediaChange({ ...mediaFiles, cv: file });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0] || null;
    onMediaChange({ ...mediaFiles, video: file });
  };

  const handleBackgroundsChange = (e) => {
    const files = Array.from(e.target.files);
    onMediaChange({ ...mediaFiles, backgrounds: files });
  };

  return (
    <div>
      {/* Profile Image */}
      <div className="editor-card">
        <h4>Profile Image</h4>
        {profileImagePreview && (
          <img
            src={profileImagePreview}
            alt="Profile preview"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
              marginBottom: 8,
            }}
          />
        )}
        <input type="file" accept="image/*" onChange={handleProfileImageChange} />
        <p className="field-hint">Current: {profile.profileImage}</p>
      </div>

      {/* CV PDF */}
      <div className="editor-card">
        <h4>CV / Resume (PDF)</h4>
        <input type="file" accept=".pdf" onChange={handleCVChange} />
        <p className="field-hint">
          {mediaFiles.cv ? mediaFiles.cv.name : `Current: ${profile.cvPath}`}
        </p>
      </div>

      {/* Video */}
      <div className="editor-card">
        <h4>Video</h4>
        <input type="file" accept="video/*" onChange={handleVideoChange} />
        <p className="field-hint">
          {mediaFiles.video ? mediaFiles.video.name : `Current: ${profile.videoPath}`}
        </p>
      </div>

      {/* Desktop Backgrounds */}
      <div className="editor-card">
        <h4>Desktop Backgrounds</h4>
        {backgroundPreviews.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {backgroundPreviews.map((bg, i) => (
              <img
                key={i}
                src={bg.url}
                alt={bg.name}
                style={{
                  width: 80,
                  height: 50,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
            ))}
          </div>
        )}
        <input type="file" accept="image/*" multiple onChange={handleBackgroundsChange} />
        <p className="field-hint">
          {mediaFiles.backgrounds.length} new background(s) selected
        </p>
      </div>
    </div>
  );
};

export default MediaEditor;
