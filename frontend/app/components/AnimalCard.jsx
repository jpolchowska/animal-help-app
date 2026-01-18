import styles from "./AnimalCard.module.css";

export default function AnimalCard({ animal }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.name}>{animal.name}</h3>
      <p className={styles.meta}>Typ: {animal.type}</p>
      <p className={styles.meta}>Status: {animal.status}</p>
    </div>
  );
}