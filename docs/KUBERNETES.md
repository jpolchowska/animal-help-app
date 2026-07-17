# Kubernetes — Animal Help App

## Prerequisites

- Docker Desktop with Kubernetes enabled
- `kubectl`
- Git

> Tested on **Docker Desktop (kind)** on macOS and Windows.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/jpolchowska/animal-help-app.git
cd animal-help-app
```

### 2. Install nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/cloud/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

### 3. Add entries to /etc/hosts

**macOS / Linux:**
```bash
echo "127.0.0.1 animal-help-app.local api.animal-help-app.local" | sudo tee -a /etc/hosts
```

**Windows** (Administrator) — add to `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 animal-help-app.local api.animal-help-app.local
```

### 4. Apply manifests

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

### 5. Check pod readiness

```bash
kubectl get pods -n animal-help-app
```

### 6. Open the application

```
http://animal-help-app.local
```

---

## Kubernetes Resources

| Resource | Name | Port / Details |
|-------|-------|-----------------|
| Namespace | animal-help-app | — |
| Secret | animal-help-secret | DATABASE_URL, JWT_SECRET, POSTGRES_PASSWORD |
| ConfigMap | animal-help-config | PORT, NODE_ENV, NEXT_PUBLIC_API_URL |
| ConfigMap | postgres-init | SQL schema + seed data |
| PVC | postgres-pvc | 1Gi |
| PVC | backend-images-pvc | 500Mi |
| Deployment | backend | 3001 · image: `animal-help-backend` · 2 replicas |
| Deployment | frontend | 3000 · image: `animal-help-frontend` |
| Deployment | postgres | 5432 |
| Service | backend-service | ClusterIP · 3001 |
| Service | frontend-service | ClusterIP · 3000 |
| Service | postgres-service | ClusterIP · 5432 (internal only) |
| Ingress | animal-help-ingress | `animal-help-app.local` · `api.animal-help-app.local` |
| PodDisruptionBudget | backend-pdb | minAvailable: 1 |


> **Database as Deployment instead of StatefulSet:** the application requires a single PostgreSQL instance without replication. Data persistence is ensured by the PVC (`postgres-pvc`).

---

## kubectl Commands

```bash
# Is the cluster running?
kubectl get nodes

# Available namespaces
kubectl get ns


# All application resources
kubectl get all -n animal-help-app

# Deployments
kubectl get deploy -n animal-help-app

# Services
kubectl get svc -n animal-help-app

# Ingress
kubectl get ingress -n animal-help-app

# PVC (PersistentVolumeClaim - persistent data)
kubectl get pvc -n animal-help-app

# ConfigMap
kubectl get configmap -n animal-help-app

# Secret
kubectl get secret -n animal-help-app

# PodDisruptionBudget
kubectl get pdb -n animal-help-app


# List pods
kubectl get pods -n animal-help-app

# Details of a specific pod
kubectl describe pod <POD_NAME> -n animal-help-app


# CHECK ROLLOUTS

# Backend
kubectl rollout status deployment/backend -n animal-help-app

# Frontend
kubectl rollout status deployment/frontend -n animal-help-app

# PostgreSQL
kubectl rollout status deployment/postgres -n animal-help-app


# CHECK DEPLOYMENTS

# Backend
kubectl describe deployment backend -n animal-help-app

# Frontend
kubectl describe deployment frontend -n animal-help-app

# PostgreSQL
kubectl describe deployment postgres -n animal-help-app


# LOGS

# Backend logs
kubectl logs -n animal-help-app deployment/backend

# Backend logs (live)
kubectl logs -f -n animal-help-app deployment/backend

# Frontend logs
kubectl logs -n animal-help-app deployment/frontend

# PostgreSQL logs
kubectl logs -n animal-help-app deployment/postgres


# POSTGRES

# Connect to PostgreSQL
kubectl exec -it deployment/postgres -n animal-help-app -- psql -U postgres

# List tables
\dt

# Animals
SELECT COUNT(*) FROM animals;

# Users
SELECT COUNT(*) FROM users;

# Volunteer tasks
SELECT COUNT(*) FROM tasks;

# Exit PostgreSQL
\q


# TEST DATA PERSISTENCE (PVC)

# Delete PostgreSQL pod
kubectl delete pod -n animal-help-app -l app=postgres

# Wait for pod to be recreated
kubectl get pods -n animal-help-app

# Check the database again:
kubectl exec -it deployment/postgres -n animal-help-app -- psql -U postgres

SELECT COUNT(*) FROM animals;


# CONFIGMAP

# Application ConfigMap details
kubectl describe configmap animal-help-config -n animal-help-app

# PostgreSQL init scripts
kubectl describe configmap postgres-init -n animal-help-app


# Secret details
kubectl describe secret animal-help-secret -n animal-help-app


# PodDisruptionBudget details
kubectl describe pdb backend-pdb -n animal-help-app


# BACKEND HEALTHCHECK

# Port-forward to backend
kubectl port-forward -n animal-help-app service/backend-service 3001:3001

# In a second terminal:
curl http://localhost:3001/healthz

# Expected result:
# {"status":"ok","database":"connected"}


# SCALE BACKEND REPLICAS

kubectl scale deployment backend \
--replicas=3 \
-n animal-help-app

kubectl get deploy -n animal-help-app


# UPDATE IMAGE

kubectl rollout restart deployment/backend \
-n animal-help-app

kubectl rollout status deployment/backend \
-n animal-help-app


# DELETE ALL APPLICATION PODS

kubectl delete pods --all -n animal-help-app


# DELETE A SPECIFIC POD

kubectl delete pod <POD_NAME> -n animal-help-app
```

---

## Functional Verification (curl)

### Health check

```bash
curl http://api.animal-help-app.local/healthz
```
```json
{"status":"ok","database":"connected"}
```

### Read animals (public resource)

```bash
curl http://api.animal-help-app.local/animals
```
```json
[{"id":17,"name":"Piorun","type":"pies","status":"Do adopcji",...}]
```

---

## Data Persistence Test

```bash
# Check data before restart
curl http://api.animal-help-app.local/metrics

# Delete database pod
kubectl delete pod -n animal-help-app -l app=postgres

# Wait for it to come back
kubectl wait --for=condition=ready pod -l app=postgres -n animal-help-app --timeout=60s

# Data still available
curl http://api.animal-help-app.local/metrics
```

Record count before and after restart should be identical.

---

## System Metrics

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

The workflow runs automatically on every push to the `main` branch.

Steps:
1. Builds Docker images (backend and frontend)
2. Pushes to GitHub Container Registry (GHCR)
3. Validates manifests (`--dry-run`)
4. Applies manifests to the kind cluster
5. Verifies rollout and health check

Images:
- `ghcr.io/jpolchowska/animal-help-backend:latest`
- `ghcr.io/jpolchowska/animal-help-frontend:latest`

**Link to last successful workflow:**
https://github.com/jpolchowska/animal-help-app/actions/runs/26822164741

---

## Cleanup

```bash
kubectl delete namespace animal-help-app
```
