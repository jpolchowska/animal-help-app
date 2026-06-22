let _keycloak = null;

export function setKeycloakInstance(kc) {
  _keycloak = kc;
}

export function getKeycloakInstance() {
  return _keycloak;
}
