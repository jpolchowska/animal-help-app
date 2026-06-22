"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./profile.module.css";
import { getAuth, authFetch } from "@/utils/api";
import { API_URL } from "@/utils/config";

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("pl-PL", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

const ROLE_LABELS = { admin: "Administrator", volunteer: "Wolontariusz", user: "Użytkownik" };

const QUICK_LINKS = {
  admin: [
    { icon: "fa-paw",             label: "Zwierzęta",    href: "/animals"   },
    { icon: "fa-heart",           label: "Adopcje",       href: "/adoptions" },
    { icon: "fa-handshake-angle", label: "Wolontariat",   href: "/volunteer" },
  ],
  user: [
    { icon: "fa-paw",             label: "Przeglądaj zwierzęta", href: "/animals"   },
    { icon: "fa-heart",           label: "Moje adopcje",          href: "/adoptions" },
    { icon: "fa-handshake-angle", label: "Wolontariat",            href: "/volunteer" },
  ],
  volunteer: [
    { icon: "fa-paw",             label: "Zwierzęta",     href: "/animals"   },
    { icon: "fa-handshake-angle", label: "Moje zadania",  href: "/volunteer" },
    { icon: "fa-heart",           label: "Adopcje",        href: "/adoptions" },
  ],
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { setMounted(true); return; }

    authFetch(`${API_URL}/profile`)
      .then(r => r.json())
      .then(data => {
        setProfile({
          name:        auth.user.name,
          email:       auth.user.email,
          role:        auth.user.role,
          createdAt:   data.created_at,
          lastLoginAt: data.last_login_at,
        });
        setMounted(true);
      })
      .catch(() => {
        setProfile({
          name:  auth.user.name,
          email: auth.user.email,
          role:  auth.user.role,
        });
        setMounted(true);
      });
  }, []);

  if (!mounted || !profile) return null;

  const { name, email, role, createdAt, lastLoginAt } = profile;
  const initial   = name?.charAt(0).toUpperCase() ?? "?";
  const roleLabel = ROLE_LABELS[role] ?? role;
  const links     = QUICK_LINKS[role] ?? QUICK_LINKS.user;

  const INFO_ROWS = [
    { label: "Imię i nazwisko",    value: name      },
    { label: "Adres e-mail",       value: email     },
    { label: "Rola",               value: roleLabel },
    { label: "Konto utworzono",    value: formatDate(createdAt)   },
    { label: "Ostatnie logowanie", value: formatDate(lastLoginAt) },
  ];

  return (
    <main className={styles.wrapper}>

      <div className={styles.hero}>
        <div className={styles.avatarCircle}>{initial}</div>
        <div className={styles.heroInfo}>
          <div className={styles.heroTop}>
            <h1 className={styles.heroName}>{name}</h1>
            <span className={`${styles.roleBadge} ${styles["role_" + role]}`}>{roleLabel}</span>
          </div>
          <p className={styles.heroEmail}>{email}</p>
        </div>
      </div>

      <div className={styles.cardsRow}>

        <div className={styles.card}>
          <p className={styles.sectionLabel}>Informacje o koncie</p>
          <div className={styles.infoList}>
            {INFO_ROWS.map((row) => (
              <div key={row.label} className={styles.infoRow}>
                <span className={styles.infoLabel}>{row.label}</span>
                <span className={styles.infoValue}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.sectionLabel}>Szybkie akcje</p>
          <div className={styles.linksList}>
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={styles.linkRow}>
                <div className={styles.linkIcon}>
                  <i className={`fa-solid ${l.icon}`} />
                </div>
                <span className={styles.linkLabel}>{l.label}</span>
                <i className={`fa-solid fa-chevron-right ${styles.linkChevron}`} />
              </Link>
            ))}
          </div>
        </div>

      </div>

    </main>
  );
}
