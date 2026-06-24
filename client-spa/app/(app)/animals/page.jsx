"use client";

import { useEffect, useState } from "react";
import AnimalCard from "@/components/animals/AnimalCard";
import { pluralizeAnimals } from "@/utils/pluralize";
import styles from "./page.module.css";
import { authFetch, getAuth } from "@/utils/api";
import AddAnimalModal from "@/components/animals/AddAnimalModal";
import { API_URL } from "@/utils/config";

const categories = ["Wszystkie", "pies", "kot"];

const statuses = [
  "Wszystkie",
  "Do adopcji",
  "W trakcie leczenia",
  "Zaadoptowane"
];

const STATUS_OPTIONS = ["Do adopcji", "W trakcie leczenia", "Adoptowane"];

export default function AnimalsPage() {
  const [animals, setAnimals] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Wszystkie");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState("Wszystkie");
  const [statusModal, setStatusModal] = useState(null);
  const [pendingStatus, setPendingStatus] = useState("Do adopcji");

  async function handleDelete(id) {
    if (!confirm("Czy na pewno chcesz usunąć to zwierzę?")) return;
    const res = await authFetch(`${API_URL}/animals/${id}`, { method: "DELETE" });
    if (res.ok) setAnimals(prev => prev.filter(a => a.id !== id));
  }

  async function handleStatusChange() {
    const res = await authFetch(`${API_URL}/animals/${statusModal}`, {
      method: "PUT",
      body: JSON.stringify({ status: pendingStatus }),
    });
    if (res.ok) {
      setAnimals(prev => prev.map(a => a.id === statusModal ? { ...a, status: pendingStatus } : a));
      setStatusModal(null);
    }
  }

  function openStatusModal(id) {
    const animal = animals.find(a => a.id === id);
    setPendingStatus(animal?.status || "Do adopcji");
    setStatusModal(id);
  }

  useEffect(() => {
    setIsMounted(true);
    const auth = getAuth();
    if (auth?.user?.role === "admin") setIsAdmin(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    if (category !== "Wszystkie") params.append("type", category);
    if (status !== "Wszystkie") params.append("status", status);

    fetch(`${API_URL}/animals?${params.toString()}`)
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
          <i className={`${styles.chevron} fa-solid fa-chevron-down`} />
        </div>

        {isMounted && isAdmin && (
          <button
            className={styles.addButton}
            onClick={() => setShowAddForm(true)}
          >
            <i className="fa-solid fa-plus" />
            Dodaj zwierzę
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

      {statusModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setStatusModal(null)}
        >
          <div
            style={{
              background: "#fff", borderRadius: "12px", padding: "28px 32px",
              minWidth: "320px", boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 600 }}>
              Zmień status zwierzęcia
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {STATUS_OPTIONS.map(opt => (
                <label
                  key={opt}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    cursor: "pointer", padding: "10px 14px", borderRadius: "8px",
                    border: `2px solid ${pendingStatus === opt ? "#4a7c59" : "#e5e7eb"}`,
                    background: pendingStatus === opt ? "rgba(74,124,89,0.06)" : "#fff",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt}
                    checked={pendingStatus === opt}
                    onChange={() => setPendingStatus(opt)}
                    style={{ accentColor: "#4a7c59" }}
                  />
                  {opt}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setStatusModal(null)}
                style={{
                  padding: "8px 18px", borderRadius: "8px", border: "1.5px solid #e5e7eb",
                  background: "#fff", cursor: "pointer", fontWeight: 500,
                }}
              >
                Anuluj
              </button>
              <button
                onClick={handleStatusChange}
                style={{
                  padding: "8px 18px", borderRadius: "8px", border: "none",
                  background: "#4a7c59", color: "#fff", cursor: "pointer", fontWeight: 500,
                }}
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
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
              <AnimalCard
                key={animal.id}
                animal={animal}
                onDelete={handleDelete}
                onStatusChange={openStatusModal}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
