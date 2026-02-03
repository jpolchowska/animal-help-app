"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import styles from "./Volunteer.module.css";

export default function MyTasks() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    authFetch("http://localhost:3001/signups/my")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
        setLoaded(true);
      })
      .catch(() => {
        setItems([]);
        setLoaded(true);
      });
  }, []);

  if (!loaded) return null;

  return (
    <section>
      <div className={styles.header}>
        <h2>Moje zadania</h2>
      </div>

      {items.map(i => (
        <div key={i.id} className={styles.card}>
          <span>{i.title}</span>
          <button
            className={styles.danger}
            onClick={() =>
              authFetch(`http://localhost:3001/signups/${i.id}`, {
                method: "DELETE"
              })
            }
          >
            Wypisz się
          </button>
        </div>
      ))}
    </section>
  );
}