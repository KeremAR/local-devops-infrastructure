# Todo App - Complete DevOps Infrastructure

A comprehensive Todo application demonstrating modern DevOps practices with multiple deployment strategies: Docker Compose, Kubernetes, Helm, Kustomize, and GitOps with ArgoCD.

## Project Architecture

### Application Stack
- **Backend Services:**
  - **User Service** (Python/FastAPI) - Authentication, user management
  - **Todo Service** (Python/FastAPI) - Todo CRUD operations with JWT auth
- **Frontend:** React + Vite + TailwindCSS
- **Database:** SQLite (persistent volumes in K8s)
- **Container Registry:** GitHub Container Registry (ghcr.io)

### DevOps Stack
- **CI/CD:** Jenkins with Kubernetes agents
- **Container Platform:** Docker + Kubernetes (Minikube for local)
- **Deployment Options:** 
  - Docker Compose (development)
  - Plain Kubernetes manifests
  - Helm charts (multi-environment)
  - Kustomize overlays (environment-specific)
  - GitOps with ArgoCD
- **Monitoring & Quality:** SonarQube, Hadolint, Trivy security scanning
- **Shared Library:** Custom Jenkins pipeline functions

## Quick Start Options

### Option 1: Docker Compose (Fastest for Development)

```bash
# Clone and start the application
git clone <repository-url>
cd local-devops-infrastructure

# Start all services
docker compose up -d

# Run tests
docker compose -f docker-compose.test.yml run --rm user-service-test
docker compose -f docker-compose.test.yml run --rm todo-service-test

# Access the app
# Frontend: http://localhost:3000
# User Service: http://localhost:8001
# Todo Service: http://localhost:8002
```

### Option 2: Kubernetes with Plain Manifests

```bash
# Start Minikube and enable ingress
minikube start
minikube addons enable ingress

# Point Docker to Minikube
eval $(minikube -p minikube docker-env)

# Build images locally
docker build -t todo-app-user-service -f user-service/Dockerfile .
docker build -t todo-app-todo-service -f todo-service/Dockerfile .
docker build -t todo-app-frontend ./frontend2/frontend

# Deploy to Kubernetes
kubectl apply -f k8s/

# Access via ingress
echo "$(minikube ip) todo-app.local" | sudo tee -a /etc/hosts
# Visit: http://todo-app.local
```

### Option 3: Helm Deployment

```bash
# Deploy with Helm (after K8s setup above)
helm install todo-app helm-charts/todo-app -n todo-app --create-namespace

# For staging environment
helm install todo-app-staging helm-charts/todo-app -f helm-charts/todo-app/values-staging.yaml -n staging --create-namespace

# For production environment  
helm install todo-app-prod helm-charts/todo-app -f helm-charts/todo-app/values-prod.yaml -n production --create-namespace
```

### Option 4: Kustomize Deployment

```bash
# Install Kustomize
sudo snap install kustomize  # or: brew install kustomize

# Deploy to staging
kustomize build kustomize/overlays/staging | kubectl apply -f -

# Deploy to production
kustomize build kustomize/overlays/production | kubectl apply -f -

# Preview before applying
kustomize build kustomize/overlays/staging
```

### Option 5: GitOps with ArgoCD

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Apply ArgoCD ingress
kubectl apply -f k8s/argocd-ingress.yaml
echo "$(minikube ip) argocd.todo-app.local" | sudo tee -a /etc/hosts

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Deploy root application (App of Apps pattern)
kubectl apply -f argocd-manifests/root-application.yaml -n argocd

# Access ArgoCD UI: https://argocd.todo-app.local
```

## Complete CI/CD Pipeline Setup

### Prerequisites
- Minikube with ingress addon enabled
- Jenkins deployed in Kubernetes cluster
- GitHub Personal Access Token (packages and repo scopes)

### Jenkins Setup

```bash
# Create Jenkins namespace and deploy
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/jenkins-rbac.yaml

# Install Jenkins via Helm
helm repo add jenkins https://charts.jenkins.io
helm repo update
helm install jenkins jenkins/jenkins -f jenkins-values.yaml -n jenkins --create-namespace

# Set up ingress and admin credentials
kubectl apply -f k8s/jenkins-ingress.yaml
kubectl create secret generic jenkins-admin-secret -n jenkins \
  --from-literal=jenkins-admin-user='admin' \
  --from-literal=jenkins-admin-password='SizinGucluSifreniz123!'

