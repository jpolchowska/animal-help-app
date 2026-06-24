"use client";

import styles from "./Volunteer.module.css";
import { authFetch } from "@/utils/api";
import { API_URL } from "@/utils/config";
import { getKeycloakInstance } from "@/utils/keycloak";

export default function VolunteerJoin({ onBecameVolunteer }) {
  async function join() {
    const res = await authFetch(`${API_URL}/volunteer/join`, { method: "POST" });
    if (res?.ok) {
      getKeycloakInstance()?.logout({ redirectUri: window.location.origin });
    }
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
