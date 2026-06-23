"use client";

import AddAnimalForm from "./AddAnimalForm";
import styles from "./AddAnimalModal.module.css";

export default function AddAnimalModal({ onClose, onAdd }) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>
          ✕
        </button>

        <AddAnimalForm onAdd={onAdd} onClose={onClose} />
      </div>
    </div>
  );
}