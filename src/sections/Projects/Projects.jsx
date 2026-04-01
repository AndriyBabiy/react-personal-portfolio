import styles from "./ProjectsStyles.module.css";
import { useTheme } from "../../common/ThemeContext";

const projects = [
  {
    title: "Study.ie",
    description:
      "EdTech platform for students in Ireland to find courses, compare colleges, and get AI-powered guidance.",
    tags: ["React", "Node.js", "AI"],
    link: "https://study.ie",
  },
  {
    title: "macOS Portfolio",
    description:
      "A creative portfolio built as a macOS-inspired operating system in the browser with draggable windows and a dock.",
    tags: ["React 19", "Vite", "CSS"],
    link: "https://github.com/AndriyBabiy/macOS-personal-portfolio",
  },
  {
    title: "Portfolio Site",
    description:
      "This clean, minimal portfolio site with dark/light mode toggle and responsive design.",
    tags: ["React", "CSS Modules", "Vite"],
    link: "https://github.com/AndriyBabiy/react-personal-portfolio",
  },
];

const Projects = () => {
  const { theme } = useTheme();

  return (
    <section id="projects" className={styles.container}>
      <h1 className={styles.sectionTitle}>Projects</h1>
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
