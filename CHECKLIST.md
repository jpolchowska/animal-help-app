# CHECKLIST — Animal Help App

## Wymagania wstępne

- Docker Desktop z włączonym Kubernetes
- `kubectl`
- Git

> Przetestowano na **Docker Desktop (kind)** na macOS i Windows.

## Uruchomienie

### 1. Sklonuj repozytorium

```bash
git clone https://github.com/jpolchowska/animal-help-app.git
cd animal-help-app
```

### 2. Zainstaluj nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/cloud/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

### 3. Dodaj wpisy do /etc/hosts

**macOS / Linux:**
```bash
echo "127.0.0.1 animal-help-app.local api.animal-help-app.local" | sudo tee -a /etc/hosts
```

**Windows** (Administrator) — dodaj do `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 animal-help-app.local api.animal-help-app.local
```

### 4. Zaaplikuj manifesty

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/pdb.yaml
```

### 5. Sprawdź gotowość podów

```bash
kubectl get pods -n animal-help-app
```

### 6. Otwórz aplikację

```
http://animal-help-app.local
```

---

## Zasoby Kubernetes

| Zasób | Nazwa | Port / Szczegóły |
|-------|-------|-----------------|
| Namespace | animal-help-app | — |
| Secret | animal-help-secret | DATABASE_URL, JWT_SECRET, POSTGRES_PASSWORD |
| ConfigMap | animal-help-config | PORT, NODE_ENV, NEXT_PUBLIC_API_URL |
| ConfigMap | postgres-init | schemat SQL + dane startowe |
| PVC | postgres-pvc | 1Gi |
| PVC | backend-images-pvc | 500Mi |
| Deployment | backend | 3001 · image: `animal-help-backend` · 2 repliki |
| Deployment | frontend | 3000 · image: `animal-help-frontend` |
| Deployment | postgres | 5432 |
| Service | backend-service | ClusterIP · 3001 |
| Service | frontend-service | ClusterIP · 3000 |
| Service | postgres-service | ClusterIP · 5432 (tylko wewnętrznie) |
| Ingress | animal-help-ingress | `animal-help-app.local` · `api.animal-help-app.local` |
| PodDisruptionBudget | backend-pdb | minAvailable: 1 |


> **Baza danych jako Deployment zamiast StatefulSet:** aplikacja wymaga jednej instancji PostgreSQL bez replikacji. Trwałość danych zapewnia PVC (`postgres-pvc`).

---

## Komendy kubectl

```bash
# Czy klaster działa?
kubectl get nodes

# Dostępne namespace'y
kubectl get ns


# Wszystkie zasoby aplikacji
kubectl get all -n animal-help-app

# Deploymenty
kubectl get deploy -n animal-help-app

# Service
kubectl get svc -n animal-help-app

# Ingress
kubectl get ingress -n animal-help-app

# PVC (PersistentVolumeClaim - trwałe dane)
kubectl get pvc -n animal-help-app

# ConfigMap
kubectl get configmap -n animal-help-app

# Secret
kubectl get secret -n animal-help-app

# PodDisruptionBudget
kubectl get pdb -n animal-help-app


# Lista podów
kubectl get pods -n animal-help-app

# Szczegóły konkretnego poda
kubectl describe pod <POD_NAME> -n animal-help-app


# SPRAWDZENIE ROLLOUTÓW

# Backend
kubectl rollout status deployment/backend -n animal-help-app

# Frontend
kubectl rollout status deployment/frontend -n animal-help-app

# PostgreSQL
kubectl rollout status deployment/postgres -n animal-help-app


# SPRAWDZENIE DEPLOYMENTÓW

# Backend
kubectl describe deployment backend -n animal-help-app

# Frontend
kubectl describe deployment frontend -n animal-help-app

# PostgreSQL
kubectl describe deployment postgres -n animal-help-app


# LOGI

# Logi backendu
kubectl logs -n animal-help-app deployment/backend

# Logi backendu na żywo
kubectl logs -f -n animal-help-app deployment/backend

# Logi frontendu
kubectl logs -n animal-help-app deployment/frontend

# Logi PostgreSQL
kubectl logs -n animal-help-app deployment/postgres


