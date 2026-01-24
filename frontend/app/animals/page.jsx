"use client";

import { useEffect, useState } from "react";
import AnimalCard from "@/components/AnimalCard";
import styles from "./page.module.css";

export default function AnimalsPage() {
  const [animals, setAnimals] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/animals")
      .then(res => res.json())
      .then(data => setAnimals(data));
  }, []);

  return (
    <section className={styles.container}>
      <div className={styles.title}>
        <h2>Lista zwierząt</h2>
        <span className={styles.count}>
          {animals.length}{" "}
          {animals.length === 1 ? "zwierzę" : "zwierzęta"}
        </span>
      </div>

      <div className={styles.grid}>
        {animals.map(animal => (
          <AnimalCard key={animal.id} animal={animal} />
        ))}
      </div>
    </section>
  );
}