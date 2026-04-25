import styles from "./FooterStyles.module.css";
import { profile, siteConfig } from "../../data/content";

const Footer = () => {
  const year = new Date().getFullYear();
  const text = (siteConfig?.footer?.text || "\u00a9 {year} {name}")
    .replace("{year}", year)
    .replace("{name}", profile.name);

  return (
    <footer className={styles.container}>
      <p>{text}</p>
    </footer>
  );
};

export default Footer;
