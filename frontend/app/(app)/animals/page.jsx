"use client";

import { useEffect, useState } from "react";
import AnimalCard from "@/components/animals/AnimalCard";
import { pluralizeAnimals } from "@/utils/pluralize";
import styles from "./page.module.css";
import { authFetch } from "@/utils/api";
import AddAnimalModal from "@/components/animals/AddAnimalModal";

const categories = ["Wszystkie", "pies", "kot"];

const statuses = [
  "Wszystkie",
  "Do adopcji",
  "W trakcie leczenia",
  "Zaadoptowane"
];

export default function AnimalsPage() {
  const [animals, setAnimals] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Wszystkie");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState("Wszystkie");

  async function handleDelete(id) {
    if (!confirm("Czy na pewno chcesz usunąć to zwierzę?")) return;

    const res = await authFetch(
      `http://localhost:3001/animals/${id}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setAnimals(prev => prev.filter(a => a.id !== id));
    }
  }

  async function handleStatusChange(id) {
    const status = prompt(
      "Nowy status:\nDo adopcji\nW trakcie leczenia\nAdoptowane"
    );

    if (!status) return;

    const res = await authFetch(
      `http://localhost:3001/animals/${id}`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      }
    );

    if (res.ok) {
      setAnimals(prev =>
        prev.map(a =>
          a.id === id ? { ...a, status } : a
        )
      );
    }
  }

  useEffect(() => {
    setIsMounted(true);

    const auth = JSON.parse(localStorage.getItem("auth"));
    if (auth?.user?.role === "admin") {
      setIsAdmin(true);
    }
  }, []);

  // useEffect(() => {
  //   fetch("http://localhost:3001/animals")
  //     .then(res => res.json())
  //     .then(data => setAnimals(data));
  // }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (query) params.append("search", query);
    if (category !== "Wszystkie") params.append("type", category);
    if (status !== "Wszystkie") params.append("status", status);

    fetch(`http://localhost:3001/animals?${params.toString()}`)
      .then(res => res.json())
      .then(data => setAnimals(data));
  }, [query, category, status]);

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

        <div className={styles.selectWrapper}>
          <i className="fa-solid fa-heart-pulse" />
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {statuses.map(s => (
              <option key={s} value={s}>
                {s === "Wszystkie" ? "Wszystkie statusy" : s}
              </option>
            ))}
          </select>
        </div>

        {isMounted && isAdmin && (
          <button
            className={styles.addButton}
            onClick={() => setShowAddForm(true)}
          >
            + Dodaj zwierzę
          </button>
        )}
      </div>

      {showAddForm && (
        <AddAnimalModal
          onClose={() => setShowAddForm(false)}
          onAdd={animal => {
            setAnimals(prev => [...prev, animal]);
            setShowAddForm(false);
          }}
        />
      )}

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
              <AnimalCard key={animal.id} animal={animal} onDelete={handleDelete} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}