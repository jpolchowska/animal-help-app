"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import Link from "next/link";
import Image from "next/image";
import styles from "./MyAdoptions.module.css";

const STATUS_META = {
  "W oczekiwaniu": { cls: "pending",  icon: "fa-clock",        label: "W oczekiwaniu" },
  "Zaakceptowany": { cls: "approved", icon: "fa-circle-check", label: "Zaakceptowany" },
  "Odrzucony":     { cls: "rejected", icon: "fa-circle-xmark", label: "Odrzucony"     },
};

export default function MyAdoptions() {
  const [adoptions, setAdoptions] = useState([]);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    authFetch("http://localhost:3001/adoptions/my")
      .then(res => res.json())
      .then(data => setAdoptions(Array.isArray(data) ? data : []))
      .catch(() => setAdoptions([]));
  }, []);

  return (
    <section className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Moje adopcje</h2>
          <p className={styles.pageSubtitle}>Przeglądaj swoje wnioski adopcyjne i ich aktualny status.</p>
        </div>
        <span className={styles.totalBadge}>
          <i className="fa-solid fa-paw" />
          {adoptions.length} {adoptions.length === 1 ? "adopcja" : "adopcje"}
        </span>
      </div>

      {/* ── Cards ── */}
      <div className={styles.list}>
        {adoptions.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa-solid fa-paw" />
            <p>Nie masz jeszcze żadnych wniosków adopcyjnych.</p>
          </div>
        ) : (
          adoptions.map(a => {
            const meta = STATUS_META[a.status] ?? STATUS_META["W oczekiwaniu"];
            return (
              <div key={a.id} className={styles.card}>
                <div className={styles.cardLeft}>
                  <img
                    src={`http://localhost:3001${a.animal_image}`}
                    alt={a.animal_name}
                    className={styles.avatar}
                  />
                  <div className={styles.info}>
                    <strong className={styles.name}>{a.animal_name}</strong>
                    {mounted && (
                      <span className={styles.date}>
                        Złożono · {new Date(a.created_at).toLocaleDateString("pl-PL")}
                      </span>
                    )}
                    <Link href={`/animals/${a.animal_id}`} className={styles.detailBtn}>
                      Zobacz szczegóły <i className="fa-solid fa-chevron-right" />
                    </Link>
                  </div>
                </div>
                <span className={`${styles.status} ${styles[meta.cls]}`}>
                  <i className={`fa-solid ${meta.icon}`} />
                  {meta.label}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* ── CTA ── */}
      <div className={styles.cta}>
        <div className={styles.ctaContent}>
          <p className={styles.ctaTitle}>Nie znalazłeś swojego zgłoszenia?</p>
          <p className={styles.ctaSubtitle}>Może interesuje Cię inne zwierzę?</p>
          <Link href="/animals" className={styles.ctaBtn}>Przeglądaj zwierzęta</Link>
        </div>
        <div className={styles.ctaImage}>
          <Image src="/cta-animals-user.png" alt="" fill style={{ objectFit: "contain", objectPosition: "right bottom" }} />
        </div>
      </div>

    </section>
  );
}
