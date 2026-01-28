"use client";

import { useState } from "react";
import styles from "./login.module.css";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Błąd logowania");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    window.location.href = "/animals";
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <div className={styles.logoWrapper}>
        <Image src="/logo.svg" width={40} height={40} alt="Logo" />
      </div>

      <h2>Login</h2>

      {error && <p className={styles.error}>{error}</p>}

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

      <button>Zaloguj</button>
    </form>
  );
}