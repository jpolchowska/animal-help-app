"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import styles from "./Volunteer.module.css";

function formatPolishDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const f = date.toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
  return f.charAt(0).toUpperCase() + f.slice(1);
}

export default function VolunteerTasks({ selectedDate } = {}) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    authFetch("http://localhost:3001/tasks")
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []));
  }, []);

  function signup(id) {
    authFetch(`http://localhost:3001/tasks/${id}/signup`, {
      method: "POST",
      body: JSON.stringify({ note: "" })
    });
  }

  const visible = selectedDate ? tasks.filter(t => t.date === selectedDate) : tasks;

  return (
    <section>
      <p className={styles.sectionHeading}>
        {selectedDate ? `Zadania: ${formatPolishDate(selectedDate)}` : "Dostępne zadania"}
      </p>

      {visible.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="fa-regular fa-calendar-xmark" />
          <p>Brak dostępnych zadań</p>
        </div>
      ) : visible.map(t => (
        <div key={t.id} className={styles.card}>
          <div className={styles.cardBody}>
            <p className={styles.cardTitle}>{t.title}</p>
            {t.description && <p className={styles.cardDesc}>{t.description}</p>}
            <div className={styles.cardMeta}>
              {t.date      && <span className={styles.dateBadge}>{formatPolishDate(t.date)}</span>}
              {t.time_from && <span className={styles.timeBadge}>{t.time_from}–{t.time_to}</span>}
            </div>
          </div>
          <div className={styles.cardActions}>
            <button className={styles.btnPrimary} onClick={() => signup(t.id)}>Zapisz się</button>
          </div>
        </div>
      ))}
    </section>
  );
}