# Add to hosts file
echo "$(minikube ip) jenkins.todo-app.local" | sudo tee -a /etc/hosts
```

### Required Jenkins Credentials

1. **github-registry** - GitHub Personal Access Token (packages scope)
2. **github-webhook** - GitHub Personal Access Token (repo,hook scopes)  
3. **github-registry-dockerconfig** - Docker config JSON for GHCR
4. **argocd-username** - ArgoCD username
5. **argocd-password** - ArgoCD password/token

### Pipeline Features

The Jenkins pipeline implements a 3-stage deployment strategy:

#### Stage 1: Validation (All branches except tags)
- Static code analysis (Hadolint)
- Parallel service builds
- Security scanning (Trivy - optional)
- Unit tests with multi-stage Dockerfiles
- SonarQube integration (optional)

#### Stage 2: Integration (Master branch only)
- Push images to GitHub Container Registry
- Deploy to staging environment
- Integration tests

#### Stage 3: Production (Git tags v* only)
- Cleanup staging resources
- Deploy to production
- Notification system

### Pipeline Configuration

The pipeline is fully configurable via the `config` map in `Jenkinsfile`:

```groovy
def config = [
    appName: 'todo-app',
    services: [
        [name: 'user-service', dockerfile: 'user-service/Dockerfile'],
        [name: 'todo-service', dockerfile: 'todo-service/Dockerfile'],
        [name: 'frontend', dockerfile: 'frontend2/frontend/Dockerfile', context: 'frontend2/frontend/']
    ],
    // Registry and deployment settings
    registry: 'ghcr.io',
    username: 'keremar',
    // Choose your deployment strategy
    // helmReleaseName: 'todo-app',  // For Helm
    // argoCdStagingAppName: 'staging-todo-app',  // For GitOps
]
```

## Deployment Strategy Comparison

| Strategy | Best For | Pros | Cons |
|----------|----------|------|------|
| **Docker Compose** | Local development, testing | Quick setup, simple | Not production-ready |
| **K8s Manifests** | Learning, simple deployments | Full control, transparent | Verbose, hard to manage |
| **Helm** | Complex apps, multi-env | Templating, packaging | Learning curve, complexity |
| **Kustomize** | Environment variants | Declarative, patch-based | Limited templating |
| **GitOps/ArgoCD** | Production, compliance | Git-based, audit trail | Complex setup, git dependency |

## Development Workflow

### Local Development
```bash
# Start development environment
docker compose up -d

# Make changes to code
# Run tests
docker compose -f docker-compose.test.yml run --rm user-service-test

# Check with pre-commit hooks
pre-commit run --all-files
```

### Feature Branch Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Push and create PR
git push origin feature/new-feature

# Jenkins runs: build → test → security scan → staging deploy (if merged to master)
```

### Production Release
```bash
# Tag release
git tag v1.0.0
git push origin v1.0.0

# Jenkins runs: production deployment (bypasses build/test stages)
```

## Service Architecture

### User Service (Port 8001)
- **Endpoints:** `/register`, `/login`, `/users/{id}`, `/admin/users`
- **Features:** JWT authentication, bcrypt password hashing, SQLite database
- **Health Check:** `/health`

### Todo Service (Port 8002)  
- **Endpoints:** `/todos` (CRUD), `/admin/todos`
- **Features:** JWT validation, user-specific todos, SQLite database
- **Dependencies:** User Service for authentication
- **Health Check:** `/health`

### Frontend (Port 3000)
- **Technology:** React 19 + Vite + TailwindCSS
- **Features:** Modern UI, responsive design, API integration
- **Build:** Production-optimized with Vite

## Infrastructure Components

### Required Manual Steps (One-time Setup)

Some infrastructure setup requires manual intervention and has been documented in the imperative commands:

#### Minikube Setup
```bash
minikube addons enable ingress
eval $(minikube -p minikube docker-env)
```

#### Registry Secrets (Per Namespace)
```bash
# For staging
kubectl create secret docker-registry github-registry-secret \
  --namespace=staging \
  --docker-server=ghcr.io \
  --docker-username=<GITHUB_USERNAME> \
  --docker-password=<GITHUB_TOKEN>

# For production  
kubectl create secret docker-registry github-registry-secret \
  --namespace=production \
  --docker-server=ghcr.io \
  --docker-username=<GITHUB_USERNAME> \
  --docker-password=<GITHUB_TOKEN>
```

