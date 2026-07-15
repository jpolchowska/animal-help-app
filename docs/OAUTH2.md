# OAuth2 — Web Application Security

OAuth2 implementation documentation for the project.

## Implemented Features

### Authorization Server
- Keycloak 24 as the Authorization Server
- Realm `animal-help-app` with clients: `frontend-spa`, `ssr-client`, `b2b-client`
- Realm roles: `admin`, `volunteer`, `user`
- User registration via Keycloak (default role `user`)
- Password reset (Forgot password)
- 2FA / MFA via Google Authenticator (OTP)
- Realm configuration export (`auth-server/realm-export.json`) — auto-imported on startup

### Resource Server
- JWT token validation via JWKS (no libraries — manual RS256 signature verification)
- JWKS endpoint: `http://keycloak:8080/realms/animal-help-app/protocol/openid-connect/certs`
- JIT user provisioning (INSERT ON CONFLICT)
- Role management via Keycloak Admin REST API

### Client SPA (Next.js)
- Authorization Code Flow + PKCE via `keycloak-js`
- Automatic token refresh (`updateToken`)
- Conditional views based on user role

### Client SSR (Node.js + Express)
- Authorization Code Flow + PKCE (Confidential Client)
- Server-side session (`express-session`)
- Google OAuth2 integration — Authorization Code Flow → Google UserInfo API

### Client B2B (Node.js)
- Client Credentials Flow
- Analytical shelter report (machine-to-machine access to resource server)

## External OAuth2 API

The SSR client (`client-ssr`) integrates with Google OAuth2:

1. `GET /google` — redirect to Google Authorization Server
2. Google returns `code` to `GET /google/callback`
3. Exchange `code` for `access_token` (`https://oauth2.googleapis.com/token`)
4. Call Google UserInfo API (`https://www.googleapis.com/oauth2/v3/userinfo`)
5. Display user profile data

## Running from Scratch

```bash
git clone <repo>
cp .env.example .env
# Fill in .env
docker compose up --build
```

Keycloak automatically imports the `animal-help-app` realm from `auth-server/realm-export.json`.
