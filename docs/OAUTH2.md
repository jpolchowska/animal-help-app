# OAuth2 — Bezpieczeństwo aplikacji webowych

Dokumentacja implementacji OAuth2 na potrzeby projektu zaliczeniowego.

## Zrealizowane wymagania

### Authorization Server
- Keycloak 24 jako Authorization Server
- Realm `animal-help-app` z klientami: `spa-client`, `ssr-client`, `b2b-client`
- Role realmowe: `admin`, `volunteer`, `user`
- Rejestracja użytkowników przez Keycloak (domyślna rola `user`)
- Reset hasła (Forgot password)
- 2FA / MFA przez Google Authenticator (OTP)
- Eksport konfiguracji realm (`auth-server/realm-export.json`) — auto-import przy starcie

### Resource Server
- Walidacja tokenów JWT przez JWKS (bez bibliotek, ręczna weryfikacja podpisu RS256)
- Endpoint JWKS: `http://keycloak:8080/realms/animal-help-app/protocol/openid-connect/certs`
- JIT provisioning użytkowników (INSERT ON CONFLICT)
- Zarządzanie rolami przez Keycloak Admin REST API

### Client SPA (Next.js)
- Authorization Code Flow + PKCE przez `keycloak-js`
- Automatyczne odświeżanie tokenów (`updateToken`)
- Widoki warunkowe w zależności od roli

### Client SSR (Node.js + Express)
- Authorization Code Flow + PKCE (Confidential Client)
- Sesja serwerowa (`express-session`)
- Integracja z Google OAuth2 — Authorization Code Flow → Google People API

### Client B2B (Node.js)
- Client Credentials Flow
- Raport analityczny ze schroniska (dostęp maszynowy do resource server)

## Zewnętrzne API OAuth2

Klient SSR (`client-ssr`) integruje się z Google OAuth2:

1. `GET /google` — przekierowanie do Google Authorization Server
2. Google zwraca `code` na `GET /google/callback`
3. Wymiana `code` na `access_token` (`https://oauth2.googleapis.com/token`)
4. Wywołanie Google People API (`https://www.googleapis.com/oauth2/v3/userinfo`)
5. Wyświetlenie danych profilu użytkownika

## Uruchomienie od zera

```bash
git clone <repo>
cp .env.example .env
# Uzupełnij .env
docker compose up --build
```

Keycloak automatycznie importuje realm `animal-help-app` z `auth-server/realm-export.json`.
