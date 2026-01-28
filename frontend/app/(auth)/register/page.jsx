"use client";

import { useState } from "react";
import styles from "../auth.module.css";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("http://localhost:3001/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Błąd rejestracji");
      return;
    }

    window.location.href = "/login";
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <div className={styles.logoWrapper}>
        <Image src="/logo.svg" width={40} height={40} alt="Logo" />
      </div>

      <h2>Rejestracja</h2>

      {error && <p className={styles.error}>{error}</p>}

      <input
        placeholder="Imię"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button>Zarejestruj się</button>

      <p className={styles.switch}>
        Masz już konto? <Link href="/login">Zaloguj się</Link>
      </p>
    </form>
  );
}