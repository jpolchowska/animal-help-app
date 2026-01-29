"use client";

import styles from "./profile.module.css";

export default function ProfilePage() {
  const auth = JSON.parse(localStorage.getItem("auth"));
  if (!auth) return null;

  const { name, email, role } = auth.user;

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        {/* GÓRA */}
        <div className={styles.header}>
          <div className={styles.avatar}>
            {name.charAt(0).toUpperCase()}
          </div>

          <h2 className={styles.name}>{name}</h2>
          <p className={styles.email}>{email}</p>

          <span className={`${styles.role} ${styles[role]}`}>
            {role}
          </span>
        </div>

        <div className={styles.divider} />

        <div className={styles.infoGrid}>
          <div>
            <span>Data utworzenia</span>
            <strong>—</strong>
          </div>

          <div>
            <span>Ostatnie logowanie</span>
            <strong>—</strong>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.logout}
            onClick={() => {
              localStorage.removeItem("auth");
              window.location.href = "/login";
            }}
          >
            Wyloguj się
          </button>
        </div>
      </div>
    </section>
  );
}