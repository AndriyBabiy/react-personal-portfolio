import { Fragment } from "react";
import { Link } from "react-router";
import styles from "./HeroStyles.module.css";
import sun from "../../assets/sun.svg";
import moon from "../../assets/moon.svg";
// import twitterLight from "../../assets/twitter-light.svg";
import emailLight from "../../assets/email-light.svg";
import emailDark from "../../assets/email-dark.svg";
import githubLight from "../../assets/github-light.svg";
import linkedinLight from "../../assets/linkedin-light.svg";
// import twitterDark from "../../assets/twitter-dark.svg";
import githubDark from "../../assets/github-dark.svg";
import linkedinDark from "../../assets/linkedin-dark.svg";
import { useTheme } from "../../common/ThemeContext";
import { siteConfig } from "../../data/content";
import { useStudioContent } from "../../desktop/hooks/useStudioContent";

function Hero() {
  const { theme, toggleTheme } = useTheme();
  const profile = useStudioContent("profile") || {};
  const roles = profile.roles || [];

  const themeIcon = theme === "light" ? sun : moon;
  const emailIcon = theme === "light" ? emailLight : emailDark;
  const githubIcon = theme === "light" ? githubLight : githubDark;
  const linkedinIcon = theme === "light" ? linkedinLight : linkedinDark;

  return (
    <section id="Hero" className={styles.container}>
      <div className={styles.colorModeContainer}>
        <img className={styles.hero} src={profile.profileImage} alt="Profile picture" />
        <img
          className={styles.colorMode}
          src={themeIcon}
          alt="Color mode icon"
          onClick={toggleTheme}
        />
      </div>
      <div className={styles.info}>
        <h1>
          {profile.firstName} <br /> {profile.lastName}
        </h1>
        <h2>
          {roles.map((role, i) => (
            <Fragment key={role}>
              {role}
              {i < roles.length - 1 && <br />}
            </Fragment>
          ))}
        </h2>
        <span>
          <a href={`mailto:${profile.email}`} target="_blank">
            <img src={emailIcon} alt="Email icon" />
          </a>
          <a href={profile.github} target="_blank">
            <img src={githubIcon} alt="Github icon" />
          </a>
          <a href={profile.linkedin} target="_blank">
            <img src={linkedinIcon} alt="Linkedin icon" />
          </a>
        </span>
        <p className={styles.description}>
          {profile.bio}
        </p>
        <div className={styles.actions}>
          <a href={profile.cvPath} target="_blank">
            <button className="hover">{siteConfig?.hero?.resumeButtonText || "Resume"}</button>
          </a>
          <Link to="/desktop" className={styles.desktopLink}>
            {siteConfig?.hero?.desktopLinkText || "Try the Desktop Experience \u2192"}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
