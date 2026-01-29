"use client";

import styles from "@/styles/Header.module.css";
import Image from "next/image";
import { logout } from "@/utils/auth";
import { useEffect, useState } from "react";

export default function Header() {
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (auth?.user?.name) {
      setInitial(auth.user.name.charAt(0).toUpperCase());
    }
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Image src="/logo.svg" width={35} height={35} alt="Logo" />
        <span className={styles.title}>Animal Help App</span>
      </div>

      <div className={styles.right}>
        {initial && (
          <div className={styles.avatar}>{initial}</div>
        )}
        <button onClick={logout} className={styles.logoutBtn}>Wyloguj</button>
      </div>
    </header>
  );
}