# Animal Help App

Aplikacja wieloserwisowa dla schroniska dla zwierząt — zarządzanie adopcjami, wolontariatem i zadaniami. Zbudowana w architekturze OAuth2 z Keycloak jako Authorization Server. Działa przez Docker Compose.

## Funkcjonalności

- przeglądanie zwierząt dostępnych do adopcji oraz składanie wniosków adopcyjnych
- panel admina — dodawanie zwierząt, zmiana statusów, akceptowanie i odrzucanie adopcji
- system wolontariatu — admin tworzy zadania, wolontariusze się na nie zapisują
- dashboard z statystykami schroniska
- obsługa zdjęć — upload przy dodawaniu zwierzęcia, przechowywanie na wolumenie
- logowanie i rejestracja przez Keycloak (OAuth2 + OpenID Connect)
- logowanie przez Google OAuth2 z podglądem profilu
- dwuskładnikowe uwierzytelnianie (2FA / OTP)

## Stack

- **Authorization Server** — Keycloak 24
- **Resource Server** — Node.js / Express
- **Client SPA** — Next.js (App Router) + keycloak-js
- **Client SSR** — Node.js / Express + EJS
- **Client B2B** — Node.js (Client Credentials Flow)
- **Baza danych** — PostgreSQL 17
- **Infrastruktura** — Docker Compose

## Uruchomienie

```bash
cp .env.example .env
docker compose up --build
```

Uzupełnij `.env` własnymi wartościami:

```env
POSTGRES_PASSWORD=        # hasło do bazy danych PostgreSQL
SSR_CLIENT_SECRET=        # client secret klienta SSR z Keycloak
B2B_CLIENT_SECRET=        # client secret klienta B2B z Keycloak
GOOGLE_CLIENT_ID=         # Client ID z Google Cloud Console
GOOGLE_CLIENT_SECRET=     # Client Secret z Google Cloud Console
```

## Serwisy

| Serwis | URL |
|---|---|
| SPA | http://localhost:3000 |
| Resource Server | http://localhost:3001 |
| SSR | http://localhost:3002 |
| B2B | http://localhost:3003 |
| Keycloak | http://localhost:8080 |

## Struktura projektu

```
animal-help-app/
├── auth-server/          # konfiguracja Keycloak (realm-export.json)
├── resource-server/      # API REST, walidacja JWT, PostgreSQL
├── client-spa/           # klient SPA (Next.js + keycloak-js, PKCE)
├── client-ssr/           # klient SSR (Express + EJS, Authorization Code)
├── client-b2b/           # klient B2B (Client Credentials)
├── k8s/                  # konfiguracja Kubernetes
├── docs/                 # dokumentacja dodatkowa
├── .github/workflows/    # CI/CD — GitHub Actions
├── docker-compose.yml
├── .env.example
└── README.md
```

## Role użytkowników

- **Admin** — zarządzanie zwierzętami, adopcjami, zadaniami i wolontariuszami
- **Wolontariusz** — przeglądanie zadań i zapisywanie się na nie
- **Użytkownik** — przeglądanie zwierząt i składanie wniosków o adopcję

## Architektura OAuth2

| Moduł | Rola OAuth2 | Flow |
|---|---|---|
| Keycloak | Authorization Server | — |
| resource-server | Resource Server | JWT / JWKS |
| client-spa | Public Client | Authorization Code + PKCE |
| client-ssr | Confidential Client | Authorization Code + PKCE |
| client-b2b | Confidential Client | Client Credentials |

Szczegółowa dokumentacja implementacji OAuth2: [docs/OAUTH2.md](docs/OAUTH2.md).

## Elementy wymagające aktualizacji

- **Kubernetes** — konfiguracja klastra w [docs/KUBERNETES.md](docs/KUBERNETES.md) pochodzi z poprzedniej wersji aplikacji i jest nieaktualna; wymaga dostosowania do obecnej architektury wieloserwisowej
- **CI/CD** — pipeline GitHub Actions jest tymczasowo wyłączony; wymaga przepisania pod aktualny stack i środowisko

