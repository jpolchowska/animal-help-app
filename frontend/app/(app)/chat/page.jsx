"use client";

import Image from "next/image";
import styles from "./page.module.css";

export default function ChatPage() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.imageWrapper}>
        <Image
          src="/cat.svg"
          alt="Brak adopcji"
          width={120}
          height={120}
          priority
        />
      </div>
      <h3>Ta strona jeszcze nie jest gotowa</h3>
      <p>Zajrzyj później</p>
    </div>
  );
}