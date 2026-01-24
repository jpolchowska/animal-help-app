"use client";

import { useState } from "react";
import styles from "@/styles/Sidebar.module.css";
import Link from "next/link";

const ITEMS = [
  { id: "home", icon: "fa-house", label: "Home", href: "/" },
  { id: "animals", icon: "fa-paw", label: "Zwierzęta", href: "/animals" },
  { id: "adoptions", icon: "fa-heart", label: "Adopcje", href: "/adoptions" },
  { id: "profile", icon: "fa-user", label: "Profil", href: "/profile" },
];

export default function Sidebar() {
  const [active, setActive] = useState("home");

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {ITEMS.map(item => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={active === item.id}
            onClick={() => setActive(item.id)}
          />
        ))}
      </nav>
    </aside>
  );
}

function SidebarItem({ icon, label, href, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${styles.item} ${active ? styles.active : ""}`}
    >
      <i className={`fa-solid ${icon}`} />
      <span className={styles.label}>{label}</span>
    </Link>
  );
}