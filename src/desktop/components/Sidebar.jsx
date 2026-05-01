import './Sidebar.css';

const DockIcon = ({ icon, color, iconPath, name }) => {
  if (iconPath) {
    return (
      <div className={`dock-icon-bg dock-icon-image dock-icon-${icon}`}>
        <img src={iconPath} alt={name || icon} draggable={false} />
      </div>
    );
  }
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
    blog: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z" />
        <path d="M4 4v13a3 3 0 0 0 3 3" opacity="0" />
        <line x1="8" y1="9" x2="15" y2="9" />
        <line x1="8" y1="13" x2="15" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
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
    studio: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z" />
      </svg>
    ),
    browser: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
      </svg>
    ),
    launchpad: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="5" height="5" rx="1.2" fill="#FF3B30" />
        <rect x="9.5" y="3" width="5" height="5" rx="1.2" fill="#FF9500" />
        <rect x="16" y="3" width="5" height="5" rx="1.2" fill="#FFCC00" />
        <rect x="3" y="9.5" width="5" height="5" rx="1.2" fill="#34C759" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="1.2" fill="#5AC8FA" />
        <rect x="16" y="9.5" width="5" height="5" rx="1.2" fill="#007AFF" />
        <rect x="3" y="16" width="5" height="5" rx="1.2" fill="#5856D6" />
        <rect x="9.5" y="16" width="5" height="5" rx="1.2" fill="#AF52DE" />
        <rect x="16" y="16" width="5" height="5" rx="1.2" fill="#FF2D55" />
      </svg>
    ),
    trash: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path className="trash-lid" d="M3 6h18" />
        <path className="trash-lid" d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z" />
        <path d="M5.5 6.5l1 13a2 2 0 0 0 2 1.8h7a2 2 0 0 0 2-1.8l1-13" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    ),
  };

  return (
    <div className={`dock-icon-bg dock-icon-${icon}`} style={{ background: color }}>
      {icons[icon] || icons.projects}
    </div>
  );
};

const DEFAULT_DOCK = [
  { id: 'launchpad', name: 'Launchpad', color: 'linear-gradient(135deg, #3a3a3c, #1c1c1e)', action: 'launchpad' },
  { id: 'cv', name: 'CV', color: 'linear-gradient(135deg, #007AFF, #0051D5)' },
  { id: 'blog', name: 'Blog', color: 'linear-gradient(135deg, #FF9500, #C77700)' },
  { id: 'projects', name: 'Projects', color: 'linear-gradient(135deg, #34C759, #248A3D)' },
  { id: 'about', name: 'About', color: 'linear-gradient(135deg, #5856D6, #3634A3)' },
  { id: 'contact', name: 'Contact', color: 'linear-gradient(135deg, #34AADC, #0A84FF)' },
  { id: 'trash', name: 'Trash', color: 'linear-gradient(135deg, #8e8e93, #48484a)' },
];

const renderDockButton = ({ app, openWindowIds, minimizedWindowIds, onClick, extraClass = '' }) => {
  const targetId = app.target || app.id;
  const isOpen = openWindowIds.includes(targetId) && app.action !== 'launchpad';
  const isMinimized = minimizedWindowIds.includes(targetId);
  const trashClass = app.id === 'trash' ? 'dock-item-trash' : '';
  return (
    <button
      key={app.id}
      className={`dock-item ${trashClass} ${extraClass}`.trim()}
      onClick={onClick}
      aria-label={`Open ${app.name}`}
    >
      <DockIcon icon={app.icon || app.id} color={app.color} iconPath={app.iconPath} name={app.name} />
      <span className="dock-label">{app.name}</span>
      {isOpen && (
        <span className={`dock-active-dot ${isMinimized ? 'minimized' : ''}`} />
      )}
    </button>
  );
};

const Sidebar = ({
  onAppClick,
  onLaunchpadOpen,
  openWindowIds = [],
  minimizedWindowIds = [],
  desktopConfig,
  runningApps = [],
}) => {
  const dockConfig = desktopConfig?.dock || DEFAULT_DOCK;
  const trashApp = dockConfig.find((app) => app.id === 'trash');
  const pinnedApps = dockConfig.filter((app) => app.id !== 'trash');

  const handlePinnedClick = (app) => {
    if (app.action === 'launchpad') {
      onLaunchpadOpen?.();
      return;
    }
    if (app.target) {
      onAppClick({ id: app.target, name: app.name });
      return;
    }
    onAppClick(app);
  };

  const handleRunningClick = (app) => {
    onAppClick({ id: app.id, name: app.name });
  };

  return (
    <div className="dock-container">
      <div className="dock" role="toolbar" aria-label="Dock">
        <div className="dock-region dock-region-pinned" role="group" aria-label="Pinned apps">
          {pinnedApps.map((app) =>
            renderDockButton({
              app,
              openWindowIds,
              minimizedWindowIds,
              onClick: () => handlePinnedClick(app),
            })
          )}
        </div>
        {runningApps.length > 0 && (
          <>
            <div className="dock-divider" aria-hidden="true" />
            <div className="dock-region dock-region-running" role="group" aria-label="Running apps">
              {runningApps.map((app) =>
                renderDockButton({
                  app,
                  openWindowIds,
                  minimizedWindowIds,
                  onClick: () => handleRunningClick(app),
                  extraClass: 'dock-item-running',
                })
              )}
            </div>
          </>
        )}
        {trashApp && (
          <>
            <div className="dock-divider" aria-hidden="true" />
            <div className="dock-region dock-region-trash" role="group" aria-label="Trash">
              {renderDockButton({
                app: trashApp,
                openWindowIds,
                minimizedWindowIds,
                onClick: () => handlePinnedClick(trashApp),
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
