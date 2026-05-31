# CHECKLIST — Animal Help App

## Wymagania wstępne

- Docker Desktop z włączonym Kubernetes (kind)
- `kubectl`
- Git

## Uruchomienie na kind (Docker Desktop)

### 1. Sklonuj repozytorium

```bash
git clone https://github.com/jpolchowska/animal-help-app.git
cd animal-help-app
```

### 2. Zbuduj obrazy lokalnie

```bash
docker build -t ghcr.io/jpolchowska/animal-help-backend:latest ./backend

docker build -t ghcr.io/jpolchowska/animal-help-frontend:latest \
  --build-arg NEXT_PUBLIC_API_URL=http://api.animal-help-app.local \
  ./frontend
```

> Alternatywnie obrazy są dostępne na GHCR i zostaną pobrane automatycznie po pierwszym `kubectl apply`.

### 3. Zainstaluj nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/cloud/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

### 4. Dodaj wpisy do /etc/hosts

```bash
echo "127.0.0.1 animal-help-app.local api.animal-help-app.local" | sudo tee -a /etc/hosts
```

### 5. Zaaplikuj manifesty

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress.yaml
```

### 6. Poczekaj aż pody będą gotowe

```bash
kubectl get pods -n animal-help-app -w
```

Oczekiwany wynik:

```
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxxxxxxxx-xxxxx     1/1     Running   0          2m
frontend-xxxxxxxxx-xxxxx    1/1     Running   0          2m
postgres-xxxxxxxxx-xxxxx    1/1     Running   0          3m
```

### 7. Otwórz aplikację

```
http://animal-help-app.local
```

Konto admina: `admin@gmail.com`
Hasło: `123456`

Konto dowolnego użytkownika tworzy się poprzez rejestrację, a następnie zalogowanie.

---

## Zasoby Kubernetes

| Zasób | Nazwa | Namespace |
|-------|-------|-----------|
| Namespace | animal-help-app | — |
| Secret | animal-help-secret | animal-help-app |
| ConfigMap | animal-help-config | animal-help-app |
| ConfigMap | postgres-init | animal-help-app |
| PersistentVolumeClaim | postgres-pvc | animal-help-app |
| PersistentVolumeClaim | backend-images-pvc | animal-help-app |
| Deployment | postgres | animal-help-app |
| Deployment | backend | animal-help-app |
| Deployment | frontend | animal-help-app |
| Service | postgres-service | animal-help-app |
| Service | backend-service | animal-help-app |
| Service | frontend-service | animal-help-app |
| Ingress | animal-help-ingress | animal-help-app |

---

## Komendy kubectl

### Sprawdź pody

```bash
kubectl get pods -n animal-help-app
```

```
NAME                        READY   STATUS    RESTARTS   AGE
backend-7b9d99df49-qcc7v    1/1     Running   0          10m
frontend-77f7b4fd78-k58cn   1/1     Running   0          10m
postgres-6c9545f7cd-84tqg   1/1     Running   0          12m
```

### Sprawdź serwisy

```bash
kubectl get services -n animal-help-app
```

```
NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
backend-service    ClusterIP   10.96.x.x       <none>        3001/TCP   10m
frontend-service   ClusterIP   10.96.x.x       <none>        3000/TCP   10m
postgres-service   ClusterIP   10.96.x.x       <none>        5432/TCP   12m
```

### Sprawdź Ingress

```bash
kubectl get ingress -n animal-help-app
```

```
NAME                  CLASS   HOSTS                                              ADDRESS     PORTS   AGE
animal-help-ingress   nginx   animal-help-app.local,api.animal-help-app.local   localhost   80      10m
```

### Sprawdź PVC

```bash
kubectl get pvc -n animal-help-app
```

```
NAME                 STATUS   VOLUME         CAPACITY   ACCESS MODES   AGE
backend-images-pvc   Bound    pvc-xxxxxxxx   500Mi      RWO            10m
postgres-pvc         Bound    pvc-xxxxxxxx   1Gi        RWO            12m
```

### Healthcheck backendu

```bash
curl http://api.animal-help-app.local/healthz
```

```json
{"status":"ok"}
```

### Logi

```bash
kubectl logs -n animal-help-app deployment/backend
kubectl logs -n animal-help-app deployment/postgres
```

### Czyszczenie

```bash
kubectl delete namespace animal-help-app
```

---

## CI/CD — GitHub Actions

Workflow uruchamia się automatycznie przy każdym push do gałęzi `main`.

Buduje i pushuje obrazy Docker do GitHub Container Registry (GHCR):
- `ghcr.io/jpolchowska/animal-help-backend:latest`
- `ghcr.io/jpolchowska/animal-help-frontend:latest`

**Link do ostatniego udanego workflow:**  
https://github.com/jpolchowska/animal-help-app/actions/runs/26714674050
