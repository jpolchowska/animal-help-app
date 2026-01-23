"use client";

import { useState } from "react";
import styles from "@/styles/Sidebar.module.css";

const ITEMS = [
  { id: "home", icon: "fa-house", label: "Home" },
  { id: "animals", icon: "fa-paw", label: "Zwierzęta" },
  { id: "adoptions", icon: "fa-heart", label: "Adopcje" },
  { id: "profile", icon: "fa-user", label: "Profil" },
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
            active={active === item.id}
            onClick={() => setActive(item.id)}
          />
        ))}
      </nav>
    </aside>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div
      className={`${styles.item} ${active ? styles.active : ""}`}
      onClick={onClick}
    >
      <i className={`fa-solid ${icon}`} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}