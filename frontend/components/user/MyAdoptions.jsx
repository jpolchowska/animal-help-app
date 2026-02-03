"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import styles from "./MyAdoptions.module.css";

const statusClassMap = {
  "W oczekiwaniu": "pending",
  "Zaakceptowany": "approved",
  "Odrzucony": "rejected"
};

export default function MyAdoptions() {
  const [adoptions, setAdoptions] = useState([]);

  // useEffect(() => {
  //   authFetch("http://localhost:3001/adoptions/my")
  //     .then(res => res.json())
  //     .then(setAdoptions);
  // }, []);

  useEffect(() => {
    authFetch("http://localhost:3001/adoptions/my")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAdoptions(data);
        } else {
          setAdoptions([]);
        }
      })
      .catch(() => setAdoptions([]));
  }, []);

  return (
    <section className={styles.container}>

      <div className={styles.Header}>
        <h2>Moje adopcje</h2>
        <span className={styles.count}>
          {adoptions.length}
        </span>
      </div>

      {adoptions.length === 0 ? (
        <p className={styles.empty}>Nie masz jeszcze adopcji</p>
      ) : (
        adoptions.map(a => (
          <div key={a.id} className={styles.card}>
            <strong>{a.animal_name}</strong>
            <span className={`${styles.status} ${styles[statusClassMap[a.status]]}`}>
              {a.status}
            </span>
          </div>
        ))
      )}
    </section>
  );
}