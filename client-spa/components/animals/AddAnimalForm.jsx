"use client";

import { useState } from "react";
import { authFetch } from "@/utils/api";
import styles from "./AddAnimalForm.module.css";
import { API_URL } from "@/utils/config";

const TRAIT_OPTIONS = [
  "Łagodny", "Towarzyski", "Spokojny", "Ciekawy", "Delikatny",
  "Niezależny", "Energiczny", "Wesoły", "Czuły", "Aktywny",
  "Przyjazny", "Radosny", "Nieśmiały",
];

export default function AddAnimalForm({ onAdd, onClose }) {
  const [form, setForm] = useState({
    name: "",
    type: "",
    status: "Do adopcji",
    age: "",
    sex: "",
    description: "",
  });
  const [traits, setTraits] = useState([]);
  const [file, setFile] = useState(null);

  function toggleTrait(trait) {
    setTraits(prev =>
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    );
  }

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
    if (form.age) formData.append("age", form.age);
    if (form.sex) formData.append("sex", form.sex);
    if (form.description) formData.append("description", form.description);
    if (traits.length > 0) formData.append("traits", JSON.stringify(traits));

    const res = await authFetch(`${API_URL}/animals`, {
      method: "POST",
      body: formData,
      isFormData: true,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Błąd backendu:", err);
      alert("Błąd dodawania zwierzęcia (zobacz konsolę)");
      return;
    }

    const data = await res.json();
    onAdd(data);
    onClose();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Dodaj zwierzę</h3>

      <input
        placeholder="Imię *"
        required
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Typ (pies, kot…) *"
        required
        value={form.type}
        onChange={e => setForm({ ...form, type: e.target.value })}
      />

      <div className={styles.row}>
        <input
          placeholder="Wiek (np. 2 lata)"
          value={form.age}
          onChange={e => setForm({ ...form, age: e.target.value })}
        />
        <select
          value={form.sex}
          onChange={e => setForm({ ...form, sex: e.target.value })}
        >
          <option value="">Płeć (opcjonalnie)</option>
          <option value="Samiec">Samiec</option>
          <option value="Samica">Samica</option>
          <option value="Nieznana">Nieznana</option>
        </select>
      </div>

      <select
        value={form.status}
        onChange={e => setForm({ ...form, status: e.target.value })}
      >
        <option>Do adopcji</option>
        <option>W trakcie leczenia</option>
        <option>Adoptowane</option>
      </select>

      <textarea
        className={styles.textarea}
        placeholder="Opis zwierzęcia (opcjonalnie)"
        rows={3}
        value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
      />

      <div>
        <p className={styles.traitsLabel}>Charakter (opcjonalnie)</p>
        <div className={styles.traitsGrid}>
          {TRAIT_OPTIONS.map(trait => (
            <label
              key={trait}
              className={`${styles.traitTag} ${traits.includes(trait) ? styles.traitActive : ""}`}
            >
              <input
                type="checkbox"
                checked={traits.includes(trait)}
                onChange={() => toggleTrait(trait)}
                hidden
              />
              {trait}
            </label>
          ))}
        </div>
      </div>

      <label className={styles.fileUpload}>
        <input
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files[0])}
          hidden
        />
        <i className="fa-solid fa-image" />
        <span>{file ? file.name : "Wybierz zdjęcie *"}</span>
      </label>

      <button type="submit">Dodaj zwierzę</button>
    </form>
  );
}
