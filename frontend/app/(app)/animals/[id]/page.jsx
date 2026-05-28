"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuth, authFetch } from "@/utils/api";
import styles from "./page.module.css";

const TRAITS = {
  Pies: [
    { label: "Łagodny",    icon: "fa-face-smile",   color: "Blue"   },
    { label: "Towarzyski", icon: "fa-people-group", color: "Green"  },
    { label: "Spokojny",   icon: "fa-heart",        color: "Purple" },
  ],
  Kot: [
    { label: "Ciekawy",   icon: "fa-magnifying-glass", color: "Blue"   },
    { label: "Spokojny",  icon: "fa-heart",            color: "Green"  },
    { label: "Delikatny", icon: "fa-feather",          color: "Purple" },
  ],
  default: [
    { label: "Łagodny",    icon: "fa-face-smile",   color: "Blue"   },
    { label: "Towarzyski", icon: "fa-people-group", color: "Green"  },
    { label: "Spokojny",   icon: "fa-heart",        color: "Purple" },
  ],
};

const ABOUT = {
  Pies: (name) =>
    `${name} to przyjazny i energiczny pies, który uwielbia kontakt z człowiekiem. Jest gotowy, by znaleźć swój nowy dom i prawdziwą rodzinę.`,
  Kot: (name) =>
    `${name} to delikatny i spokojny kot, który szuka troskliwego domu. Po krótkim czasie aklimatyzacji staje się oddanym towarzyszem.`,
  default: (name) =>
    `${name} to zwierzę pod opieką naszego schroniska. Jest łagodne, przyzwyczajone do kontaktu z ludźmi i gotowe do adopcji.`,
};

