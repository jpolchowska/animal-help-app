"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import styles from "./AdoptionsAdmin.module.css";

const statusClassMap = {
  "W oczekiwaniu": "pending",
  "Zaakceptowany": "approved",
  "Odrzucony": "rejected"
};

export default function AdoptionsAdmin() {
  const [adoptions, setAdoptions] = useState([]);

  useEffect(() => {
    authFetch("http://localhost:3001/adoptions")
      .then(res => res.json())
      .then(data => setAdoptions(Array.isArray(data) ? data : []));
  }, []);

  async function updateStatus(id, status) {
    await authFetch(`http://localhost:3001/adoptions/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });

    setAdoptions(prev =>
      prev.map(a => (a.id === id ? { ...a, status } : a))
    );
  }

  async function handleDelete(id) {
    if (!confirm("Czy na pewno chcesz usunąć ten wniosek?")) return;

    await authFetch(`http://localhost:3001/adoptions/${id}`, {
      method: "DELETE"
    });

    setAdoptions(prev => prev.filter(a => a.id !== id));
  }

  const pending = adoptions.filter(a => a.status === "W oczekiwaniu");
  const approved = adoptions.filter(a => a.status === "Zaakceptowany");
  const rejected = adoptions.filter(a => a.status === "Odrzucony");

  function renderCard(a) {
    return (
      <div key={a.id} className={styles.card}>
        <div className={styles.left}>
          <img
            src={`http://localhost:3001${a.animal_image}`}
            alt={a.animal_name}
            className={styles.avatar}
          />

          <div>
            <strong className={styles.name}>{a.animal_name}</strong>
            <p className={styles.email}>{a.email}</p>
            <span className={styles.date}>
              Złożono: {new Date(a.created_at).toLocaleDateString()}
            </span>

            <span className={`${styles.status} ${styles[statusClassMap[a.status]]}`}>
              {a.status}
            </span>
          </div>
        </div>

        <div className={styles.right}>
          {a.status === "W oczekiwaniu" ? (
            <div className={styles.actions}>
              <button
                className={styles.approve}
                onClick={() => updateStatus(a.id, "Zaakceptowany")}
              >
                Akceptuj
              </button>

              <button
                className={styles.reject}
                onClick={() => updateStatus(a.id, "Odrzucony")}
              >
                Odrzuć
              </button>
            </div>
          ) : (
            <div
              className={`${styles.decision} ${
                a.status === "Zaakceptowany" ? styles.success : styles.error
              }`}
            >
              {a.status === "Zaakceptowany" && (
                <i className="fa-solid fa-circle-check" />
              )}
              {a.status === "Odrzucony" && (
                <i className="fa-solid fa-circle-xmark" />
              )}
            </div>
          )}

          <i
            className={`fa-solid fa-xmark ${styles.delete}`}
            title="Usuń wniosek"
            onClick={() => handleDelete(a.id)}
          />
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className={styles.Header}>
        <h2>Wnioski adopcyjne</h2>
        <span className={styles.count}>{adoptions.length}</span>
      </div>

      <div className={styles.columns}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h3>W oczekiwaniu</h3>
            <span className={styles.count}>{pending.length}</span>
          </div>
          {pending.map(renderCard)}
        </div>

        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h3>Zaakceptowane</h3>
            <span className={styles.count}>{approved.length}</span>
          </div>
          {approved.map(renderCard)}
        </div>

        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h3>Odrzucone</h3>
            <span className={styles.count}>{rejected.length}</span>
          </div>
          {rejected.map(renderCard)}
        </div>
      </div>
    </section>
  );
}