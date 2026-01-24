import styles from "@/styles/Header.module.css";
import Image from "next/image";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {/* <i className="fa-solid fa-paw" /> */}
        <Image
          src="/logo.svg"
          width={35}
          height={35}
          alt="Logo"
        />
        <span className={styles.title}>Animal Help App</span>
      </div>

      <div className={styles.right}>
        <i className="fa-solid fa-magnifying-glass" />
        <div className={styles.avatar}>J</div>
      </div>
    </header>
  );
}