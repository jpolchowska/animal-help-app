"use client";

import { useState, useEffect } from "react";
import { getAuth } from "@/utils/api";
import styles from "./page.module.css";

// ─── Mock data ───────────────────────────────────────────────────────────────

const CAMPAIGNS = [
  {
    id: 1,
    title: "Operacja kręgosłupa dla Borysa",
    description: "Borys wymaga pilnej operacji kręgosłupa. Bez zabiegu straci możliwość chodzenia. Każdy dzień zwłoki pogarsza jego rokowania.",
    category: "leczenie",
    collected: 4200,
    goal: 6500,
    donors: 47,
    daysLeft: 12,
    urgent: true,
    animal: "Borys",
  },
  {
    id: 2,
    title: "Karma na zimę — 200 porcji",
    description: "Przed nami trudne miesiące. Potrzebujemy zapasów karmy dla 80 podopiecznych na całą zimę.",
    category: "karma",
    collected: 1850,
    goal: 3000,
    donors: 29,
    daysLeft: 24,
    urgent: false,
    animal: null,
  },
  {
    id: 3,
    title: "Remont wybiegu dla kotów",
    description: "Stary wybieg wymaga gruntownego remontu. Nowe ogrodzenie, wiaty i zewnętrzne legowiska dla 30 kotów.",
    category: "schronisko",
    collected: 9100,
    goal: 12000,
    donors: 103,
    daysLeft: 45,
    urgent: false,
    animal: null,
  },
  {
    id: 4,
    title: "Leczenie Malinki — białaczka kotów",
    description: "Malinka trafiła do nas w ciężkim stanie. Cotygodniowe transfuzje i leczenie onkologiczne wymagają stałego finansowania.",
    category: "leczenie",
    collected: 2100,
    goal: 8000,
    donors: 31,
    daysLeft: 7,
    urgent: true,
    animal: "Malinka",
  },
  {
    id: 5,
    title: "Zimowe wyposażenie schroniska",
    description: "Kaloryfery, koce, ciepłe legowiska i osłony przeciwwiatrowe dla wszystkich wybiegów. Cel osiągnięty dzięki wam.",
    category: "schronisko",
    collected: 5600,
    goal: 5600,
    donors: 68,
    daysLeft: 0,
    urgent: false,
    animal: null,
  },
  {
    id: 6,
    title: "Dieta specjalna dla Grubasa",
    description: "Grubas wymaga specjalistycznej diety weterynaryjnej przez minimum 6 miesięcy ze względu na przewlekłą chorobę nerek.",
    category: "konkretne zwierzę",
    collected: 380,
    goal: 1200,
    donors: 12,
    daysLeft: 30,
    urgent: false,
    animal: "Grubas",
  },
  {
    id: 7,
    title: "Szczepienia profilaktyczne — wiosna",
    description: "Roczne szczepienia profilaktyczne dla 60 psów i 40 kotów. Bez nich nie możemy przyjmować nowych podopiecznych.",
    category: "leczenie",
    collected: 2900,
    goal: 4800,
    donors: 54,
    daysLeft: 18,
    urgent: false,
    animal: null,
  },
  {
    id: 8,
    title: "Wyprawka adopcyjna dla Loli",
    description: "Lola znalazła dom. Jej fundusz startowy pokryje pierwsze wizyty weterynaryjne, chip i podstawową wyprawkę.",
    category: "konkretne zwierzę",
    collected: 750,
    goal: 750,
    donors: 22,
    daysLeft: 0,
    urgent: false,
    animal: "Lola",
  },
];

const CATEGORY_CONFIG = {
  leczenie:            { label: "Leczenie",           accent: "#d97a7a" },
  karma:               { label: "Karma",              accent: "#d49060" },
  schronisko:          { label: "Schronisko",         accent: "#6ea8d8" },
  "konkretne zwierzę": { label: "Konkretne zwierzę",  accent: "#a78dd0" },
};

const ALL_CATEGORIES = [
  { id: "all",               label: "Wszystkie" },
  { id: "leczenie",          label: "Leczenie" },
  { id: "karma",             label: "Karma" },
  { id: "schronisko",        label: "Schronisko" },
  { id: "konkretne zwierzę", label: "Konkretne zwierzę" },
];

function fmt(n) {
  return n.toLocaleString("pl-PL");
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon, value, label, accent }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ color: accent, background: `${accent}18` }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
}

function ProgressBar({ pct, accent }) {
  const clamped = Math.min(pct, 100);
  const fill = pct >= 100 ? "#5fbfa0" : (accent ?? "#94a3b8");
  return (
    <div className={styles.progressTrack}>
      <div className={styles.progressFill} style={{ width: `${clamped}%`, background: fill }} />
    </div>
  );
}