# POSTGRES

# Wejście do PostgreSQL
kubectl exec -it deployment/postgres -n animal-help-app -- psql -U postgres

# Lista tabel
\dt

# Zwierzęta
SELECT COUNT(*) FROM animals;

# Użytkownicy
SELECT COUNT(*) FROM users;

# Zadania wolontariuszy
SELECT COUNT(*) FROM tasks;

# Wyjście z PostgreSQL
\q


# TEST TRWAŁOŚCI DANYCH (PVC)

# Usuń pod PostgreSQL
kubectl delete pod -n animal-help-app -l app=postgres

# Zaczekaj na odtworzenie podów
kubectl get pods -n animal-help-app

# Sprawdź ponownie bazę:
kubectl exec -it deployment/postgres -n animal-help-app -- psql -U postgres

SELECT COUNT(*) FROM animals;


# CONFIGMAP

# Szczegóły ConfigMap aplikacji
kubectl describe configmap animal-help-config -n animal-help-app

# Skrypty inicjalizujące PostgreSQL
kubectl describe configmap postgres-init -n animal-help-app


# Szczegóły Secret
kubectl describe secret animal-help-secret -n animal-help-app


# Szczegóły PodDisruptionBudget
kubectl describe pdb backend-pdb -n animal-help-app


# HEALTHCHECK BACKENDU

# Port-forward do backendu
kubectl port-forward -n animal-help-app service/backend-service 3001:3001

# W drugim terminalu:
curl http://localhost:3001/healthz

# Oczekiwany wynik:
# {"status":"ok","database":"connected"}


# ZWIĘKSZENIE LICZBY REPLIK BACKENDU

kubectl scale deployment backend \
--replicas=3 \
-n animal-help-app

kubectl get deploy -n animal-help-app


# AKTUALIZACJA OBRAZU

kubectl rollout restart deployment/backend \
-n animal-help-app

kubectl rollout status deployment/backend \
-n animal-help-app


# USUNIĘCIE WSZYSTKICH PODÓW APLIKACJI

kubectl delete pods --all -n animal-help-app


# USUNIĘCIE KONKRETNEGO PODA

kubectl delete pod <NAZWA_PODA> -n animal-help-app
```

---

## Weryfikacja funkcjonalności (curl)

### Health check

```bash
curl http://api.animal-help-app.local/healthz
```
```json
{"status":"ok","database":"connected"}
```

### Odczyt zwierząt (zasób publiczny)

```bash
curl http://api.animal-help-app.local/animals
```
```json
[{"id":17,"name":"Piorun","type":"pies","status":"Do adopcji",...}]
```

---

## Test trwałości danych

```bash
# Sprawdź dane przed restartem
curl http://api.animal-help-app.local/metrics

# Usuń pod bazy
kubectl delete pod -n animal-help-app -l app=postgres

# Poczekaj aż wróci
kubectl wait --for=condition=ready pod -l app=postgres -n animal-help-app --timeout=60s

# Dane nadal dostępne
curl http://api.animal-help-app.local/metrics
```

Liczba rekordów przed i po restarcie powinna być identyczna.

---

## Obserwowalność

```bash
curl http://api.animal-help-app.local/metrics
```
```json
{"animals_total":40,"users_total":20,"adoptions_total":9,"tasks_total":2}
```

```bash
kubectl logs -n animal-help-app deployment/backend
kubectl logs -n animal-help-app deployment/postgres
```

---

## CI/CD — GitHub Actions

Workflow uruchamia się automatycznie przy każdym push do gałęzi `main`.

Kroki:
1. Buduje obrazy Docker (backend i frontend)
2. Pushuje do GitHub Container Registry (GHCR)
3. Waliduje manifesty (`--dry-run`)
4. Aplikuje manifesty na klastrze kind
5. Weryfikuje rollout i health check

Obrazy:
- `ghcr.io/jpolchowska/animal-help-backend:latest`
- `ghcr.io/jpolchowska/animal-help-frontend:latest`

**Link do ostatniego udanego workflow:**
https://github.com/jpolchowska/animal-help-app/actions/runs/26822164741

---

## Czyszczenie

```bash
kubectl delete namespace animal-help-app
```
