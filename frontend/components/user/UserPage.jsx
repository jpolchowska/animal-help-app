import styles from "./UserPage.module.css";

export default function UserPage() {
  return (
    <main>
      <section className={styles.hero}>
        <h2>Witaj w Animal Help App!</h2>
        <p>
          Jest to platforma demonstracyjna wspierająca adopcję,
          wolontariat oraz zgłoszenia pomocy dla zwierząt.
        </p>
      </section>

      <section className={styles.cards}>
        <div className={styles.card}>
          <h3>Zwierzęta</h3>
          <p>Przeglądaj listę zwierząt wymagających pomocy lub adopcji.</p>
        </div>

        <div className={styles.card}>
          <h3>Adopcje</h3>
          <p>Zgłaszaj chęć adopcji i śledź status zgłoszeń.</p>
        </div>

        <div className={styles.card}>
          <h3>Wolontariat</h3>
          <p>Dołącz do wolontariuszy i pomagaj tam, gdzie potrzeba.</p>
        </div>
      </section>
    </main>
  );
}