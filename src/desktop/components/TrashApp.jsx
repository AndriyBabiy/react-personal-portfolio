import { useState } from "react";
import "./TrashApp.css";

const TEXT_FILE = {
  id: "bad-ideas",
  name: "bad ideas.txt",
  body:
    "bad ideas\n" +
    "─────────\n\n" +
    "• a dating app, but just for people who hate dating\n" +
    "• an AI that writes your resignation letter mid-standup\n" +
    "• subscription service for unsolicited feedback\n" +
    "• productivity tool that deletes one file for every task you complete\n" +
    "• Slack, but every message is sent as a haiku\n",
};

const FileIcon = () => (
  <svg width="56" height="72" viewBox="0 0 56 72" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#e8e8ea" />
      </linearGradient>
    </defs>
    <path
      d="M6 2 H36 L50 16 V66 a4 4 0 0 1 -4 4 H6 a4 4 0 0 1 -4 -4 V6 a4 4 0 0 1 4 -4 z"
      fill="url(#paper)"
      stroke="rgba(0,0,0,0.18)"
      strokeWidth="1"
    />
    <path d="M36 2 V14 a2 2 0 0 0 2 2 H50" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
    <text x="10" y="40" fontFamily="-apple-system, SF Pro Text" fontSize="7" fill="#4a4a4e" letterSpacing="0.2">bad</text>
    <text x="10" y="50" fontFamily="-apple-system, SF Pro Text" fontSize="7" fill="#4a4a4e" letterSpacing="0.2">ideas</text>
    <rect x="8" y="56" width="34" height="1" fill="rgba(0,0,0,0.12)" />
    <rect x="8" y="60" width="28" height="1" fill="rgba(0,0,0,0.12)" />
  </svg>
);

const TrashApp = () => {
  const [openFile, setOpenFile] = useState(null);
  const [selected, setSelected] = useState(null);

  return (
    <div className="trash-app">
      <div className="trash-toolbar">
        <span className="trash-path">Trash</span>
        <span className="trash-count">1 item</span>
      </div>
      <div
        className="trash-grid"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        <button
          type="button"
          className={`trash-file ${selected === TEXT_FILE.id ? "selected" : ""}`}
          onClick={() => setSelected(TEXT_FILE.id)}
          onDoubleClick={() => setOpenFile(TEXT_FILE)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpenFile(TEXT_FILE);
            }
          }}
          aria-label={`Open ${TEXT_FILE.name}`}
        >
          <FileIcon />
          <span className="trash-file-label">{TEXT_FILE.name}</span>
        </button>
      </div>

      {openFile && (
        <div
          className="text-note-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenFile(null);
          }}
        >
          <div className="text-note">
            <div className="text-note-header">
              <span className="text-note-title">{openFile.name}</span>
              <button
                className="text-note-close"
                onClick={() => setOpenFile(null)}
                aria-label="Close note"
              >
                ×
              </button>
            </div>
            <pre className="text-note-body">{openFile.body}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashApp;
