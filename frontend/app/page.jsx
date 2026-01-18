import AnimalCard from "./components/AnimalCard";
import styles from "./page.module.css";

async function getAnimals() {
  const response = await fetch("http://localhost:3001/animals");
  return response.json();
}

export default async function HomePage() {
  const animals = await getAnimals();

  return (
    <main className={styles.container}>
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