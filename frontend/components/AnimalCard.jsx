import styles from "@/styles/AnimalCard.module.css";

export default function AnimalCard({ animal }) {
  return (
    <div className={styles.card}>
      <div className={styles.photo}>
        <img
          src={animal.image}
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