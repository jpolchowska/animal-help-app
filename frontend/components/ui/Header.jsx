import styles from "@/styles/Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <i className="fa-solid fa-paw" />
        <span className={styles.title}>Animal Help App</span>
      </div>

      <div className={styles.right}>
        <i className="fa-solid fa-magnifying-glass" />
        <div className={styles.avatar}>J</div>
      </div>
    </header>
  );
}