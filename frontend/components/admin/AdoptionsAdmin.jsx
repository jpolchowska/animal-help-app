"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import styles from "./AdoptionsAdmin.module.css"

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

  async function handleDelete(id) {
    if (!confirm("Czy na pewno chcesz usunąć ten wniosek?")) return;

    await authFetch(`http://localhost:3001/adoptions/${id}`, {
      method: "DELETE"
    });

    setAdoptions(prev => prev.filter(a => a.id !== id));
  }

  return (
    <section>
      <div className={styles.Header}>
        <h2>Wnioski adopcyjne</h2>
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
              <div className={styles.decision}>
                {a.status === "Zaakceptowana" && (
                  <i className="fa-solid fa-circle-check" />
                )}
                {a.status === "Odrzucona" && (
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
      ))}
    </section>
  );
}