import './ProjectsApp.css';
import { projects, desktopConfig } from '../../data/content';

const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const ProjectsApp = () => {
  return (
    <div className="projects-app">
      <div className="projects-header">
        <h2>{desktopConfig?.projectsApp?.heading || "Projects"}</h2>
        <p>{desktopConfig?.projectsApp?.subheading || "A selection of things I've built"}</p>
      </div>
      <div className="projects-grid">
        {projects.map((project) => (
          <a
            key={project.title}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card"
          >
            <div className="project-card-header">
              <h3>{project.title}</h3>
              <ExternalLinkIcon />
            </div>
            <p>{project.description}</p>
            <div className="project-tags">
              {project.tags.map((tag) => (
                <span key={tag} className="project-tag">{tag}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ProjectsApp;
