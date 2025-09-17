# Kustomize Deployment Configuration

Bu dizin Todo App'in Kustomize tabanlı Kubernetes deployment yapılandırmasını içerir. Helm ile benzer şekilde, farklı environment'lar için (staging ve production) ayrı konfigürasyonlar sunar.

## Dizin Yapısı

```
kustomize/
├── base/                          # Base kaynak tanımları
│   ├── kustomization.yaml         # Base kustomization
│   ├── user-service-deployment.yaml
│   ├── user-service-service.yaml
│   ├── todo-service-deployment.yaml
│   ├── todo-service-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   └── ingress.yaml
└── overlays/                      # Environment-specific overlays
    ├── staging/                   # Staging environment
    │   ├── kustomization.yaml
    │   └── namespace.yaml
    └── production/                # Production environment
        ├── kustomization.yaml
        └── namespace.yaml
```

## Environment Özellikleri

### Base
- Temel kaynak tanımları
- Environment-agnostic konfigürasyon
- Varsayılan resource limit'leri
- Common labels ve annotations

### Staging
- **Namespace**: `staging`
- **Name Prefix**: `staging-`
- **Replicas**: 1 (cost optimization)
- **Host**: `todo-app.local`
- **Image Tags**: `latest`
- **Features**:
  - Simple configuration for testing
  - Development environment settings
  - Namespace auto-creation

### Production
- **Namespace**: `production`
- **Name Prefix**: `prod-`
- **Replicas**: 2 (moderate availability)
- **Host**: `todo-app.local`
- **Image Tags**: `latest` (can be overridden with specific versions)
- **Features**:
  - Higher replica count for availability
  - Production environment variables
  - Namespace auto-creation
  - TLS termination ready

## Kullanım

### 1. Build ve Preview

```bash
# Base konfigürasyonu görüntüle
kustomize build kustomize/base

# Staging konfigürasyonu görüntüle
kustomize build kustomize/overlays/staging

# Production konfigürasyonu görüntüle
kustomize build kustomize/overlays/production
```

### 2. Deploy

```bash
# Staging'e deploy
kustomize build kustomize/overlays/staging | kubectl apply -f -

# Production'a deploy
kustomize build kustomize/overlays/production | kubectl apply -f -
```

### 3. Cleanup

```bash
# Staging cleanup
kustomize build kustomize/overlays/staging | kubectl delete -f -

# Production cleanup
kustomize build kustomize/overlays/production | kubectl delete -f -
```

## Jenkins Integration

Jenkins pipeline'ında kullanım için:

```groovy
// Staging deployment
sh "kustomize build kustomize/overlays/staging | kubectl apply -f -"

// Production deployment
sh "kustomize build kustomize/overlays/production | kubectl apply -f -"
```

## Özellikler

### Image Tag Management
- **Staging**: `latest` (for testing latest builds)
- **Production**: `latest` (can be overridden with specific versions like `v1.0.0`)
- **Jenkins Integration**: Build numbers can be used (e.g., `45`, `46`)

### Environment-Specific Configurations
- **Environment variables**: Her environment için farklı SECRET_KEY değerleri
- **Resource limits**: Staging'de 1 replica, production'da 2 replica
- **Secrets ve ConfigMaps**: Environment-specific değerler
- **Namespace management**: Otomatik namespace oluşturma

### Local Development Focus
- **Host Configuration**: Her iki environment da `todo-app.local` (localhost development)
- **Simple Setup**: Minimal configuration for local testing
- **No Complex Features**: NetworkPolicy, PodDisruptionBudgets gibi production features kaldırıldı

### Monitoring ve Logging
- **Staging**: Basic configuration for development
- **Production**: Standard configuration with production-ready settings
- **Both**: ImagePullSecrets for GitHub Container Registry

## Gereksinimler

- Kubernetes cluster (Minikube for local development)
- `kustomize` CLI tool
- `kubectl` configured for your cluster
- Image pull secrets for GitHub Container Registry
- `/etc/hosts` entries for `todo-app.local`

## Troubleshooting

### Common Issues

1. **Image pull errors**: GitHub registry secret'ının doğru namespace'de olduğunu kontrol edin
2. **Namespace errors**: Target namespace'in var olduğunu kontrol edin
3. **Resource conflicts**: Aynı isimde kaynakların çakışmadığını kontrol edin

### Debug Commands

```bash
# Generated manifest'leri kontrol et
kustomize build kustomize/overlays/staging

# Apply ile test et (dry-run)
kustomize build kustomize/overlays/staging | kubectl apply --dry-run=client -f -

# Image pull secret kontrolü
kubectl get secrets -n staging
kubectl get secrets -n production

# Host dosyası kontrolü
cat /etc/hosts | grep todo-app.local
```
