"use client";

import { useEffect, useRef, useState } from "react";
import { authFetch } from "@/utils/api";
import styles from "./Volunteer.module.css";
import { API_URL } from "@/utils/config";

function formatPolishDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const f = date.toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
  return f.charAt(0).toUpperCase() + f.slice(1);
}

export default function VolunteerTasks({ selectedDate, signedUpTaskIds = new Set() } = {}) {
  const [tasks,    setTasks]    = useState([]);
  const [signedUp, setSignedUp] = useState(new Set());
  const [loading,  setLoading]  = useState(new Set());
  const inFlight = useRef(new Set());

  useEffect(() => {
    authFetch(`${API_URL}/tasks`)
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []));
  }, []);

  async function signup(id) {
    if (inFlight.current.has(id) || signedUp.has(id)) return;
    inFlight.current.add(id);
    setLoading(prev => new Set(prev).add(id));
    try {
      const res = await authFetch(`${API_URL}/tasks/${id}/signup`, {
        method: "POST",
        body: JSON.stringify({ note: "" })
      });
      if (res.ok) {
        setSignedUp(prev => new Set(prev).add(id));
      }
    } finally {
      inFlight.current.delete(id);
      setLoading(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
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
            {(signedUpTaskIds.has(t.id) || signedUp.has(t.id)) ? (
              <button className={styles.btnSuccess} disabled>Zapisano</button>
            ) : (
              <button
                className={styles.btnPrimary}
                onClick={() => signup(t.id)}
                disabled={loading.has(t.id)}
              >
                {loading.has(t.id) ? "Zapisywanie…" : "Zapisz się"}
              </button>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
