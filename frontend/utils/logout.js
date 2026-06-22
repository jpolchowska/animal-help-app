import { getKeycloakInstance } from "@/utils/keycloak";

export function logout() {
  getKeycloakInstance()?.logout({ redirectUri: window.location.origin });
}
