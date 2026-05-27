"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./profile.module.css";

function formatDate(date) {
  if (!date) return "—";
  return new Date(date + "Z").toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Role-specific mock data ─────────────────────────────────────────────────

const STATS = {
  admin: [
    { icon: "fa-paw",             value: 12, label: "Zwierzęta w bazie",     accent: "#6ea8d8" },
    { icon: "fa-heart",           value: 5,  label: "Adopcje",                accent: "#5fbfa0" },
    { icon: "fa-handshake-angle", value: 8,  label: "Wolontariusze",          accent: "#e0976a" },
    { icon: "fa-piggy-bank",      value: 3,  label: "Aktywne zbiórki",        accent: "#a78dd0" },
  ],
  user: [
    { icon: "fa-heart",           value: 2,  label: "Zgłoszone adopcje",     accent: "#5fbfa0" },
    { icon: "fa-star",            value: 5,  label: "Ulubione zwierzęta",    accent: "#d4a24e" },
    { icon: "fa-coins",           value: 1,  label: "Wpłaty na zbiórki",     accent: "#6ea8d8" },
    { icon: "fa-handshake-angle", value: 1,  label: "Wolontariat",           accent: "#a78dd0" },
  ],
  volunteer: [
    { icon: "fa-circle-check",    value: 12, label: "Wykonane zadania",      accent: "#5fbfa0" },
    { icon: "fa-clock",           value: 3,  label: "Nadchodzące zadania",   accent: "#e0976a" },
    { icon: "fa-paw",             value: 8,  label: "Zwierzęta pod opieką",  accent: "#6ea8d8" },
    { icon: "fa-handshake-angle", value: 96, label: "Godziny wolontariatu",  accent: "#a78dd0" },
  ],
};

const ACTIVITY = {
  admin: [
    { icon: "fa-paw",             text: "Dodano nowe zwierzę: Luna",              date: "13.05.2026", color: "#6ea8d8", bg: "rgba(110,168,216,0.1)" },
    { icon: "fa-heart",           text: "Zaakceptowano adopcję: Rex",             date: "12.05.2026", color: "#5fbfa0", bg: "rgba(95,191,160,0.1)"  },
    { icon: "fa-piggy-bank",      text: "Utworzono zbiórkę: Leczenie kotki Mii", date: "09.05.2026", color: "#a78dd0", bg: "rgba(167,141,208,0.1)" },
  ],
  user: [
    { icon: "fa-heart",           text: "Zgłoszono adopcję: Max",                date: "10.05.2026", color: "#5fbfa0", bg: "rgba(95,191,160,0.1)"  },
    { icon: "fa-star",            text: "Dodano do ulubionych: Luna",            date: "08.05.2026", color: "#d4a24e", bg: "rgba(212,162,78,0.1)"  },
    { icon: "fa-coins",           text: "Wpłata na zbiórkę: Borys",             date: "28.04.2026", color: "#a78dd0", bg: "rgba(167,141,208,0.1)" },
  ],
  volunteer: [
    { icon: "fa-circle-check",    text: "Ukończono: Karmienie psów — rano",      date: "13.05.2026", color: "#5fbfa0", bg: "rgba(95,191,160,0.1)"  },
    { icon: "fa-handshake-angle", text: "Przyjęto nowe zadanie do wykonania",    date: "12.05.2026", color: "#e0976a", bg: "rgba(224,151,106,0.1)" },
    { icon: "fa-paw",             text: "Spacer z: Luna i Rex",                  date: "10.05.2026", color: "#6ea8d8", bg: "rgba(110,168,216,0.1)" },
  ],
};

const QUICK_ACTIONS = {
  admin: [
    { icon: "fa-paw",             label: "Zwierzęta",      href: "/animals",     color: "#6ea8d8", bg: "rgba(110,168,216,0.07)" },
    { icon: "fa-heart",           label: "Adopcje",        href: "/adoptions",   color: "#5fbfa0", bg: "rgba(95,191,160,0.07)"  },
    { icon: "fa-piggy-bank",      label: "Zbiórki",        href: "/fundraising", color: "#a78dd0", bg: "rgba(167,141,208,0.07)" },
  ],
  user: [
    { icon: "fa-paw",             label: "Zwierzęta",      href: "/animals",     color: "#6ea8d8", bg: "rgba(110,168,216,0.07)" },
    { icon: "fa-heart",           label: "Moje adopcje",   href: "/adoptions",   color: "#5fbfa0", bg: "rgba(95,191,160,0.07)"  },
    { icon: "fa-piggy-bank",      label: "Zbiórki",        href: "/fundraising", color: "#a78dd0", bg: "rgba(167,141,208,0.07)" },
  ],
  volunteer: [
    { icon: "fa-handshake-angle", label: "Moje zadania",   href: "/volunteer",   color: "#6ea8d8", bg: "rgba(110,168,216,0.07)" },
    { icon: "fa-paw",             label: "Zwierzęta",      href: "/animals",     color: "#5fbfa0", bg: "rgba(95,191,160,0.07)"  },
    { icon: "fa-piggy-bank",      label: "Zbiórki",        href: "/fundraising", color: "#a78dd0", bg: "rgba(167,141,208,0.07)" },
  ],
};

const BIO = {
  admin:     "Zarządzam schroniskiem i dbam o dobrostan wszystkich podopiecznych. Koordynuję adopcje, wolontariat i zbiórki.",
  user:      "Cieszę się, że mogę pomagać zwierzętom i wspierać naszą społeczność.",
  volunteer: "Wolontariusz schroniska. Pomagam opiekować się zwierzętami i organizuję akcje adopcyjne.",
};

const ROLE_LABELS = {
  admin:     "Admin",
  volunteer: "Wolontariusz",
  user:      "Użytkownik",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [auth, setAuth]     = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) setAuth(JSON.parse(stored));
    setMounted(true);
  }, []);

  useEffect(() => {
    function syncAuth() {
      const stored = localStorage.getItem("auth");
      if (stored) setAuth(JSON.parse(stored));
    }
    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-changed", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, []);

  if (!mounted || !auth) return null;

  const { name, email, role, createdAt, lastLoginAt } = auth.user;
  const initial  = name.charAt(0).toUpperCase();
  const stats    = STATS[role]         ?? STATS.user;
  const activity = ACTIVITY[role]      ?? ACTIVITY.user;
  const actions  = QUICK_ACTIONS[role] ?? QUICK_ACTIONS.user;
  const bio      = BIO[role]           ?? BIO.user;

  return (
    <main className={styles.wrapper}>

      {/* ── Profile card ── */}
      <div className={styles.profileCard}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>{initial}</div>
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{name}</h1>
            <span className={`${styles.roleBadge} ${styles["role_" + role]}`}>
              {ROLE_LABELS[role] ?? role}
            </span>
          </div>
          <p className={styles.email}>{email}</p>
          <p className={styles.bio}>{bio}</p>
        </div>

        <div className={styles.profileDates}>
          <div className={styles.dateRow}>
            <div className={styles.dateIcon} style={{ color: "#6ea8d8", background: "rgba(110,168,216,0.1)" }}>
              <i className="fa-solid fa-calendar" />
            </div>
            <div>
              <span className={styles.dateLabel}>Data utworzenia</span>
              <strong className={styles.dateValue}>{formatDate(createdAt)}</strong>
            </div>
          </div>
          <div className={styles.dateRow}>
            <div className={styles.dateIcon} style={{ color: "#a78dd0", background: "rgba(167,141,208,0.1)" }}>
              <i className="fa-solid fa-clock-rotate-left" />
            </div>
            <div>
              <span className={styles.dateLabel}>Ostatnie logowanie</span>
              <strong className={styles.dateValue}>{formatDate(lastLoginAt)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsCard}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statItem}>
            <div
              className={styles.statIcon}
              style={{ color: s.accent, background: `${s.accent}1a` }}
            >
              <i className={`fa-solid ${s.icon}`} />
            </div>
            <div>
              <p className={styles.statValue}>{s.value}</p>
              <p className={styles.statLabel}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom two columns ── */}
      <div className={styles.bottomGrid}>

        {/* Recent activity */}
        <div className={styles.card}>
          <h2 className={styles.cardHeading}>Ostatnia aktywność</h2>
          <div className={styles.activityList}>
            {activity.map((item, i) => (
              <div key={i} className={styles.activityRow}>
                <div
                  className={styles.activityIcon}
                  style={{ color: item.color, background: item.bg }}
                >
                  <i className={`fa-solid ${item.icon}`} />
                </div>
                <span className={styles.activityText}>{item.text}</span>
                <span className={styles.activityDate}>{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className={styles.card}>
          <h2 className={styles.cardHeading}>Szybkie akcje</h2>
          <div className={styles.actionList}>
            {actions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={styles.actionItem}
                style={{ background: action.bg }}
              >
                <div
                  className={styles.actionIcon}
                  style={{ color: action.color }}
                >
                  <i className={`fa-solid ${action.icon}`} />
                </div>
                <span className={styles.actionLabel} style={{ color: action.color }}>
                  {action.label}
                </span>
                <i className={`fa-solid fa-chevron-right ${styles.actionChevron}`} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
