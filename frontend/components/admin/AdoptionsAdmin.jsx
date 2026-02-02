"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import styles from "./AdoptionsAdmin.module.css"

export default function AdoptionsAdmin() {
  const [adoptions, setAdoptions] = useState([]);

  useEffect(() => {
    authFetch("http://localhost:3001/adoptions")
      .then(res => res.json())
      .then(setAdoptions);
  }, []);

  async function updateStatus(id, status) {
    await authFetch(`http://localhost:3001/adoptions/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });

    setAdoptions(prev =>
      prev.map(a => a.id === id ? { ...a, status } : a)
    );
  }

  return (
    <section>
      <div className={styles.Header}>
        <h2>Zgłoszenia adopcyjne</h2>
        <span className={styles.count}>
          {adoptions.length}
        </span>
      </div>

      {adoptions.map(a => (
        <div key={a.id} className={styles.card}>
          <div className={styles.left}>
            <div>
              <strong className={styles.name}>{a.animal_name}</strong>
              <p className={styles.email}>{a.email}</p>

              <span className={`${styles.status} ${styles[a.status]}`}>
                {a.status}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.approve}
              onClick={() => updateStatus(a.id, "approved")}
            >
              Akceptuj
            </button>

            <button
              className={styles.reject}
              onClick={() => updateStatus(a.id, "rejected")}
            >
              Odrzuć
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}