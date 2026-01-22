"use client";

import { useEffect, useState } from "react";
import AnimalCard from "./components/AnimalCard";
import styles from "./page.module.css";
import Sidebar from "./components/Sidebar";

// async function getAnimals() {
//   const response = await fetch("http://localhost:3001/animals");
//   return response.json();
// }

export default function HomePage() {
  const [animals, setAnimals] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/animals")
      .then(res => res.json())
      .then(data => setAnimals(data));
  }, []);

  return (
    <main className={styles.container}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />

      <div className={styles.title}>
        <h2 >Lista zwierząt</h2>
        <span className={styles.count}>
            {animals.length} {animals.length === 1 ? "zwierzę" : "zwierzęta"}
        </span>
      </div>
      
      {animals.map((animal) => (
        <AnimalCard key={animal.id} animal={animal} />
      ))}
    </main>
  );
}