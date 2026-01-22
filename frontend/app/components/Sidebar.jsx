import Link from "next/link";
import styles from "./Sidebar.module.css";

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`${styles.sidebar} ${
        collapsed ? styles.collapsed : ""
      }`}
    >
      <button
        className={styles.sidebarToggle}
        onClick={onToggle}
      >
        <i
          className={`fa-solid ${
            collapsed ? "fa-angle-right" : "fa-angle-left"
          }`}
        />
      </button>

      <div className={styles.sidebarTop}>
        <i className="fa-solid fa-graduation-cap fa-2x" />

        <div
          className={`${styles.sidebarTitle} ${
            collapsed ? styles.hidden : ""
          }`}
        >
          Quiz Platform
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        <Link href="/" className={styles.sidebarItem}>
          <i className="fa-solid fa-house fa-xl" />
          {!collapsed && (
            <span className={styles.sidebarLabel}>Dashboard</span>
          )}
        </Link>

        <Link href="/search" className={styles.sidebarItem}>
          <i className="fa-solid fa-magnifying-glass fa-xl" />
          {!collapsed && (
            <span className={styles.sidebarLabel}>Search</span>
          )}
        </Link>

        <Link href="/editor" className={styles.sidebarItem}>
          <i className="fa-solid fa-pen-to-square fa-xl" />
          {!collapsed && (
            <span className={styles.sidebarLabel}>Editor</span>
          )}
        </Link>

        <Link href="/profile" className={styles.sidebarItem}>
          <i className="fa-solid fa-circle-user fa-xl" />
          {!collapsed && (
            <span className={styles.sidebarLabel}>Profile</span>
          )}
        </Link>
      </nav>
    </aside>
  );
}