#### Host File Entries
```bash
echo "$(minikube ip) todo-app.local" | sudo tee -a /etc/hosts
echo "$(minikube ip) jenkins.todo-app.local" | sudo tee -a /etc/hosts  
echo "$(minikube ip) argocd.todo-app.local" | sudo tee -a /etc/hosts
echo "$(minikube ip) sonarqube.local" | sudo tee -a /etc/hosts  # If using SonarQube
```

#### Jenkins Plugin Requirements
- Kubernetes Credentials Provider
- Basic Branch Build Strategies  
- SonarQube Scanner (if using SonarQube)

### Optional Components

#### SonarQube Integration
```bash
# Option 1: Docker
docker run -d --name sonarqube -p 9000:9000 sonarqube

# Option 2: Helm
helm repo add sonarqube https://SonarSource.github.io/helm-chart-sonarqube
helm install sonarqube sonarqube/sonarqube -f helm/sonarqube-values.yaml -n sonarqube --create-namespace
```

#### Security Scanning
- **Hadolint:** Dockerfile linting (enabled by default)
- **Trivy:** Container vulnerability scanning (configurable)

## Monitoring and Troubleshooting

### Health Checks
```bash
# Service health
curl http://localhost:8001/health  # User service
curl http://localhost:8002/health  # Todo service

# K8s health
kubectl get pods -n todo-app
kubectl logs -f deployment/user-service -n todo-app
```

### Common Issues

1. **Image Pull Errors:** Check registry secrets in target namespace
2. **Database Initialization:** Persistent volumes need proper permissions
3. **JWT Validation:** Ensure SECRET_KEY consistency across services
4. **CORS Issues:** Frontend/backend origin configuration
5. **Ingress Not Working:** Check minikube ingress addon and /etc/hosts

### Debug Commands
```bash
# Check all deployments
kubectl get all -n todo-app

# Inspect specific resources
kubectl describe deployment user-service -n todo-app
kubectl logs -f pod/<pod-name> -n todo-app

# Test connectivity
kubectl exec -it deployment/user-service -n todo-app -- curl http://todo-service:8002/health
```

## Project Structure
```
local-devops-infrastructure/
├── user-service/               # User authentication service
│   ├── Dockerfile             # Production build
│   ├── Dockerfile.test        # Multi-stage with test target
│   └── app.py                 # FastAPI application
├── todo-service/              # Todo management service
│   ├── Dockerfile
│   ├── Dockerfile.test
│   └── app.py
├── frontend2/frontend/        # React frontend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── k8s/                       # Plain Kubernetes manifests
├── helm-charts/               # Helm charts with multi-env support
│   └── todo-app/
│       ├── values.yaml        # Default values
│       ├── values-staging.yaml
│       └── values-prod.yaml
├── kustomize/                 # Kustomize overlays
│   ├── base/                  # Base configurations
│   └── overlays/
│       ├── staging/
│       └── production/
├── scripts/                   # Utility scripts
├── docker-compose.yml         # Development environment
├── docker-compose.test.yml    # Test environment
├── Jenkinsfile               # CI/CD pipeline
└── .pre-commit-config.yaml   # Code quality hooks
```

## Shared Library Integration

This project works with the Jenkins Shared Library located in the parent directory. The library provides reusable functions for:

- **Build Functions:** `buildAllServices()`, `buildDockerImage()`
- **Test Functions:** `runUnitTests()`, `runIntegrationTests()`  
- **Security:** `runTrivyScan()`, `runHadolint()`
- **Deployment:** `deployWithHelm()`, `argoDeployStaging()`, `argoDeployProduction()`

## Getting Help

### Prerequisites Check
- Docker and Docker Compose installed
- Kubernetes cluster (minikube) running
- kubectl configured
- Helm installed (for Helm deployments)
- Jenkins accessible with required plugins

### Environment Variables
- `SECRET_KEY`: JWT signing key (change in production)
- `USER_SERVICE_URL`: Internal service communication
- `ARGOCD_SERVER`: ArgoCD server URL for GitOps

### Support Resources
- Check service logs: `docker compose logs <service>`
- Kubernetes debugging: `kubectl describe pod <pod-name>`
- Jenkins build logs for pipeline issues
- ArgoCD UI for GitOps deployment status

This comprehensive setup demonstrates production-ready DevOps practices with multiple deployment strategies, allowing teams to choose the approach that best fits their needs and gradually migrate between strategies as requirements evolve.

<citations>
<document>
<document_type>WEB_PAGE</document_type>
<document_id>https://SonarSource.github.io/helm-chart-sonarqube</document_id>
</document>
<document>
<document_type>WEB_PAGE</document_type>
<document_id>https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml</document_id>
</document>
</citations>