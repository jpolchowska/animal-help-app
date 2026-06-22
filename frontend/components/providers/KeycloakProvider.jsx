"use client";

import { useEffect, useState } from "react";
import { setKeycloakInstance } from "@/utils/keycloak";

export default function KeycloakProvider({ children }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    import("keycloak-js").then(({ default: Keycloak }) => {
      const kc = new Keycloak({
        url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
        realm: "animal-help-app",
        clientId: "frontend-spa",
      });

      setKeycloakInstance(kc);

      kc.init({ onLoad: "login-required", pkceMethod: "S256" })
        .then(() => setInitialized(true))
        .catch(() => setInitialized(true));
    });
  }, []);

  if (!initialized) return null;

  return children;
}
