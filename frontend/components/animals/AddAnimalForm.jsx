"use client";

import { useState } from "react";
import { authFetch } from "@/utils/api";
import styles from "./AddAnimalForm.module.css";

export default function AddAnimalForm({ onAdd, onClose }) {
  const [form, setForm] = useState({
    name: "",
    type: "",
    status: "Do adopcji"
  });

  const [file, setFile] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      alert("Dodaj zdjęcie zwierzęcia");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("type", form.type);
    formData.append("status", form.status);
    formData.append("image", file);

    const res = await authFetch(
      "http://localhost:3001/animals",
      {
        method: "POST",
        body: formData,
        isFormData: true
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Błąd backendu:", err);
      alert("Błąd dodawania zwierzęcia (zobacz konsolę)");
      return;
    }

    const data = await res.json();

    onAdd(data);
    onClose()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Dodaj zwierzę</h3>

      <input
        placeholder="Imię"
        required
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Typ (pies, kot...)"
        required
        value={form.type}
        onChange={e => setForm({ ...form, type: e.target.value })}
      />

      <label className={styles.fileUpload}>
        <input
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files[0])}
          hidden
        />
        <i className="fa-solid fa-image" />
        <span>
          {file ? file.name : "Wybierz zdjęcie"}
        </span>
      </label>

      <select
        value={form.status}
        onChange={e => setForm({ ...form, status: e.target.value })}
      >
        <option>Do adopcji</option>
        <option>W trakcie leczenia</option>
        <option>Adoptowane</option>
      </select>

      <button>Dodaj zwierzę</button>
    </form>
  );
}