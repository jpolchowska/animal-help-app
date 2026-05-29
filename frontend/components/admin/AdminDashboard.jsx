"use client";

import { authFetch } from "@/utils/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import styles from "./AdminDashboard.module.css";



function formatTaskDate(task) {
  if (!task.date) return "";
  const d = new Date(task.date);
  const dateStr = d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
  return task.time_from ? `${dateStr}, ${task.time_from}` : dateStr;
}

export default function AdminDashboard() {
  const [animalCount,   setAnimalCount]   = useState(0);
  const [adoptionStats, setAdoptionStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [adminStats,    setAdminStats]    = useState({ volunteers: 0, tasks: 0 });
  const [tasks,         setTasks]         = useState([]);

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

  useEffect(() => {
    authFetch("http://localhost:3001/tasks")
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => setTasks([]));
  }, []);

  const today = new Date().toLocaleDateString("pl-PL", {
    day: "numeric", month: "long", year: "numeric",
  });

  const STAT_CARDS = [
    { label: "Zwierzęta w bazie", value: animalCount,           icon: "fa-paw",             color: "#486346", bg: "#eaede8" },
    { label: "Adopcje w toku",    value: adoptionStats.pending,  icon: "fa-heart",           color: "#417a58", bg: "#e5efea" },
    { label: "Aktywne zadania",    value: tasks.length,           icon: "fa-list-check",      color: "#c07a3a", bg: "#f5ede2" },
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

      {/* ── 2-column section ── */}
      <div className={styles.bottomGrid}>

        {/* Adopcje — donut chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardHeading}>Adopcje</p>
            <Link href="/adoptions" className={styles.cardLink}>Zobacz wszystkie</Link>
          </div>

          {(() => {
            const rejected = Math.max(0, adoptionStats.total - adoptionStats.approved - adoptionStats.pending);

            const pieData = [
              { name: "Zaakceptowane", value: adoptionStats.approved || 0, color: "#5a8c57" },
              { name: "Oczekujące",    value: adoptionStats.pending  || 0, color: "#e0976a" },
              { name: "Odrzucone",     value: rejected,                    color: "#a78dd0" },
            ];
            const hasData = pieData.some(d => d.value > 0);

            return (
              <div className={styles.chartWrap}>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={hasData ? pieData.filter(d => d.value > 0) : [{ name: "Brak", value: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={68}
                      paddingAngle={0}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {hasData
                        ? pieData.filter(d => d.value > 0).map((d, i) => <Cell key={i} fill={d.color} />)
                        : <Cell fill="#eeece8" />
                      }
                    </Pie>
                    {hasData && (
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid #eeece8", fontSize: 12 }}
                        formatter={(v, n) => [v, n]}
                      />
                    )}
                  </PieChart>
                </ResponsiveContainer>

                <div className={styles.chartLegend}>
                  {pieData.map(l => (
                    <div key={l.name} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: l.color }} />
                      <span className={styles.legendLabel}>{l.name}</span>
                      <span className={styles.legendValue}>{l.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Nadchodzące zadania — real data, activity style */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardHeading}>Nadchodzące zadania</p>
            <Link href="/volunteer" className={styles.cardLink}>Zobacz wszystkie</Link>
          </div>
          <div className={styles.activityList}>
            {tasks.length === 0 ? (
              <p className={styles.emptyText}>Brak nadchodzących zadań</p>
            ) : tasks.map((task) => (
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
