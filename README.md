# Animal Help App

Aplikacja wieloserwisowa dla schroniska dla zwierząt — zarządzanie adopcjami, wolontariatem i zadaniami. Uruchamiana w Kubernetes z CI/CD przez GitHub Actions.

## Stack

- **Frontend** — Next.js 16
- **Backend** — Node.js / Express
- **Baza danych** — PostgreSQL 17
- **Infrastruktura** — Kubernetes (kind), nginx Ingress
- **CI/CD** — GitHub Actions + GHCR

## Uruchomienie

Pełna instrukcja uruchomienia na kind/minikube/k3d w [CHECKLIST.md](CHECKLIST.md).

## Struktura projektu

```
├── backend/          # Node.js API
├── frontend/         # Next.js app
├── k8s/              # Manifesty Kubernetes
│   ├── postgres/
│   ├── backend/
│   ├── frontend/
│   └── ingress.yaml
├── docker-compose.yml
└── CHECKLIST.md
```

## Role użytkowników

- **Admin** — zarządzanie zwierzętami, adopcjami i zadaniami
- **Wolontariusz** — przeglądanie zadań i zapisywanie się na nie
- **Użytkownik** — przeglądanie zwierząt i składanie wniosków o adopcję

## Architektura bazy danych

PostgreSQL działa jako Deployment z PersistentVolumeClaim zamiast StatefulSet, ponieważ aplikacja używa jednej instancji bazy danych, dla której PVC zapewnia wymaganą trwałość danych. Dane przeżywają restarty podów i aktualizacje deploymentu.

## CI/CD

Każdy push do `main` uruchamia workflow który buduje i pushuje obrazy Docker na GHCR:
- `ghcr.io/jpolchowska/animal-help-backend:latest`
- `ghcr.io/jpolchowska/animal-help-frontend:latest`
