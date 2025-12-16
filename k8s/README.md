# Kubernetes Deployment Guide

## Prerequisites

1. **Kubernetes cluster** (v1.28+)
   - Local: Minikube, Kind, K3s
   - Cloud: GKE, EKS, AKS, DigitalOcean Kubernetes

2. **Tools installed**:
   ```bash
   kubectl
   helm (optional, for cert-manager)
   ```

3. **NGINX Ingress Controller**:
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
   ```

4. **cert-manager** (for TLS certificates):
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   ```

## Deployment Steps

### 1. Update Secrets

Edit `secrets.yaml` and replace all `CHANGE_ME` values with real secrets:

```bash
# Generate a strong JWT secret
openssl rand -base64 32

# Update the secrets.yaml file
vim k8s/secrets.yaml
```

**⚠️ IMPORTANT**: Never commit real secrets to Git! Use tools like:
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- [External Secrets Operator](https://external-secrets.io/)
- Cloud provider secret managers (AWS Secrets Manager, GCP Secret Manager, etc.)

### 2. Update ConfigMap and Ingress

Update `configmap.yaml` and `ingress.yaml` with your domain:

```yaml
# configmap.yaml
CORS_ORIGIN: "https://your-actual-domain.com"

# ingress.yaml
hosts:
  - your-actual-domain.com
  - api.your-actual-domain.com
```

### 3. Build and Push Docker Images

```bash
# Build images
docker build -t your-registry/travel-planner-backend:latest -f docker/backend.Dockerfile .
docker build -t your-registry/travel-planner-frontend:latest -f docker/frontend.Dockerfile .

# Push to registry
docker push your-registry/travel-planner-backend:latest
docker push your-registry/travel-planner-frontend:latest
```

Update `backend.yaml` and `frontend.yaml` with your image registry.

### 4. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -k k8s/

# Or apply individually
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

### 5. Run Database Migrations

```bash
# Get backend pod name
BACKEND_POD=$(kubectl get pods -n travel-planner -l app=backend -o jsonpath='{.items[0].metadata.name}')

# Run migrations
kubectl exec -n travel-planner $BACKEND_POD -- pnpm --filter database migrate

# Seed database (optional)
kubectl exec -n travel-planner $BACKEND_POD -- pnpm --filter database seed
```

### 6. Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n travel-planner

# Check services
kubectl get svc -n travel-planner

# Check ingress
kubectl get ingress -n travel-planner

# View logs
kubectl logs -n travel-planner -l app=backend --tail=100 -f
kubectl logs -n travel-planner -l app=frontend --tail=100 -f
```

## Scaling

### Manual Scaling

```bash
# Scale backend
kubectl scale deployment backend -n travel-planner --replicas=5

# Scale frontend
kubectl scale deployment frontend -n travel-planner --replicas=3
```

### Auto-scaling (HPA)

The HorizontalPodAutoscaler is already configured:
- Backend: 3-10 replicas based on CPU (70%) and Memory (80%)
- Frontend: 2-5 replicas based on CPU (70%)

```bash
# Check HPA status
kubectl get hpa -n travel-planner
```

## Monitoring

```bash
# Watch pods
kubectl get pods -n travel-planner -w

# View events
kubectl get events -n travel-planner --sort-by='.lastTimestamp'

# Describe pod for issues
kubectl describe pod <pod-name> -n travel-planner
```

## Updating the Application

```bash
# Build new images
docker build -t your-registry/travel-planner-backend:v1.1.0 -f docker/backend.Dockerfile .
docker push your-registry/travel-planner-backend:v1.1.0

# Update deployment
kubectl set image deployment/backend backend=your-registry/travel-planner-backend:v1.1.0 -n travel-planner

# Rollout status
kubectl rollout status deployment/backend -n travel-planner

# Rollback if needed
kubectl rollout undo deployment/backend -n travel-planner
```

## Cleanup

```bash
# Delete all resources
kubectl delete -k k8s/

# Or delete namespace (deletes everything)
kubectl delete namespace travel-planner
```

## Production Considerations

1. **Database**: Use managed PostgreSQL (AWS RDS, GCP Cloud SQL, etc.) instead of in-cluster
2. **Redis**: Use managed Redis (AWS ElastiCache, GCP Memorystore, etc.)
3. **Storage**: Use cloud object storage (S3, GCS, etc.) instead of MinIO
4. **Secrets**: Use external secret management
5. **Monitoring**: Set up Prometheus + Grafana
6. **Logging**: Use ELK stack or cloud logging
7. **Backups**: Configure automated database backups
8. **CI/CD**: Set up GitHub Actions or GitLab CI for automated deployments
