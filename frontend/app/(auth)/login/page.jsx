"use client";

import { useState } from "react";
import styles from "../auth.module.css";
import Image from "next/image";
import Link from "next/link";
import { API_URL } from "@/utils/config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Błąd logowania");
      return;
    }

    const expiresAt = Date.now() + 60 * 60 * 1000; // 1h

    localStorage.setItem(
      "auth",
      JSON.stringify({
        token: data.token,
        expiresAt,
        user: {
          email: data.email,
          role: data.role,
          name: data.name,
          createdAt: data.createdAt,
          lastLoginAt: data.lastLoginAt
        }
      })
    );

    window.location.href = "/";
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

      <p className={styles.switch}>
        Nie masz konta? <Link href="/register">Zarejestruj się</Link>
      </p>
    </form>
  );
}