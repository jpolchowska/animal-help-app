"use client";

import { useState, useEffect } from "react";

import styles from "./profile.module.css";

function formatDate(date) {
  if (!date) return "—";

  return new Date(date + "Z").toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function ProfilePage() {
  const [auth, setAuth] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      setAuth(JSON.parse(stored));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    function syncAuth() {
      const stored = localStorage.getItem("auth");
      if (stored) {
        setAuth(JSON.parse(stored));
      }
    }

    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-changed", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, []);

  if (!mounted || !auth) return null;

  const { name, email, role, createdAt, lastLoginAt } = auth.user;

  return (
    <section className={styles.container}>
      <div className={styles.card}>
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
            <strong>{formatDate(createdAt)}</strong>
          </div>

          <div>
            <span>Ostatnie logowanie</span>
            <strong>{formatDate(lastLoginAt)}</strong>
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