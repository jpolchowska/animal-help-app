"use client";

import styles from "./Volunteer.module.css";
import { authFetch } from "@/utils/api";
import { API_URL } from "@/utils/config";

export default function VolunteerJoin({ onBecameVolunteer }) {
  async function join() {
    await authFetch(`${API_URL}/volunteer/join`, { method: "POST" });
    const stored = localStorage.getItem("auth");
    if (stored) {
      const auth = JSON.parse(stored);
      auth.user.role = "volunteer";
      localStorage.setItem("auth", JSON.stringify(auth));
    }
    window.dispatchEvent(new Event("auth-changed"));
    onBecameVolunteer();
  }

  return (
    <section>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Wolontariat</h1>
          <p className={styles.pageSubtitle}>Dołącz do grona wolontariuszy i pomagaj zwierzętom.</p>
        </div>
      </div>

      <div className={styles.joinWrap}>
        <div className={styles.joinIcon}>
          <i className="fa-solid fa-handshake-angle" />
        </div>
        <h2 className={styles.joinTitle}>Zostań wolontariuszem</h2>
        <p className={styles.joinText}>
          Aby uzyskać dostęp do zadań i kalendarza,<br />
          musisz dołączyć do programu wolontariatu.
        </p>
        <button className={styles.btnPrimary} onClick={join}>
          Dołącz teraz
        </button>
      </div>
    </section>
  );
}
