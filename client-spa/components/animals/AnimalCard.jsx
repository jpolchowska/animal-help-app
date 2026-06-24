"use client";

import styles from "./AnimalCard.module.css";
import { getAuth } from "@/utils/api";
import { useRouter } from "next/navigation";
import { API_URL } from "@/utils/config";

export default function AnimalCard({ animal, onDelete, onStatusChange }) {
  const router = useRouter();
  const auth = getAuth();
  const role = auth?.user?.role;

  const isAdmin = role === "admin";

  return (
    <div className={styles.card} onClick={() => router.push(`/animals/${animal.id}`)} style={{ cursor: "pointer" }}>
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
          src={`${API_URL}${animal.image}`}
          alt={animal.name}
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{animal.name}</h3>

        <div className={styles.footer}>
          <div className={styles.meta}>
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

        </div>
      </div>
    </div>
  );
}