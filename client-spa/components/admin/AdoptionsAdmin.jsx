"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import styles from "./AdoptionsAdmin.module.css";
import { API_URL } from "@/utils/config";

const statusClassMap = {
  "W oczekiwaniu": "pending",
  "Zaakceptowany": "approved",
  "Odrzucony":     "rejected"
};

export default function AdoptionsAdmin() {
  const [adoptions, setAdoptions] = useState([]);

  useEffect(() => {
    authFetch(`${API_URL}/adoptions`)
      .then(res => res.json())
      .then(data => setAdoptions(Array.isArray(data) ? data : []));
  }, []);

  async function updateStatus(id, status) {
    await authFetch(`${API_URL}/adoptions/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    setAdoptions(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));
  }

  async function handleDelete(id) {
    if (!confirm("Czy na pewno chcesz usunąć ten wniosek?")) return;
    await authFetch(`${API_URL}/adoptions/${id}`, { method: "DELETE" });
    setAdoptions(prev => prev.filter(a => a.id !== id));
  }

  const pending  = adoptions.filter(a => a.status === "W oczekiwaniu");
  const approved = adoptions.filter(a => a.status === "Zaakceptowany");
  const rejected = adoptions.filter(a => a.status === "Odrzucony");

  function renderCard(a) {
    return (
      <div key={a.id} className={styles.card}>
        <div className={styles.left}>
          <img
            src={`${API_URL}${a.animal_image}`}
            alt={a.animal_name}
            className={styles.avatar}
          />
          <div className={styles.info}>
            <strong className={styles.name}>{a.animal_name}</strong>
            <p className={styles.email}>{a.email}</p>
            <span className={styles.date}>Złożono: {new Date(a.created_at).toLocaleDateString("pl-PL")}</span>
            <span className={`${styles.status} ${styles[statusClassMap[a.status]]}`}>
              {a.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className={styles.right}>
          {a.status === "W oczekiwaniu" ? (
            <div className={styles.actions}>
              <button className={styles.approve} onClick={() => updateStatus(a.id, "Zaakceptowany")}>Akceptuj</button>
              <button className={styles.reject}  onClick={() => updateStatus(a.id, "Odrzucony")}>Odrzuć</button>
            </div>
          ) : (
            <div className={`${styles.decision} ${a.status === "Zaakceptowany" ? styles.success : styles.error}`}>
              <i className={`fa-solid ${a.status === "Zaakceptowany" ? "fa-circle-check" : "fa-circle-xmark"}`} />
            </div>
          )}
          <i className={`fa-solid fa-xmark ${styles.delete}`} title="Usuń wniosek" onClick={() => handleDelete(a.id)} />
        </div>
      </div>
    );
  }

  return (
    <section className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Wnioski adopcyjne</h2>
          <p className={styles.pageSubtitle}>Zarządzaj zgłoszeniami adopcyjnymi i monitoruj ich status.</p>
        </div>
        <span className={styles.totalBadge}>
          <i className="fa-solid fa-paw" />
          {adoptions.length} zgłoszeń
        </span>
      </div>

      {/* ── Columns ── */}
      <div className={styles.columns}>

        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitle}>
              <span className={`${styles.dot} ${styles.dotPending}`} />
              W OCZEKIWANIU
            </div>
            <span className={`${styles.colCount} ${styles.colCountPending}`}>{pending.length}</span>
          </div>
          {pending.map(renderCard)}
        </div>

        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitle}>
              <span className={`${styles.dot} ${styles.dotApproved}`} />
              ZAAKCEPTOWANE
            </div>
            <span className={`${styles.colCount} ${styles.colCountApproved}`}>{approved.length}</span>
          </div>
          {approved.map(renderCard)}
        </div>

        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <div className={styles.columnTitle}>
              <span className={`${styles.dot} ${styles.dotRejected}`} />
              ODRZUCONE
            </div>
            <span className={`${styles.colCount} ${styles.colCountRejected}`}>{rejected.length}</span>
          </div>
          {rejected.map(renderCard)}
        </div>

      </div>
    </section>
  );
}
