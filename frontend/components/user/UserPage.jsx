"use client";

import { authFetch } from "@/utils/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./UserPage.module.css";
import { API_URL } from "@/utils/config";

function formatTaskDate(task) {
  if (!task.date) return "";
  const d = new Date(task.date);
  const dateStr = d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
  return task.time_from ? `${dateStr}, ${task.time_from}` : dateStr;
}

export default function UserPage({ userName }) {
  const [adoptions,   setAdoptions]   = useState([]);
  const [signups,     setSignups]     = useState([]);
  const [totalTasks,  setTotalTasks]  = useState(0);

  useEffect(() => {
    authFetch(`${API_URL}/adoptions/my`)
      .then(res => res.json())
      .then(data => setAdoptions(Array.isArray(data) ? data : []))
      .catch(() => setAdoptions([]));
  }, []);

  useEffect(() => {
    authFetch(`${API_URL}/signups/my`)
      .then(res => res.json())
      .then(data => setSignups(Array.isArray(data) ? data : []))
      .catch(() => setSignups([]));
  }, []);

  useEffect(() => {
    authFetch(`${API_URL}/tasks`)
      .then(res => res.json())
      .then(data => setTotalTasks(Array.isArray(data) ? data.length : 0))
      .catch(() => setTotalTasks(0));
  }, []);

  const adoptedCount = adoptions.filter(a => a.status === "Zaakceptowany").length;
  const pendingCount = adoptions.filter(a => a.status === "W oczekiwaniu").length;
  const adoptedAnimals = adoptions.filter(a => a.status === "Zaakceptowany").slice(0, 2);
  const recentSignups  = signups.slice(0, 4);

  const STAT_CARDS = [
    { label: "Zaadoptowane zwierzęta", value: adoptedCount,      icon: "fa-paw",    color: "#486346", bg: "#eaede8" },
    { label: "Adopcje w toku",          value: pendingCount,     icon: "fa-heart",  color: "#c07a3a", bg: "#f5ede2" },
    { label: "Moje zadania",            value: signups.length,   icon: "fa-person", color: "#7a62b8", bg: "#f0edf8" },
    { label: "Dostępne zadania",         value: totalTasks,       icon: "fa-calendar-check", color: "#417a58", bg: "#e5efea" },
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

        {/* Moje aktywności */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardHeading}>Moje aktywności</p>
            <Link href="/volunteer" className={styles.cardLink}>Zobacz wszystkie</Link>
          </div>
          <div className={styles.activityList}>
            {recentSignups.length === 0 ? (
              <p className={styles.emptyText}>Brak zapisanych zadań</p>
            ) : recentSignups.map((task) => (
              <div key={task.id} className={styles.activityRow}>
                <div className={styles.activityIcon} style={{ color: "#486346", background: "rgba(72,99,70,0.11)" }}>
                  <i className="fa-solid fa-calendar-days" />
                </div>
                <div className={styles.activityBody}>
                  <span className={styles.activityText}>{task.title}</span>
                  {task.description && <span className={styles.activitySub}>{task.description}</span>}
                </div>
                {(task.date || task.time_from) && (
                  <span className={styles.activityDate}>{formatTaskDate(task)}</span>
                )}
              </div>
            ))}
          </div>
          <button className={styles.seeAllBtn} onClick={() => window.location.href = "/volunteer"}>
            Zobacz wszystkie
          </button>
        </div>

        {/* Moje adopcje */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardHeading}>Moje adopcje</p>
            <Link href="/adoptions" className={styles.cardLink}>Zobacz wszystkie</Link>
          </div>
          <div className={styles.animalGrid}>
            {adoptedAnimals.length === 0 ? (
              <p className={styles.emptyText}>Brak zaadoptowanych zwierząt</p>
            ) : adoptedAnimals.map((a) => (
              <div key={a.id} className={styles.animalCard}>
                <div className={styles.animalPhoto}>
                  {a.animal_image ? (
                    <Image
                      src={`${API_URL}${a.animal_image}`}
                      alt={a.animal_name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className={styles.animalNoPhoto}><i className="fa-solid fa-paw" /></div>
                  )}
                </div>
                <div className={styles.animalFooter}>
                  <div className={styles.animalMeta}>
                    <span className={styles.animalName}>{a.animal_name}</span>
                    <span className={styles.animalInfo}>Zaadoptowane</span>
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
