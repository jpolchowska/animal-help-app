"use client";

import Image from "next/image";
import styles from "./Volunteer.module.css";
import { authFetch } from "@/utils/api";

export default function UserView({ onBecameVolunteer }) {
  async function join() {
    await authFetch("http://localhost:3001/volunteer/join", {
      method: "POST"
    });

    const stored = localStorage.getItem("auth");
    if (stored) {
      const auth = JSON.parse(stored);
      auth.user.role = "volunteer";
      localStorage.setItem("auth", JSON.stringify(auth));
    }

    window.dispatchEvent(new Event("auth-changed"));
    onBecameVolunteer();
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2>Wolontariat</h2>
      </div>

      <div className={styles.locked}>
        <div className={styles.imageWrapper}>
          <Image
            src="/cat.svg"
            alt="Wolontariat"
            width={120}
            height={120}
            priority
          />
        </div>

        <p>
          Aby uzyskać dostęp do zadań,
          musisz zostać wolontariuszem.
        </p>

        <button className={styles.primary} onClick={join}>
          Zostań wolontariuszem
        </button>
      </div>
    </section>
  );
}