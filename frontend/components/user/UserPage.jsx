"use client";

import { authFetch } from "@/utils/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./UserPage.module.css";

function formatTaskDate(task) {
  if (!task.date) return "";
  const d = new Date(task.date);
  const dateStr = d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
  return task.time_from ? `${dateStr}, ${task.time_from}` : dateStr;
}

export default function UserPage({ userName }) {
  const [myAnimals, setMyAnimals] = useState([]);
  const [myTasks,   setMyTasks]   = useState([]);
  const [userStats] = useState({ myAnimals: 3, myAdoptions: 2, volunteerHours: 14, favorites: 5 });

  useEffect(() => {
    authFetch("http://localhost:3001/animals/my")
      .then(res => res.json())
      .then(data => setMyAnimals(Array.isArray(data) ? data.slice(0, 2) : []))
      .catch(() => setMyAnimals([]));
  }, []);

  useEffect(() => {
    authFetch("http://localhost:3001/signups/my")
      .then(res => res.json())
      .then(data => setMyTasks(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => setMyTasks([]));
  }, []);

  const STAT_CARDS = [
    { label: "Moje zwierzęta pod opieką", value: userStats.myAnimals,       icon: "fa-paw",          color: "#486346", bg: "#eaede8" },
    { label: "Moje adopcje w toku",        value: userStats.myAdoptions,    icon: "fa-heart",        color: "#c07a3a", bg: "#f5ede2" },
    { label: "Godzin wolontariatu",         value: userStats.volunteerHours, icon: "fa-person",       color: "#7a62b8", bg: "#f0edf8" },
    { label: "Ulubione zwierzęta",          value: userStats.favorites,      icon: "fa-star",         color: "#417a58", bg: "#e5efea" },
  ];

  return (
    <section className={styles.container}>

      {/* ── Hero + stats wrapper ── */}
      <div className={styles.heroWrapper}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>Witaj{userName ? `, ${userName}` : ""}!</h1>
          <p className={styles.heroSubtitle}>
            Dziękujemy, że jesteś częścią naszej społeczności.
          </p>
        </div>
        <div className={styles.heroImageArea}>
          <Image src="/cta-animals-user.png" alt="" fill style={{ objectFit: "contain", objectPosition: "right top" }} priority />
        </div>
        <div className={styles.statsRow}>
          {STAT_CARDS.map((card) => (
            <div key={card.label} className={styles.statCard}>
              <div className={styles.statIconCircle} style={{ color: card.color, background: card.bg }}>
                <i className={`fa-solid ${card.icon}`} />
              </div>
              <div className={styles.statInfo}>
                <strong className={styles.statValue}>{card.value}</strong>
                <span className={styles.statLabel}>{card.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2-column section ── */}
      <div className={styles.bottomGrid}>

        {/* Moje aktywności — real tasks */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardHeading}>Moje aktywności</p>
            <Link href="/volunteer" className={styles.cardLink}>Zobacz wszystkie</Link>
          </div>
          <div className={styles.activityList}>
            {myTasks.length === 0 ? (
              <p className={styles.emptyText}>Brak zapisanych zadań</p>
            ) : myTasks.map((task) => (
              <div key={task.id} className={styles.activityRow}>
                <div className={styles.activityIcon} style={{ color: "#486346", background: "rgba(72,99,70,0.11)" }}>
                  <i className="fa-solid fa-calendar-days" />
                </div>
                <span className={styles.activityText}>{task.title}</span>
                <span className={styles.activityDate}>{formatTaskDate(task)}</span>
              </div>
            ))}
          </div>
          <button className={styles.seeAllBtn} onClick={() => window.location.href = "/volunteer"}>
            Zobacz wszystkie
          </button>
        </div>

        {/* Moje zwierzęta */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardHeading}>Moje zwierzęta</p>
            <Link href="/animals" className={styles.cardLink}>Zobacz wszystkie</Link>
          </div>
          <div className={styles.animalGrid}>
            {myAnimals.length === 0 ? (
              <p className={styles.emptyText}>Brak zwierząt pod opieką</p>
            ) : myAnimals.map((animal, i) => (
              <div key={i} className={styles.animalCard}>
                <div className={styles.animalPhoto}>
                  {animal.image_url ? (
                    <Image src={animal.image_url} alt={animal.name} fill style={{ objectFit: "cover" }} />
                  ) : (
                    <div className={styles.animalNoPhoto}><i className="fa-solid fa-paw" /></div>
                  )}
                </div>
                <div className={styles.animalFooter}>
                  <div className={styles.animalMeta}>
                    <span className={styles.animalName}>{animal.name}</span>
                    <span className={styles.animalInfo}>{animal.species} • {animal.age} lata</span>
                  </div>
                  <i className="fa-solid fa-chevron-right" style={{ color: "#bcc4b7", fontSize: "10px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── CTA section ── */}
      <div className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <p className={styles.ctaTitle}>Nie znalazłeś swojego zgłoszenia?</p>
          <p className={styles.ctaSubtitle}>Może interesuje Cię inne zwierzę?</p>
          <Link href="/animals" className={styles.ctaBtn}>Przeglądaj zwierzęta</Link>
        </div>
        <div className={styles.ctaImageArea}>
          <Image src="/cta-animals-admin.png" alt="" fill style={{ objectFit: "cover", objectPosition: "0% center" }} priority />
        </div>
      </div>

    </section>
  );
}
