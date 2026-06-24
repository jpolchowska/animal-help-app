"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import styles from "./Volunteer.module.css";
import { API_URL } from "@/utils/config";

function formatPolishDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const f = date.toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
  return f.charAt(0).toUpperCase() + f.slice(1);
}

export default function MyTasks() {
  const [items,  setItems]  = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    authFetch(`${API_URL}/signups/my`)
      .then(res => res.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoaded(true); })
      .catch(() => { setItems([]); setLoaded(true); });
  }, []);

  function unsignup(id) {
    authFetch(`${API_URL}/signups/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  if (!loaded) return null;

  return (
    <section style={{ marginTop: "28px" }}>
      <p className={styles.sectionHeading}>Moje zadania</p>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="fa-regular fa-calendar-xmark" />
          <p>Nie zapisałeś się jeszcze na żadne zadanie</p>
        </div>
      ) : items.map(i => (
        <div key={i.id} className={styles.card}>
          <div className={styles.cardBody}>
            <p className={styles.cardTitle}>{i.title}</p>
            {i.description && <p className={styles.cardDesc}>{i.description}</p>}
            <div className={styles.cardMeta}>
              {i.date      && <span className={styles.dateBadge}>{formatPolishDate(i.date)}</span>}
              {i.time_from && <span className={styles.timeBadge}>{i.time_from}–{i.time_to}</span>}
            </div>
          </div>
          <div className={styles.cardActions}>
            <button className={styles.btnDanger} onClick={() => unsignup(i.id)}>Wypisz się</button>
          </div>
        </div>
      ))}
    </section>
  );
}
