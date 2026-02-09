"use client";

import { authFetch } from "@/utils/api";
import { useEffect, useState } from "react";
import styles from "./AdminDashboard.module.css";
import { useOnlineUsers } from "@/context/WebSocketProvider";

export default function AdminDashboard() {
  const { online } = useOnlineUsers();
  const [animalCount, setAnimalCount] = useState(0);
  const [dogsCount, setDogsCount] = useState(0);
  const [catsCount, setCatsCount] = useState(0);
  const [adoptionStats, setAdoptionStats] = useState({
    total: 0,
    pending: 0,
    approved: 0
  });

  useEffect(() => {
    fetch("http://localhost:3001/animals")
      .then(res => res.json())
      .then(data => {
        setAnimalCount(data.length);

        const dogs = data.filter(a => a.type === "pies").length;
        const cats = data.filter(a => a.type === "kot").length;

        setDogsCount(dogs);
        setCatsCount(cats);
      })
      .catch(() => {
        setAnimalCount(0);
        setDogsCount(0);
        setCatsCount(0);
      });
  }, []);

  useEffect(() => {
    authFetch("http://localhost:3001/adoptions/stats")
      .then(res => res.json())
      .then(setAdoptionStats);
  }, []);

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2>Panel administratora</h2>
      </div>

      <div className={styles.grid}>
        {/* UŻYTKOWNICY ONLINE */}
        {/* <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <span className={styles.label}>Użytkownicy online</span>
            <strong className={styles.value}>{online}</strong>
          </div>

          <div className={styles.icon}>
            <i className="fa-solid fa-users" />
          </div>
        </div> */}

        {/* ZWIERZĘTA */}
        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <span className={styles.label}>Zwierzęta w bazie</span>
            <strong className={styles.value}>{animalCount}</strong>
          </div>

          <div className={styles.icon}>
            <i className="fa-solid fa-paw" />
          </div>
        </div>

        {/* PSY */}
        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <span className={styles.label}>Psy</span>
            <strong className={styles.value}>{dogsCount}</strong>
          </div>
          <div className={styles.icon}>
            <i className="fa-solid fa-dog" />
          </div>
        </div>

        {/* KOTY */}
        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <span className={styles.label}>Koty</span>
            <strong className={styles.value}>{catsCount}</strong>
          </div>
          <div className={styles.icon}>
            <i className="fa-solid fa-cat" />
          </div>
        </div>

        {/* WNIOSKI ADOPCYJNE */}
        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <span className={styles.label}>Wnioski adopcyjne</span>
            <strong className={styles.value}>{adoptionStats.pending}</strong>
          </div>
          <div className={styles.icon}>
            <i className="fa-solid fa-clipboard" />
          </div>
        </div>

        {/* ZAADOPTOWANE ZWIERZĘTA */}
        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <span className={styles.label}>Zaadoptowane zwierzęta</span>
            <strong className={styles.value}>{adoptionStats.approved}</strong>
          </div>
          <div className={styles.icon}>
            <i className="fa-solid fa-clipboard-check" />
          </div>
        </div>

      </div>
    </section>
  );
}