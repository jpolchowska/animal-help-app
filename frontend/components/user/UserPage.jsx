"use client";

import { authFetch } from "@/utils/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./UserPage.module.css";

const MY_ACTIVITIES = [
  { icon: "fa-calendar-days", color: "#486346", bg: "rgba(72,99,70,0.11)",    title: "Spacer z Luną",      time: "4 lutego, 10:00 – 11:00",  badge: "Za 2 dni", urgent: true  },
  { icon: "fa-heart",         color: "#417a58", bg: "rgba(65,122,88,0.11)",   title: "Pomoc w schronisku", time: "6 lutego, 12:00 – 16:00",  badge: "Za 4 dni", urgent: false },
  { icon: "fa-piggy-bank",    color: "#7a62b8", bg: "rgba(167,141,208,0.11)", title: "Zbiórka karmy",      time: "10 lutego, 18:00 – 20:00", badge: "Za 8 dni", urgent: false },
];

const MY_FAVORITES = [
  { icon: "fa-dog", color: "#486346", bg: "rgba(72,99,70,0.11)",    name: "Piorun", info: "Pies • Do adopcji" },
  { icon: "fa-cat", color: "#417a58", bg: "rgba(65,122,88,0.11)",   name: "Kora",   info: "Kot • Do adopcji"  },
  { icon: "fa-cat", color: "#7a62b8", bg: "rgba(167,141,208,0.11)", name: "Nutka",  info: "Kot • Do adopcji"  },
];

export default function UserPage({ userName }) {
  const [myAnimals, setMyAnimals] = useState([]);
  const [userStats, setUserStats] = useState({ myAnimals: 3, myAdoptions: 2, volunteerHours: 14, favorites: 5 });

  useEffect(() => {
    authFetch("http://localhost:3001/animals/my")
      .then(res => res.json())
      .then(data => setMyAnimals(Array.isArray(data) ? data.slice(0, 2) : []))
      .catch(() => setMyAnimals([]));
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

      {/* ── 3-column section ── */}
      <div className={styles.bottomGrid}>

        {/* Moje aktywności */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardHeading}>Moje aktywności</p>
            <Link href="/volunteer" className={styles.cardLink}>Zobacz wszystkie</Link>
          </div>
          <div className={styles.tasksList}>
            {MY_ACTIVITIES.map((task, i) => (
              <div key={i} className={styles.taskRow}>
                <div className={styles.taskIcon} style={{ color: task.color, background: task.bg }}>
                  <i className={`fa-solid ${task.icon}`} />
                </div>
                <div className={styles.taskInfo}>
                  <span className={styles.taskTitle}>{task.title}</span>
                  <span className={styles.taskTime}>{task.time}</span>
                </div>
                <span className={`${styles.taskBadge} ${task.urgent ? styles.taskBadgeUrgent : ""}`}>
                  {task.badge}
                </span>
              </div>
            ))}
          </div>
          <button className={styles.seeAllBtn}>Zobacz wszystkie</button>
        </div>

        {/* Moje zwierzęta */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardHeading}>Moje zwierzęta</p>
            <Link href="/animals" className={styles.cardLink}>Zobacz wszystkie</Link>
          </div>
          <div className={styles.animalGrid}>
            {(myAnimals.length > 0 ? myAnimals : [
              { id: null, name: "Luna", species: "Kot", age: 2, image_url: null },
              { id: null, name: "Rex",  species: "Pies", age: 3, image_url: null },
            ]).map((animal, i) => (
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

        {/* Ulubione zwierzęta */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardHeading}>Ulubione zwierzęta</p>
            <Link href="/animals" className={styles.cardLink}>Zobacz wszystkie</Link>
          </div>
          <div className={styles.favoritesList}>
            {MY_FAVORITES.map((fav, i) => (
              <div key={i} className={styles.favoriteRow}>
                <div className={styles.favoriteIcon} style={{ color: fav.color, background: fav.bg }}>
                  <i className={`fa-solid ${fav.icon}`} />
                </div>
                <div className={styles.favoriteMeta}>
                  <span className={styles.favoriteName}>{fav.name}</span>
                  <span className={styles.favoriteInfo}>{fav.info}</span>
                </div>
                <button className={styles.heartBtn}>
                  <i className="fa-regular fa-heart" />
                </button>
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
