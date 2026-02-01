"use client";

import styles from "@/styles/AnimalCard.module.css";
import { authFetch, getAuth } from "@/utils/api";

export default function AnimalCard({ animal, onDelete, onStatusChange }) {
  const auth = getAuth();
  const isAdmin = auth?.user?.role === "admin";

  return (
    <div className={styles.card}>
      {isAdmin && (
        <div className={styles.cardActions}>
          <i
            className="fa-solid fa-pen"
            title="Zmień status"
            onClick={e => {
              e.stopPropagation();
              onStatusChange(animal.id);
            }}
          />
          <i
            className="fa-solid fa-trash"
            title="Usuń"
            onClick={e => {
              e.stopPropagation();
              onDelete(animal.id);
            }}
          />
        </div>
      )}

      <div className={styles.photo}>
        <img
          src={`http://localhost:3001${animal.image}`}
          alt={animal.name}
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{animal.name}</h3>
        <div className={styles.meta}>
          <span>Typ: {animal.type}</span>
          <span>Status: {animal.status}</span>
        </div>
      </div>
    </div>
  );
}