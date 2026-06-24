"use client";

import styles from "@/styles/Header.module.css";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser, logout } from "@/utils/auth";

export default function Header() {
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    const user = getUser();
    if (user?.name) {
      setInitial(user.name.charAt(0).toUpperCase());
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
          <Link href="/profile" className={styles.avatar}>{initial}</Link>
        )}
        <button onClick={logout} className={styles.logoutBtn}>Wyloguj</button>
      </div>
    </header>
  );
}