function CampaignCard({ campaign, isAdmin }) {
  const cfg = CATEGORY_CONFIG[campaign.category];
  const pct = Math.round((campaign.collected / campaign.goal) * 100);
  const isComplete = campaign.daysLeft === 0 || pct >= 100;

  function handleDonate(e) {
    e.preventDefault();
    alert(`Dziękujemy za wsparcie zbiórki "${campaign.title}"!`);
  }

  return (
    <div className={`${styles.campaignCard} ${campaign.urgent && !isComplete ? styles.campaignCardUrgent : ""}`}>
      <div className={styles.cardAccent} style={{ background: cfg?.accent ?? "#cbd5e1" }} />

      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span className={styles.categoryLabel} style={{ color: cfg?.accent ?? "#94a3b8" }}>
            {cfg?.label ?? campaign.category}
          </span>
          {campaign.urgent && !isComplete && (
            <span className={styles.urgentLabel}>Pilne</span>
          )}
          {isComplete && (
            <span className={styles.completeLabel}>Zakończona</span>
          )}
          {isAdmin && (
            <div className={styles.adminActions}>
              <button className={styles.adminBtn} title="Edytuj zbiórkę">
                <i className="fa-solid fa-pen" />
              </button>
              <button className={styles.adminBtn} title="Archiwizuj">
                <i className="fa-solid fa-box-archive" />
              </button>
            </div>
          )}
        </div>

        <h3 className={styles.cardTitle}>{campaign.title}</h3>
        <p className={styles.cardDesc}>{campaign.description}</p>

        <div className={styles.progressSection}>
          <ProgressBar pct={pct} accent={cfg?.accent} />
          <div className={styles.progressFooter}>
            <span className={styles.collectedAmt}>{fmt(campaign.collected)} zł</span>
            <span className={styles.goalAmt}>cel: {fmt(campaign.goal)} zł</span>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <span className={styles.footerMeta}>
            {campaign.donors} darczyńców
            {campaign.daysLeft > 0 && ` · ${campaign.daysLeft} dni`}
          </span>
          {!isComplete && (
            <button
              className={`${styles.donateBtn} ${campaign.urgent ? styles.donateBtnUrgent : ""}`}
              onClick={handleDonate}
            >
              Wpłać
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <i className="fa-solid fa-piggy-bank" />
      </div>
      <p className={styles.emptyTitle}>Brak zbiórek w tej kategorii</p>
      <p className={styles.emptyText}>
        Nie ma tu aktywnych zbiórek. Sprawdź inną kategorię lub wróć później.
      </p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.skelCard}>
      <div className={styles.skelAccent} />
      <div className={styles.skelCardBody}>
        <div className={`${styles.skel} ${styles.skelBadge}`} />
        <div className={`${styles.skel} ${styles.skelCardTitle}`} />
        <div className={`${styles.skel} ${styles.skelLine}`} />
        <div className={`${styles.skel} ${styles.skelLineShort}`} />
        <div className={`${styles.skel} ${styles.skelBar}`} />
        <div className={styles.skelFooterRow}>
          <div className={`${styles.skel} ${styles.skelFooterText}`} />
          <div className={`${styles.skel} ${styles.skelFooterBtn}`} />
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FundraisingPage() {
  const [category, setCategory] = useState("all");
  const [loading, setLoading]   = useState(true);
  const [role, setRole]         = useState(null);

  useEffect(() => {
    const auth = getAuth();
    setRole(auth?.user?.role ?? "user");
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const isAdmin = role === "admin";

  const filtered =
    category === "all"
      ? CAMPAIGNS
      : CAMPAIGNS.filter((c) => c.category === category);

  const totalCollected     = CAMPAIGNS.reduce((s, c) => s + c.collected, 0);
  const activeCampaigns    = CAMPAIGNS.filter((c) => c.daysLeft > 0 && c.collected < c.goal).length;
  const totalDonors        = CAMPAIGNS.reduce((s, c) => s + c.donors, 0);
  const animalsInCampaigns = CAMPAIGNS.filter((c) => c.animal !== null).length;

  return (
    <main className={styles.wrapper}>

      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Zbiórki</h1>
          <p className={styles.pageSubtitle}>
            Wspieraj podopiecznych schroniska — każda złotówka ma znaczenie.
          </p>
        </div>
        {isAdmin && (
          <button className={styles.createBtn}>
            <i className="fa-solid fa-plus" />
            Utwórz zbiórkę
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsGrid}>
        {loading ? (
          <>
            <div className={`${styles.skel} ${styles.skelStat}`} />
            <div className={`${styles.skel} ${styles.skelStat}`} />
            <div className={`${styles.skel} ${styles.skelStat}`} />
            <div className={`${styles.skel} ${styles.skelStat}`} />
          </>
        ) : (
          <>
            <StatCard icon="fa-piggy-bank"         value={activeCampaigns}             label="Aktywne zbiórki"       accent="#6ea8d8" />
            <StatCard icon="fa-coins"              value={`${fmt(totalCollected)} zł`} label="Łącznie zebrano"        accent="#5fbfa0" />
            <StatCard icon="fa-paw"                value={animalsInCampaigns}          label="Zwierzęta w zbiórkach" accent="#a78dd0" />
            <StatCard icon="fa-hand-holding-heart" value={totalDonors}                 label="Wszystkich wpłat"       accent="#e0976a" />
          </>
        )}
      </div>

      {/* ── Category filter ── */}
      <div className={styles.filterRow}>
        {ALL_CATEGORIES.map((cat) => {
          const isActive = category === cat.id;
          const count = cat.id !== "all"
            ? CAMPAIGNS.filter((c) => c.category === cat.id).length
            : null;

          return (
            <button
              key={cat.id}
              className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ""}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
              {count !== null && (
                <span className={styles.filterCount}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className={styles.campaignGrid}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={styles.campaignGrid}>
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </main>
  );
}
