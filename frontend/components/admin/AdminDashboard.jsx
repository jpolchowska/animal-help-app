"use client";

import { useEffect, useState } from "react";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const [online, setOnline] = useState(0);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onmessage = event => {
      const data = JSON.parse(event.data);
      if (data.type === "ONLINE_USERS") {
        setOnline(data.count);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <section className={styles.container}>
      {/* HEADER jak w innych widokach */}
      <div className={styles.header}>
        <h2>Panel administratora</h2>
        <span className={styles.badge}>Admin</span>
      </div>

      {/* KARTY */}
      <div className={styles.grid}>
        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <span className={styles.label}>Użytkownicy online</span>
            <strong className={styles.value}>{online}</strong>
          </div>

          <div className={styles.icon}>
            <i className="fa-solid fa-users" />
          </div>
        </div>
      </div>
    </section>
  );
}