# Animal Help App

Aplikacja wieloserwisowa dla schroniska dla zwierząt — zarządzanie adopcjami, wolontariatem i zadaniami. Działa przez Docker Compose lub w klastrze Kubernetes z CI/CD przez GitHub Actions.

## Co robi aplikacja

- pozwala użytkownikom przeglądać zwierzęta i składać wnioski o adopcję
- admin zarządza zwierzętami — dodaje je, zmienia status, akceptuje lub odrzuca adopcje
- wolontariusze zapisują się na zadania tworzone przez admina
- admin widzi statystyki i zarządza całą aplikacją z poziomu dashboardu
- obsługa zdjęć — upload przy dodawaniu zwierzęcia, przechowywanie na wolumenie

## Stack

- **Frontend** — Next.js 16 (App Router)
- **Backend** — Node.js / Express 5
- **Baza danych** — PostgreSQL 17
- **Infrastruktura** — Kubernetes (Docker Desktop), nginx Ingress
- **CI/CD** — GitHub Actions + GHCR

## Uruchomienie

### Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Uzupełnij `.env` własnymi wartościami:

```
POSTGRES_PASSWORD=twoje_haslo
JWT_SECRET=twoj_dlugi_losowy_klucz
```

Aplikacja dostępna pod `http://localhost:3000`.

### Kubernetes

Pełna instrukcja w [KUBERNETES.md](KUBERNETES.md).

## Struktura projektu

```
animal-help-app/
├── backend/
│   ├── images/           # zdjęcia zwierząt (seed + upload)
│   ├── Dockerfile
│   ├── server.js         # Express API
│   ├── init.sql          # schemat PostgreSQL
│   ├── seed.sql          # dane startowe (53 zwierzęta, 22 użytkownicy)
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── (app)/        # chronione trasy (dashboard, zwierzęta, adopcje, wolontariat)
│   │   └── (auth)/       # logowanie i rejestracja
│   ├── components/       # UI: admin, animals, volunteer, user
│   ├── utils/            # auth, api helper, config
│   ├── Dockerfile
│   └── package.json
├── k8s/
│   ├── postgres/         # Deployment, Service, PVC, ConfigMap (SQL)
│   ├── backend/          # Deployment, Service, PVC
│   ├── frontend/         # Deployment, Service
│   ├── namespace.yaml
│   ├── secret.yaml
│   ├── configmap.yaml
│   ├── ingress.yaml
│   └── pdb.yaml
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── KUBERNETES.md
└── README.md
```

## Role użytkowników

- **Admin** — zarządzanie zwierzętami, adopcjami i zadaniami
- **Wolontariusz** — przeglądanie zadań i zapisywanie się na nie
- **Użytkownik** — przeglądanie zwierząt i składanie wniosków o adopcję

## Architektura bazy danych

PostgreSQL działa jako Deployment z PersistentVolumeClaim zamiast StatefulSet, ponieważ aplikacja wymaga jednej instancji bazy bez replikacji. Dane przeżywają restarty podów i aktualizacje deploymentu.

## CI/CD

Każdy push do `main` uruchamia workflow który buduje i pushuje obrazy Docker na GHCR:
- `ghcr.io/jpolchowska/animal-help-backend:latest`
- `ghcr.io/jpolchowska/animal-help-frontend:latest`
