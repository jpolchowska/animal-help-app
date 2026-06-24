"use client";

import styles from "@/styles/Sidebar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { icon: "fa-house", label: "Home", href: "/" },
  { icon: "fa-paw", label: "Zwierzęta", href: "/animals" },
  { icon: "fa-heart", label: "Adopcje", href: "/adoptions" },
  { icon: "fa-handshake-angle", label: "Wolontariat", href: "/volunteer" },
  { icon: "fa-user", label: "Profil", href: "/profile" },
  { icon: "fa-gear", label: "Ustawienia", href: "http://localhost:8080/realms/animal-help-app/account", external: true },
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

          if (item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                className={styles.item}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className={`fa-solid ${item.icon}`} />
                <span className={styles.label}>{item.label}</span>
              </a>
            );
          }

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