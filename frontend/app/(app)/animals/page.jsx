"use client";

import { useEffect, useState } from "react";
import AnimalCard from "@/components/AnimalCard";
import { pluralizeAnimals } from "@/utils/pluralize";
import styles from "./page.module.css";

const categories = ["Wszystkie", "pies", "kot", "świnka morska", "chomik", "królik"];

export default function AnimalsPage() {
  const [animals, setAnimals] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetch("http://localhost:3001/animals")
      .then(res => res.json())
      .then(data => setAnimals(data));
  }, []);

  return (
    <>
      <div className={styles.filters}>
        <div className={styles.inputWrapper}>
          <i className="fa-solid fa-magnifying-glass" />
          <input
            placeholder="Szukaj zwierzęcia…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.selectWrapper}>
          <i className="fa-solid fa-folder" />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === "Wszystkie" ? "Wszystkie kategorie" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className={styles.listSection}>
        <div className={styles.listHeader}>
          <h2>Lista zwierząt</h2>
          <span className={styles.count}>
            {animals.length} {pluralizeAnimals(animals.length)}
          </span>
        </div>

        {animals.length === 0 ? (
          <p className={styles.empty}>
            Brak zgłoszonych zwierząt.
          </p>
        ) : (
          <div className={styles.grid}>
            {animals.map(animal => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}