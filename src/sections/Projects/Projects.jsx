import styles from "./ProjectsStyles.module.css";
import { useTheme } from "../../common/ThemeContext";
import { projects, siteConfig } from "../../data/content";

const Projects = () => {
  const { theme } = useTheme();

  return (
    <section id="projects" className={styles.container}>
      <h1 className={styles.sectionTitle}>{siteConfig?.projects?.sectionTitle || "Projects"}</h1>
      <div className={styles.grid}>
        {projects.map((project) => (
          <a
            key={project.title}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <div className={styles.cardContent}>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className={styles.tags}>
                {project.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <svg
              className={styles.arrow}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={theme === "light" ? "#555" : "#bbb"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
        ))}
      </div>
    </section>
  );
};

export default Projects;
