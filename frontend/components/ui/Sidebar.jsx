"use client";

import styles from "@/styles/Sidebar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { icon: "fa-house", label: "Home", href: "/" },
  { icon: "fa-paw", label: "Zwierzęta", href: "/animals" },
  { icon: "fa-heart", label: "Adopcje", href: "/adoptions" },
  { icon: "fa-handshake-angle", label: "Wolontariat", href: "/volunteer" },
  { icon: "fa-piggy-bank" , label: "Zbiórki", href: "/fundraising" },
  { icon: "fa-comment" , label: "Chat", href: "/chat" },
  { icon: "fa-user", label: "Profil", href: "/profile" }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {ITEMS.map(item => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.item} ${isActive ? styles.active : ""}`}
            >
              <i className={`fa-solid ${item.icon}`} />
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}