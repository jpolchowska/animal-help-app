"use client";

import styles from "./AnimalCard.module.css";
import { authFetch, getAuth } from "@/utils/api";

export default function AnimalCard({ animal, onDelete, onStatusChange }) {
  const auth = getAuth();
  const role = auth?.user?.role;

  const isAdmin = role === "admin";
  const canAdopt = role === "user" || role === "volunteer";

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

        <div className={styles.footer}>
          <div className={styles.meta}>
            {/* <div className={styles.type}>
              {animal.type.toUpperCase()}
            </div> */}

            <span
              className={`${styles.status} ${
                animal.status === "Do adopcji"
                  ? styles.available
                  : animal.status === "W trakcie leczenia"
                  ? styles.treatment
                  : styles.adopted
              }`}
            >
              {animal.status}
            </span>
          </div>

          {canAdopt && animal.status === "Do adopcji" && (
            <button
              className={styles.adoptButton}
              onClick={async e => {
                e.stopPropagation();

                await authFetch("http://localhost:3001/adoptions", {
                  method: "POST",
                  body: JSON.stringify({ animalId: animal.id })
                });

                alert("Zgłoszono adopcję");
              }}
            >
              Adoptuj
            </button>
          )}
        </div>
      </div>
    </div>
  );
}