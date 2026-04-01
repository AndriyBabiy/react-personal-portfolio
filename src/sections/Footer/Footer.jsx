import styles from "./FooterStyles.module.css";

const Footer = () => {
  return (
    <footer className={styles.container}>
      <p>&copy; {new Date().getFullYear()} Andriy Babiy</p>
    </footer>
  );
};

export default Footer;
