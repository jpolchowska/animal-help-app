import { getKeycloakInstance } from "@/utils/keycloak";

function extractRole(parsed) {
  if (!parsed) return null;
  const roles = parsed.realm_access?.roles || [];
  return roles.find(r => ["admin", "user", "volunteer"].includes(r)) || null;
}

export function getRole() {
  if (typeof window === "undefined") return null;
  return extractRole(getKeycloakInstance()?.tokenParsed);
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const kc = getKeycloakInstance();
  if (!kc?.authenticated) return null;
  return {
    email: kc.tokenParsed?.email,
    name: kc.tokenParsed?.given_name || kc.tokenParsed?.preferred_username,
    role: extractRole(kc.tokenParsed),
  };
}

export function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return getKeycloakInstance()?.authenticated || false;
}

export function logout() {
  getKeycloakInstance()?.logout({ redirectUri: window.location.origin });
}
