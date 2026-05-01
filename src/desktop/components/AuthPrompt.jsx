import { useEffect, useRef, useState } from "react";
import "./AuthPrompt.css";

const AuthPrompt = ({
  open,
  appName = "Studio",
  appIconColor = "linear-gradient(135deg, #FF2D55, #C9215B)",
  reason = "Studio wants to make changes.",
  passphrase,
  onAllow,
  onCancel,
}) => {
  const [value, setValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);
  const shakeTimer = useRef(null);

  useEffect(() => {
    if (!open) {
      setValue("");
      setShowPassword(false);
      setError(false);
      return undefined;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel?.();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const triggerShake = () => {
    setError(true);
    if (shakeTimer.current) window.clearTimeout(shakeTimer.current);
    shakeTimer.current = window.setTimeout(() => setError(false), 480);
  };

  const submit = (e) => {
    e?.preventDefault?.();
    if (value === passphrase) {
      onAllow?.();
      return;
    }
    triggerShake();
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <div
      className="auth-prompt-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-prompt-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <form
        className={`auth-prompt-card ${error ? "shake" : ""}`}
        onSubmit={submit}
        noValidate
      >
        <div className="auth-prompt-icon" style={{ background: appIconColor }} aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3 6 6 .9-4.5 4.4 1 6.2L12 16.8 6.5 19.5l1-6.2L3 8.9 9 8z" />
          </svg>
        </div>

        <h2 id="auth-prompt-title" className="auth-prompt-title">
          {appName} wants to make changes.
        </h2>
        <p className="auth-prompt-reason">
          {reason !== "Studio wants to make changes." ? reason : "Enter the passphrase to allow this."}
        </p>

        <div className="auth-prompt-field">
          <label className="auth-prompt-label" htmlFor="auth-prompt-user">Account</label>
          <input
            id="auth-prompt-user"
            type="text"
            value="Editor"
            readOnly
            className="auth-prompt-input readonly"
            tabIndex={-1}
            aria-readonly="true"
          />
        </div>

        <div className="auth-prompt-field">
          <label className="auth-prompt-label" htmlFor="auth-prompt-pw">Passphrase</label>
          <div className="auth-prompt-input-wrap">
            <input
              id="auth-prompt-pw"
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="auth-prompt-input"
              autoComplete="current-password"
              spellCheck="false"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "auth-prompt-error" : undefined}
            />
            <button
              type="button"
              className="auth-prompt-eye"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide passphrase" : "Show passphrase"}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {error ? (
            <div id="auth-prompt-error" className="auth-prompt-error" role="alert">
              Incorrect passphrase. Try again.
            </div>
          ) : null}
        </div>

        <div className="auth-prompt-actions">
          <button
            type="button"
            className="auth-prompt-btn"
            onClick={() => onCancel?.()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="auth-prompt-btn primary"
            disabled={!value}
          >
            Allow
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthPrompt;
