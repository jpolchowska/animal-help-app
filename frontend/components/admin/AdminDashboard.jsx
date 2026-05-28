"use client";

import { authFetch } from "@/utils/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./AdminDashboard.module.css";

const FAKE_FUNDRAISING_COUNT = 4;

const ACTIVITY = [
  { icon: "fa-paw",         color: "#486346", bg: "rgba(72,99,70,0.11)",    text: "Dodano nowe zwierzę: Luna",               date: "13.05.2026, 10:30" },
  { icon: "fa-circle-check",color: "#417a58", bg: "rgba(65,122,88,0.11)",   text: "Zaakceptowano adopcję: Rex",               date: "12.05.2026, 15:45" },
  { icon: "fa-piggy-bank",  color: "#7a62b8", bg: "rgba(167,141,208,0.11)", text: "Utworzono zbiórkę: Leczenie kotki Mili",   date: "09.05.2026, 09:15" },
  { icon: "fa-user",        color: "#c07a3a", bg: "rgba(192,122,58,0.11)",  text: "Nowy wolontariusz: Anna Kowalska",          date: "08.05.2026, 14:20" },
];

const QUICK_ACTIONS = [
  { label: "Dodaj zwierzę",        icon: "fa-plus",          color: "#ffffff", bg: "#31512f", href: "/animals"     },
  { label: "Zgłoszenia adopcyjne", icon: "fa-user",          color: "#31512f", bg: "#ecede7", href: "/adoptions"   },
  { label: "Zarządzaj zbiórkami",  icon: "fa-piggy-bank",    color: "#31512f", bg: "#ecede7", href: "/fundraising" },
  { label: "Kalendarz zadań",      icon: "fa-calendar-days", color: "#31512f", bg: "#ecede7", href: "/volunteer"   },
];

const TASKS = [
  { icon: "fa-calendar-days", color: "#486346", bg: "rgba(72,99,70,0.11)",    title: "Spacer z psami",     time: "4 lutego, 10:00 – 11:00",  badge: "Jutro",  urgent: true  },
  { icon: "fa-paw",           color: "#417a58", bg: "rgba(65,122,88,0.11)",   title: "Pomoc w schronisku", time: "6 lutego, 12:00 – 16:00",  badge: "2 dni",  urgent: false },
  { icon: "fa-list-check",    color: "#7a62b8", bg: "rgba(167,141,208,0.11)", title: "Zbiórka karmy",      time: "10 lutego, 18:00 – 20:00", badge: "6 dni",  urgent: false },
  { icon: "fa-broom",         color: "#c07a3a", bg: "rgba(192,122,58,0.11)",  title: "Sprzątanie bud",     time: "15 lutego, 14:00 – 16:00", badge: "11 dni", urgent: false },
];

export default function AdminDashboard() {
  const [animalCount,   setAnimalCount]   = useState(0);
  const [adoptionStats, setAdoptionStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [adminStats,    setAdminStats]    = useState({ volunteers: 0, tasks: 0 });

  useEffect(() => {
    fetch("http://localhost:3001/animals")
      .then(res => res.json())
      .then(data => setAnimalCount(data.length))
      .catch(() => setAnimalCount(0));
  }, []);

  useEffect(() => {
    authFetch("http://localhost:3001/adoptions/stats")
      .then(res => res.json())
      .then(setAdoptionStats);
  }, []);

  useEffect(() => {
    authFetch("http://localhost:3001/admin/stats")
      .then(res => res.json())
      .then(setAdminStats)
      .catch(() => setAdminStats({ volunteers: 0, tasks: 0 }));
  }, []);

  const today = new Date().toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const STAT_CARDS = [
    { label: "Zwierzęta w bazie", value: animalCount,           icon: "fa-paw",             color: "#486346", bg: "#eaede8" },
    { label: "Adopcje w toku",    value: adoptionStats.pending,  icon: "fa-heart",           color: "#417a58", bg: "#e5efea" },
    { label: "Aktywne zbiórki",   value: FAKE_FUNDRAISING_COUNT, icon: "fa-heart",           color: "#c07a3a", bg: "#f5ede2" },
    { label: "Wolontariusze",     value: adminStats.volunteers,  icon: "fa-handshake-angle", color: "#7a62b8", bg: "#f0edf8" },
  ];

  return (
    <section className={styles.container}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Panel administratora</h1>
          <p className={styles.pageSubtitle}>Zarządzaj schroniskiem i wspieraj zwierzęta każdego dnia.</p>
        </div>
        <div className={styles.dateBadge}>
          <span className={styles.dateText}>{today}</span>
          <i className="fa-regular fa-calendar" />
        </div>
      </div>

      {/* ── 4 stat cards ── */}
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

      {/* ── 3-column section ── */}
      <div className={styles.bottomGrid}>

        {/* Ostatnia aktywność */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardHeading}>Ostatnia aktywność</p>
            <Link href="/adoptions" className={styles.cardLink}>Zobacz wszystko</Link>
          </div>
          <div className={styles.activityList}>
            {ACTIVITY.map((item, i) => (
              <div key={i} className={styles.activityRow}>
                <div className={styles.activityIcon} style={{ color: item.color, background: item.bg }}>
                  <i className={`fa-solid ${item.icon}`} />
                </div>
                <span className={styles.activityText}>{item.text}</span>
                <span className={styles.activityDate}>{item.date}</span>
              </div>
            ))}
          </div>
          <button className={styles.seeAllBtn}>Zobacz wszystkie</button>
        </div>

        {/* Szybkie akcje */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardHeading}>Szybkie akcje</p>
          </div>
          <div className={styles.actionsList}>
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.href} href={action.href} className={styles.actionRow}>
                <div className={styles.actionIcon} style={{ color: action.color, background: action.bg }}>
                  <i className={`fa-solid ${action.icon}`} />
                </div>
                <span className={styles.actionLabel}>{action.label}</span>
                <i className={`fa-solid fa-chevron-right ${styles.actionChevron}`} />
              </Link>
            ))}
          </div>
        </div>

        {/* Nadchodzące zadania */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardHeading}>Nadchodzące zadania</p>
            <Link href="/volunteer" className={styles.cardLink}>Zobacz kalendarz ›</Link>
          </div>
          <div className={styles.tasksList}>
            {TASKS.map((task, i) => (
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
          <Image
            src="/cta-animals-admin.png"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "0% center" }}
            priority
          />
        </div>
      </div>

    </section>
  );
}
