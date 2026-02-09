"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import styles from "./MyAdoptions.module.css";
import Image from "next/image";

const statusClassMap = {
  "W oczekiwaniu": "pending",
  "Zaakceptowany": "approved",
  "Odrzucony": "rejected"
};

export default function MyAdoptions() {
  const [adoptions, setAdoptions] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    authFetch("http://localhost:3001/adoptions/my")
      .then(res => res.json())
      .then(data => {
        setAdoptions(Array.isArray(data) ? data : []);
      })
      .catch(() => setAdoptions([]));
  }, []);

  return (
    <section className={styles.container}>
      <div className={styles.Header}>
        <h2>Moje adopcje</h2>
        <span className={styles.count}>{adoptions.length}</span>
      </div>

      {adoptions.length === 0 ? (
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
          <h3>Nie masz jeszcze adopcji</h3>
          <p>Gdy złożysz wniosek adopcyjny, pojawi się on tutaj</p>
        </div>
      ) : (
        adoptions.map(a => (
          <div key={a.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.left}>
                <img
                  src={`http://localhost:3001${a.animal_image}`}
                  alt={a.animal_name}
                  className={styles.avatar}
                />

                <div>
                  <h3>{a.animal_name}</h3>
                  {mounted && (
                    <span className={styles.date}>
                      Złożono: {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <span
                className={`${styles.status} ${styles[statusClassMap[a.status]]}`}
              >
                {a.status}
              </span>
            </div>

            {/* <div className={styles.cardBody}>
              {a.status === "W oczekiwaniu" && (
                <p>Twój wniosek jest aktualnie rozpatrywany przez schronisko.</p>
              )}
              {a.status === "Zaakceptowany" && (
                <p>Gratulacje! Skontaktujemy się z Tobą w sprawie dalszych kroków 🎉</p>
              )}
              {a.status === "Odrzucony" && (
                <p>Ten wniosek nie został zaakceptowany.</p>
              )}
            </div> */}
          </div>
        ))
      )}
    </section>
  );
}