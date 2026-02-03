"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import styles from "./Volunteer.module.css";

export default function VolunteerTasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    authFetch("http://localhost:3001/tasks")
      .then(res => res.json())
      .then(setTasks);
  }, []);

  function signup(id) {
    authFetch(`http://localhost:3001/tasks/${id}/signup`, {
      method: "POST",
      body: JSON.stringify({ note: "" })
    });
  }

  return (
    <section className={styles.heigher}>
      <div className={styles.header}>
        <h2>Dostepne zadania</h2>
      </div>

      {tasks.map(t => (
        <div key={t.id} className={styles.card}>
          <strong>{t.title}</strong>
          <p>{t.description}</p>
          <button onClick={() => signup(t.id)} className={styles.primary}>Zapisz się</button>
        </div>
      ))}
    </section>
  );
}