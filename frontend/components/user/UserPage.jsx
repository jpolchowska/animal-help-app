import styles from "./UserPage.module.css";
import Link from "next/link";

export default function UserPage() {
  return (
    <main>
      {/* HERO */}
      <section className={styles.hero}>
        <h2>Witaj w Animal Help App!</h2>
        <p>
          Animal Help App to aplikacja wspierająca adopcję zwierząt, wolontariat
          oraz działania na rzecz podopiecznych schroniska.
        </p>
      </section>

      {/* KARTY NAWIGACYJNE */}
      <section className={styles.cards}>
        <Link href="/animals" className={styles.card}>
          <h3>Zwierzęta</h3>
          <p>Przeglądaj zwierzęta dostępne do adopcji.</p>
          <div className={styles.imageWrapper}>
            <img src="/animals.png" alt="Zwierzęta" className={styles.icon} />
          </div>
        </Link>

        <Link href="/adoptions" className={styles.card}>
          <h3>Adopcje</h3>
          <p>Zgłaszaj zgłoszenia adopcyjne i śledź ich status.</p>
          <div className={styles.imageWrapper}>
            <img src="/adoptions.png" alt="Adopcje" className={styles.icon} />
          </div>
        </Link>

        <Link href="/volunteer" className={styles.card}>
          <h3>Wolontariat</h3>
          <p>Dołącz do grona naszych wolontariuszy.</p>
          <div className={styles.imageWrapper}>
            <img src="/volunteer.png" alt="Wolontariat" className={styles.icon} />
          </div>
        </Link>
      </section>

      {/* MINI STATYSTYKI */}
      <section className={styles.stats}>
        <div className={styles.stat}>
          <i className="fa-solid fa-dog" />
          <strong>128</strong>
          <span>Zwierząt pod opieką</span>
        </div>
        <div className={styles.stat}>
          <i className="fa-solid fa-heart" />
          <strong>54</strong>
          <span>Udało się adoptować</span>
        </div>
        <div className={styles.stat}>
          <i className="fa-solid fa-hand-holding-heart" />
          <strong>23</strong>
          <span>Aktywnych wolontariuszy</span>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h3>Chcesz pomóc?</h3>
        <p>
          Każda adopcja i każda godzina wolontariatu realnie
          zmienia życie zwierząt.
        </p>
        <Link href="/animals" className={styles.ctaButton}>
          Zobacz zwierzęta
        </Link>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <span>Animal Help App</span>
        <span>© 2026</span>
      </footer>
    </main>
  );
}