function getInfoRows(animal) {
  return [
    { icon: "fa-paw",          label: "Typ",         value: animal.type,                 color: "#3a7db8", bg: "rgba(110,168,216,0.12)" },
    { icon: "fa-heart",        label: "Status",      value: animal.status,               color: "#2d9b72", bg: "rgba(95,191,160,0.12)"  },
    { icon: "fa-building",     label: "Schronisko",  value: "Miejskie Schronisko",       color: "#7a62b8", bg: "rgba(167,141,208,0.12)" },
    { icon: "fa-location-dot", label: "Lokalizacja", value: "Warszawa, PL",              color: "#7a62b8", bg: "rgba(167,141,208,0.12)" },
    { icon: "fa-calendar",     label: "Wiek",        value: animal.age  ?? "ok. 2 lata", color: "#3a7db8", bg: "rgba(110,168,216,0.12)" },
    { icon: "fa-venus-mars",   label: "Płeć",        value: animal.sex  ?? "Samiec",     color: "#2d9b72", bg: "rgba(95,191,160,0.12)"  },
  ];
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonBlock({ className }) {
  return <div className={`${styles.skel} ${className || ""}`} />;
}

function SkelCard({ children, stretch }) {
  return (
    <div className={`${styles.skelCard} ${stretch ? styles.skelCardStretch : ""}`}>
      {children}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <main className={styles.wrapper}>
      <SkeletonBlock className={styles.skelBack} />

      <div className={styles.skelHeaderRow}>
        <div>
          <SkeletonBlock className={styles.skelTitle} />
          <div className={styles.skelPillsRow}>
            <SkeletonBlock className={styles.skelPill} />
            <SkeletonBlock className={styles.skelPill} />
          </div>
        </div>
        <div className={styles.skelBtnGroup}>
          <SkeletonBlock className={styles.skelBtnFav} />
          <SkeletonBlock className={styles.skelBtnAdopt} />
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.left}>
          <SkeletonBlock className={styles.skelImg} />
          <SkelCard>
            <SkeletonBlock className={styles.skelCardTitle} />
            <SkeletonBlock className={styles.skelLine} />
            <SkeletonBlock className={styles.skelLineMid} />
          </SkelCard>
        </div>

        <div className={styles.right}>
          <SkelCard>
            <SkeletonBlock className={styles.skelCardTitle} />
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles.skelInfoRow}>
                <SkeletonBlock className={styles.skelInfoCircle} />
                <div className={styles.skelInfoText}>
                  <SkeletonBlock className={styles.skelInfoLabel} />
                  <SkeletonBlock className={styles.skelInfoValue} />
                </div>
              </div>
            ))}
          </SkelCard>

          <SkelCard stretch>
            <SkeletonBlock className={styles.skelCardTitle} />
            <div className={styles.skelTagRow}>
              <SkeletonBlock className={`${styles.skelTag} ${styles.skelTagMd}`} />
              <SkeletonBlock className={`${styles.skelTag} ${styles.skelTagLg}`} />
              <SkeletonBlock className={`${styles.skelTag} ${styles.skelTagMd}`} />
            </div>
          </SkelCard>
        </div>
      </div>
    </main>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AnimalDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [animal, setAnimal]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [adopted, setAdopted]   = useState(false);
  const [adopting, setAdopting] = useState(false);
  const [favoured, setFavoured] = useState(false);

  const auth     = getAuth();
  const role     = auth?.user?.role;
  const canAdopt = role === "user" || role === "volunteer";

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3001/animals/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Nie znaleziono zwierzęcia");
        return res.json();
      })
      .then((data) => { setAnimal(data); setLoading(false); })
      .catch((err)  => { setError(err.message); setLoading(false); });
  }, [id]);

  async function handleAdopt() {
    if (adopting || adopted) return;
    setAdopting(true);
    try {
      await authFetch("http://localhost:3001/adoptions", {
        method: "POST",
        body: JSON.stringify({ animalId: animal.id }),
      });
      setAdopted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setAdopting(false);
    }
  }

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <main className={styles.wrapper}>
        <div className={styles.errorState}>
          <i className="fa-solid fa-triangle-exclamation" />
          <p>{error}</p>
          <button className={styles.back} onClick={() => router.push("/animals")}>
            ← Wróć do listy
          </button>
        </div>
      </main>
    );
  }

  const traits      = TRAITS[animal.type] ?? TRAITS.default;
  const about       = (ABOUT[animal.type] ?? ABOUT.default)(animal.name);
  const isAvailable = animal.status === "Do adopcji";
  const infoRows    = getInfoRows(animal);

  return (
    <main className={styles.wrapper}>
      <button className={styles.back} onClick={() => router.push("/animals")}>
        <i className="fa-solid fa-arrow-left" />
        Powrót do listy
      </button>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.nameBlock}>
          <h1 className={styles.animalName}>{animal.name}</h1>
          <div className={styles.pills}>
            <span className={`${styles.pill} ${styles.pillBlue}`}>{animal.type}</span>
            <span className={`${styles.pill} ${styles.pillGreen}`}>{animal.status}</span>
          </div>
        </div>

        {canAdopt && (
          <div className={styles.headerActions}>
            <button
              className={`${styles.favBtn} ${favoured ? styles.favBtnActive : ""}`}
              onClick={() => setFavoured((f) => !f)}
            >
              <i className={`fa-${favoured ? "solid" : "regular"} fa-heart`} />
              {favoured ? "W ulubionych" : "Ulubione"}
            </button>

            <button
              className={`${styles.adoptBtn} ${
                adopted      ? styles.adoptedBtn          :
                !isAvailable ? styles.adoptBtnUnavailable : ""
              }`}
              onClick={isAvailable && !adopted ? handleAdopt : undefined}
              disabled={adopting || adopted || !isAvailable}
            >
              <i className={`fa-solid ${adopted ? "fa-check" : "fa-house-chimney"}`} />
              {adopted ? "Zgłoszono" : adopting ? "Wysyłanie…" : isAvailable ? "Zgłoś adopcję" : "Niedostępne"}
            </button>
          </div>
        )}
      </div>

      {/* ── Main grid ── */}
      <div className={styles.grid}>

        {/* ─── LEFT: photo only ─── */}
        <div className={styles.imageCard}>
          {animal.image ? (
            <img
              src={`http://localhost:3001${animal.image}`}
              alt={animal.name}
              className={styles.animalImage}
            />
          ) : (
            <div className={styles.noImage}>
              <i className="fa-solid fa-paw" />
            </div>
          )}
        </div>

        {/* ─── RIGHT: info only ─── */}
        <div className={styles.card}>
          <p className={styles.cardHeading}>Informacje</p>
          <div className={styles.infoList}>
            {infoRows.map((row) => (
              <div key={row.label} className={styles.infoRow}>
                <div
                  className={styles.infoIconCircle}
                  style={{ color: row.color, background: row.bg }}
                >
                  <i className={`fa-solid ${row.icon}`} />
                </div>
                <div className={styles.infoText}>
                  <span className={styles.infoLabel}>{row.label}</span>
                  <span className={styles.infoValue}>{row.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: O zwierzęciu + Charakter ── */}
      <div className={styles.bottomRow}>
        <div className={styles.card}>
          <p className={styles.cardHeading}>O zwierzęciu</p>
          <p className={styles.aboutText}>{about}</p>
        </div>

        <div className={styles.card}>
          <p className={styles.cardHeading}>Charakter</p>
          <div className={styles.traitsGrid}>
            {traits.map((t) => (
              <span
                key={t.label}
                className={`${styles.traitTag} ${styles["trait" + t.color]}`}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
