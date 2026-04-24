import './Sidebar.css';

const DockIcon = ({ icon, color }) => {
  const icons = {
    cv: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    video: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    projects: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    about: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    contact: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    studyie: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  };

  return (
    <div className="dock-icon-bg" style={{ background: color }}>
      {icons[icon]}
    </div>
  );
};

const DEFAULT_DOCK = [
  { id: 'cv', name: 'CV', color: 'linear-gradient(135deg, #007AFF, #0051D5)' },
  { id: 'video', name: 'Video', color: 'linear-gradient(135deg, #FF3B30, #D42A20)' },
  { id: 'projects', name: 'Projects', color: 'linear-gradient(135deg, #34C759, #248A3D)' },
  { id: 'about', name: 'About', color: 'linear-gradient(135deg, #5856D6, #3634A3)' },
  { id: 'contact', name: 'Contact', color: 'linear-gradient(135deg, #FF9500, #C77700)' },
  { id: 'studyie', name: 'Study.ie', color: 'linear-gradient(135deg, #AF52DE, #8944AB)', externalUrl: 'https://study.ie' },
];

const Sidebar = ({ onAppClick, openWindowIds = [], desktopConfig }) => {
  const apps = (desktopConfig?.dock || DEFAULT_DOCK).map((app) => ({
    ...app,
    icon: app.id,
  }));

  return (
    <div className="dock-container">
      <div className="dock">
        {apps.map((app) => (
          <button
            key={app.id}
            className="dock-item"
            onClick={() => onAppClick(app)}
            aria-label={`Open ${app.name}`}
          >
            <DockIcon icon={app.icon} color={app.color} />
            <span className="dock-label">{app.name}</span>
            {openWindowIds.includes(app.id) && (
              <span className="dock-active-dot" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
