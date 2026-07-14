# Animal Help App

A multi-service application for an animal shelter — managing adoptions, volunteering, and tasks. Built on an OAuth2 architecture with Keycloak as the Authorization Server. Runs via Docker Compose.

## Features

- browse animals available for adoption and submit adoption applications
- admin panel — add animals, change statuses, accept and reject adoptions
- volunteer system — admin creates tasks, volunteers sign up for them
- dashboard with shelter statistics
- photo handling — upload when adding an animal, stored on a volume
- login and registration via Keycloak (OAuth2 + OpenID Connect)
- Google OAuth2 login with profile preview
- two-factor authentication (2FA / OTP)

## Stack

- **Authorization Server** — Keycloak 24
- **Resource Server** — Node.js / Express
- **Client SPA** — Next.js (App Router) + keycloak-js
- **Client SSR** — Node.js / Express + EJS
- **Client B2B** — Node.js (Client Credentials Flow)
- **Database** — PostgreSQL 17
- **Infrastructure** — Docker Compose

## Getting Started

```bash
cp .env.example .env
docker compose up --build
```

Fill in `.env` with your own values:

```env
POSTGRES_PASSWORD=        # PostgreSQL database password
SSR_CLIENT_SECRET=        # SSR client secret from Keycloak
B2B_CLIENT_SECRET=        # B2B client secret from Keycloak
GOOGLE_CLIENT_ID=         # Client ID from Google Cloud Console
GOOGLE_CLIENT_SECRET=     # Client Secret from Google Cloud Console
```

## Services

| Service | URL |
|---|---|
| SPA | http://localhost:3000 |
| Resource Server | http://localhost:3001 |
| SSR | http://localhost:3002 |
| B2B | http://localhost:3003 |
| Keycloak | http://localhost:8080 |

## Project Structure

```
animal-help-app/
├── auth-server/          # Keycloak configuration (realm-export.json)
├── resource-server/      # REST API, JWT validation, PostgreSQL
├── client-spa/           # SPA client (Next.js + keycloak-js, PKCE)
├── client-ssr/           # SSR client (Express + EJS, Authorization Code)
├── client-b2b/           # B2B client (Client Credentials)
├── k8s/                  # Kubernetes manifests
├── docs/                 # Additional documentation
├── .github/workflows/    # CI/CD — GitHub Actions
├── docker-compose.yml
├── .env.example
└── README.md
```

## User Roles

- **Admin** — manage animals, adoptions, tasks, and volunteers
- **Volunteer** — browse tasks and sign up for them
- **User** — browse animals and submit adoption applications

## OAuth2 Architecture

| Module | OAuth2 Role | Flow |
|---|---|---|
| Keycloak | Authorization Server | — |
| resource-server | Resource Server | JWT / JWKS |
| client-spa | Public Client | Authorization Code + PKCE |
| client-ssr | Confidential Client | Authorization Code + PKCE |
| client-b2b | Confidential Client | Client Credentials |

Detailed OAuth2 implementation documentation: [docs/OAUTH2.md](docs/OAUTH2.md).

## Pending Updates

- **Kubernetes** — cluster configuration in [docs/KUBERNETES.md](docs/KUBERNETES.md) is from a previous version of the application and is outdated; needs to be updated for the current multi-service architecture
- **CI/CD** — GitHub Actions pipeline is temporarily disabled; needs to be rewritten for the current stack and environment
