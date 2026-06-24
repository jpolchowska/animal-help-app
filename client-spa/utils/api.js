import { getKeycloakInstance } from "@/utils/keycloak";

function extractRole(parsed) {
  if (!parsed) return null;
  const roles = parsed.realm_access?.roles || [];
  return roles.find(r => ["admin", "user", "volunteer"].includes(r)) || null;
}

export function getAuth() {
  if (typeof window === "undefined") return null;
  const kc = getKeycloakInstance();
  if (!kc?.authenticated) return null;
  return {
    token: kc.token,
    user: {
      email: kc.tokenParsed?.email,
      name: kc.tokenParsed?.given_name || kc.tokenParsed?.preferred_username,
      role: extractRole(kc.tokenParsed),
    },
  };
}

export async function authFetch(url, options = {}) {
  const kc = getKeycloakInstance();

  if (kc?.authenticated) {
    try {
      await kc.updateToken(30);
    } catch {
      kc.login();
      return;
    }
  }

  const headers = options.isFormData ? {} : { "Content-Type": "application/json" };

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      Authorization: `Bearer ${kc?.token}`,
      ...options.headers,
    },
  });
}
