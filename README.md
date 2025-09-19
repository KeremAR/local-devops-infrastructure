# DevOps Todo Application - Comprehensive Infrastructure Project

![DevOps Pipeline](https://img.shields.io/badge/DevOps-Pipeline-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?logo=kubernetes&logoColor=white)
![Helm](https://img.shields.io/badge/Helm-0F1689?logo=helm&logoColor=white)
![ArgoCD](https://img.shields.io/badge/ArgoCD-GitOps-FF6B35)
![Jenkins](https://img.shields.io/badge/Jenkins-D33833?logo=jenkins&logoColor=white)

Bu proje, modern DevOps pratiklerini gösteren kapsamlı bir Todo uygulamasıdır. Mikroservis mimarisi, multi-stage deployment, GitOps, CI/CD pipeline'ları ve multiple deployment stratejilerini içerir.

## 📋 İçindekiler

- [Proje Genel Bakış](#-proje-genel-bakış)
- [Mimari](#-mimari)
- [Klasör Yapısı](#-klasör-yapısı)
- [Hızlı Başlangıç](#-hızlı-başlangıç)
- [Deployment Seçenekleri](#-deployment-seçenekleri)
- [Çoklu Ortam Yönetimi](#-çoklu-ortam-yönetimi)
- [CI/CD Pipeline](#-cicd-pipeline)
- [GitOps ile Deployment](#-gitops-ile-deployment)
- [İmperative Komutlar](#-imperative-komutlar)
- [Troubleshooting](#-troubleshooting)

## 🚀 Proje Genel Bakış

Bu proje, gerçek dünya DevOps senaryolarını simüle eden tam kapsamlı bir infrastrüktür örneğidir. Aşağıdaki teknolojileri ve metodolojileri içerir:

### 📱 Uygulama Bileşenleri
- **Frontend**: React tabanlı web arayüzü
- **User Service**: FastAPI ile kullanıcı yönetimi (auth, JWT)
- **Todo Service**: FastAPI ile todo işlemleri
- **Database**: SQLite (her servis kendi veritabanı)

### 🛠️ DevOps Araçları
- **Container**: Docker & Docker Compose
- **Orchestration**: Kubernetes (Minikube)
- **Package Manager**: Helm Charts
- **Configuration Management**: Kustomize
- **CI/CD**: Jenkins with Shared Libraries
- **GitOps**: ArgoCD (App of Apps pattern)
- **Code Quality**: Pre-commit hooks, Hadolint, SonarQube
- **Security**: Trivy vulnerability scanning

## 🏗️ Mimari

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOAD BALANCER                           │
│                      (Ingress/Service)                         │
└─────────────────────┬───────────────────────┬───────────────────┘
                      │                       │
┌─────────────────────┴─────────────────────┐ │
│              FRONTEND                     │ │
│            (React App)                    │ │
│               Port: 3000                  │ │
└─────────────────────┬─────────────────────┘ │
                      │                       │
                      ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                            │
├─────────────────────┬───────────────────────────────────────────┤
│   USER SERVICE      │            TODO SERVICE                   │
│   (FastAPI)         │            (FastAPI)                     │
│   Port: 8001        │            Port: 8002                    │
│   - Authentication  │            - Todo CRUD                   │
│   - User Management │            - User Authorization          │
│   - JWT Tokens      │            - Service Communication       │
└─────────────────────┴───────────────────────────────────────────┘
```

## 📁 Klasör Yapısı

Bu proje üç ana bileşene ayrılmıştır:

```
├── 📂 local_devops_infrastructure/     # Ana uygulama kodu ve infrastrüktür
│   ├── 🐳 docker-compose.yml           # Geliştirme ortamı
│   ├── 🐳 docker-compose.test.yml      # Test ortamı
│   ├── 📂 user-service/                # Kullanıcı servisi
│   ├── 📂 todo-service/                # Todo servisi
│   ├── 📂 k8s/                         # Vanilla Kubernetes manifests
│   ├── 📂 helm-charts/                 # Helm paket tanımları
│   ├── 📂 kustomize/                   # Kustomize overlay'leri
│   └── 📄 Jenkinsfile                  # CI/CD pipeline tanımı
├── 📂 vars/                            # Jenkins Shared Library functions
├── 📂 todo-app-gitops/                 # GitOps manifests (ayrı repo)
│   └── 📂 argocd-manifests/            # ArgoCD Application tanımları
└── 📄 README.md                        # Bu dosya
```

## 🚀 Adım Adım Kurulum Rehberi

Bu bölüm, projeyi farklı teknolojilerle adım adım nasıl kuracağınızı gösterir. Her aşama bir öncekini temel alır ve yeni teknolojiler ekler.

### Ön Gereksinimler

- Docker & Docker Compose
- Git
- (Sonraki aşamalar için) Minikube, kubectl, Helm, ArgoCD CLI

---

## 🐳 Aşama 1: Docker Compose ile Geliştirme

Bu en basit aşamadır. Hiçbir ek kurulum gerektirmez.

### Kurulum

```bash
# Projeyi klonlayın
git clone <repo-url>
cd jenkins-shared-library2/local_devops_infrastructure

# Uygulamayı başlatın
docker compose up -d

# Logları izleyin
docker compose logs -f

# Durumunu kontrol edin
docker compose ps
```

### Test Ortamı

```bash
# Test servislerini çalıştırın
docker compose -f docker-compose.test.yml up --build

# Testleri takip edin
docker compose -f docker-compose.test.yml logs -f

# Test imajlarını temizleyin
docker compose -f docker-compose.test.yml down --rmi all
```

### Erişim URL'leri
- Frontend: http://localhost:3000
- User Service: http://localhost:8001
- Todo Service: http://localhost:8002
- API Docs: http://localhost:8001/docs ve http://localhost:8002/docs

### Temizlik

```bash
# Servisleri durdurun
docker compose down

# Volume'leri de temizleyin
docker compose down -v

# İmajları da silin
docker compose down --rmi all
```

## ☸️ Aşama 2: Kubernetes ile Deployment

Bu aşamada Minikube kullanarak Kubernetes'e geçiş yapacağız.

### Ön Gereksinimler
```bash
# Minikube kurulumu (henüz yoksa)
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### 1. Minikube Kurulumu

```bash
# Minikube'ı başlatın
minikube start

# Ingress addon'unu etkinleştirin (Nginx Ingress Controller için gerekli)
minikube addons enable ingress

# Docker environment'ı minikube'a yönlendirin
# Bu sayede Docker build'leri doğrudan Minikube'da çalışır
eval $(minikube -p minikube docker-env)
```

### 2. Registry Secret Oluşturma

```bash
# GitHub Container Registry için secret oluşturun
# Bu secret, private imajları çekmek için gereklidir
kubectl create secret docker-registry github-registry-secret \
  --docker-server=ghcr.io \
  --docker-username=<GITHUB_USERNAME> \
  --docker-password=<GITHUB_TOKEN> \
  -n todo-app
```

**Not**: GitHub Token'ınızın `packages` scope'una sahip olması gerekir.

### 3. Kubernetes Manifests Deployment

```bash
# Tüm Kubernetes manifest'lerini uygulayın
kubectl apply -f k8s/

# Pod'ların durumunu kontrol edin
kubectl get pods -n todo-app

# Servislerin durumunu kontrol edin
kubectl get services -n todo-app
```

**Önemli Not**: Eğer yeni namespace'ler ekliyorsanız, `k8s/jenkins-rbac.yaml` dosyasında ilgili namespace'ler için rolebinding eklemeniz gerekir. Aksi takdirde Jenkins agent'ları o namespace'lere erişemez.

### 4. Hosts Dosyası Konfigürasyonu

```bash
# Minikube IP'sini alın
MINIKUBE_IP=$(minikube ip)

# Hosts dosyasına ekleyin
echo "$MINIKUBE_IP todo-app.local" | sudo tee -a /etc/hosts
```

### 5. Erişim

Uygulamaya erişim: http://todo-app.local

### Troubleshooting

```bash
# Pod loglarını inceleyin
kubectl logs -f deployment/user-service -n todo-app
kubectl logs -f deployment/todo-service -n todo-app
kubectl logs -f deployment/frontend -n todo-app

# Ingress durumunu kontrol edin
kubectl get ingress -n todo-app
kubectl describe ingress todo-app-ingress -n todo-app
```

---

## ⛵ Aşama 3: Helm ile Package Management

Bu aşamada Helm kullanarak deployment'ı paketleyeceğiz ve multi-environment desteği ekleyeceğiz.

### 1. Helm Kurulumu

```bash
# Helm'i kurun (henüz yoksa)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### 2. Registry Secrets (Helm için)

Helm değerlerinde daha karmaşık secret management gerekir:

```bash
# Docker config'ini base64 formatında alın
cat ~/.docker/config.json | base64 | tr -d '\n'

# Bu değeri Jenkins'te `github-registry-dockerconfig` credential'ı olarak kaydedin
```

### 3. Development Environment

```bash
# Basic Helm deployment
helm upgrade --install todo-app helm-charts/helm-todo-app \
  --namespace todo-app \
  --create-namespace \
  --wait
```

### 4. Staging Environment

```bash
# Staging namespace için secret oluşturun
kubectl create secret docker-registry github-registry-secret \
  --namespace=staging \
  --docker-server=ghcr.io \
  --docker-username=<GITHUB_USERNAME> \
  --docker-password=<GITHUB_TOKEN>

# Staging environment'ı deploy edin
helm upgrade --install todo-app-staging helm-charts/helm-todo-app \
  --namespace staging \
  --create-namespace \
  -f helm-charts/helm-todo-app/values-staging.yaml \
  --wait
```

### 5. Production Environment

```bash
# Production namespace için secret oluşturun
kubectl create secret docker-registry github-registry-secret \
  --namespace=production \
  --docker-server=ghcr.io \
  --docker-username=<GITHUB_USERNAME> \
  --docker-password=<GITHUB_TOKEN>

# Production environment'ı deploy edin
helm upgrade --install todo-app-prod helm-charts/helm-todo-app \
  --namespace production \
  --create-namespace \
  -f helm-charts/helm-todo-app/values-prod.yaml \
  --wait

# Production hosts entry'si ekleyin
echo "$(minikube ip) prod.todo-app.local" | sudo tee -a /etc/hosts
```

### 6. Helm Commands

```bash
# Tüm release'leri listeleyin
helm list --all-namespaces

# Release durumunu kontrol edin
helm status todo-app -n todo-app

# Template'i test edin (debug için)
helm template todo-app helm-charts/helm-todo-app

# Release'i kaldırın
helm uninstall todo-app -n todo-app
```

---

## 🔧 Aşama 4: Kustomize ile Configuration Management

Kustomize, Helm'e alternatif olarak kullanılabilir. Base konfigürasyon + overlay pattern'i kullanır.

### 1. Kustomize Kurulumu

```bash
# Kustomize'ı kurun
sudo snap install kustomize
```

### 2. Base Deployment

```bash
# Base konfigürasyonu deploy edin
kubectl apply -k kustomize/base/

# Kaynakları kontrol edin
kubectl get all -n todo-app
```

### 3. Staging Overlay

```bash
# Staging overlay'ini deploy edin
kubectl apply -k kustomize/overlays/staging/

# Staging kaynaklarını kontrol edin
kubectl get all -n staging
```

### 4. Production Overlay

```bash
# Production overlay'ini deploy edin
kubectl apply -k kustomize/overlays/production/

# Production kaynaklarını kontrol edin
kubectl get all -n production
```

### 5. Kustomize Commands

```bash
# Build output'u görmek için (apply etmeden)
kustomize build kustomize/base/
kustomize build kustomize/overlays/staging/

# Staging'i kaldırın
kubectl delete -k kustomize/overlays/staging/

# Production'ı kaldırın
kubectl delete -k kustomize/overlays/production/
```

**Not**: Kustomize kullanırken secret'ları manuel olarak oluşturmanız gerekir:

```bash
# Her namespace için secret oluşturun
kubectl create secret docker-registry github-registry-secret \
  --namespace=staging \
  --docker-server=ghcr.io \
  --docker-username=<GITHUB_USERNAME> \
  --docker-password=<GITHUB_TOKEN>
```

---

## 🔄 Aşama 5: Jenkins CI/CD Pipeline

Bu aşamada Jenkins ile otomatik CI/CD pipeline kuracağız.

### 1. Jenkins Kurulumu ve Konfigürasyon

Jenkins'i Helm ile kurun:

```bash
# Jenkins namespace oluşturun
kubectl create namespace jenkins

# Jenkins admin secret'ını oluşturun
kubectl create secret generic jenkins-admin-secret -n jenkins \
  --from-literal=jenkins-admin-user='admin' \
  --from-literal=jenkins-admin-password='SizinGucluSifreniz123!'

# Jenkins'i Helm ile kurun
helm repo add jenkins https://charts.jenkins.io
helm repo update
helm install jenkins jenkins/jenkins -f jenkins-values.yaml -n jenkins --create-namespace

# Jenkins service'ine JNLP portu ekleyin (agent connection için gerekli)
kubectl edit svc jenkins -n jenkins
# Aşağıdaki portu ekleyin:
#   - name: jnlp       
#     port: 50000
#     protocol: TCP
#     targetPort: 50000
```

### 2. Jenkins Plugin'leri

Jenkins'te aşağıdaki plugin'leri kurun:
- **Kubernetes Credentials Provider** (Kubernetes secret'ları kullanmak için)
- **Basic Branch Build Strategies** (Tag build'leri için gerekli)
- **SonarQube Scanner** (kod kalitesi analizi için)

### 2.5. SonarQube Kurulumu (İsteğe Bağlı)

SonarQube'u iki şekilde kurabilirsiniz:

#### Option A: Docker ile SonarQube

```bash
# SonarQube'u Docker ile çalıştırın
docker pull sonarqube
docker run -d --name sonarqube -p 9000:9000 sonarqube

# SonarQube'a erişin: http://192.168.49.1:9000
# Default: admin/admin
```

**SonarQube Konfigürasyonu:**

1. SonarQube'a login olun
2. Yeni proje oluşturun:
   - Project key: `Local-DevOps-Infrastructure`
   - Display name: `Local DevOps Infrastructure`
3. Token oluşturun: Administration > Security > Users > Tokens
4. Webhook oluşturun: Administration > Configuration > Webhooks
   - URL: `http://jenkins.jenkins.svc.cluster.local:8080/sonarqube-webhook/`

#### Option B: Helm ile SonarQube

```bash
# SonarQube Helm repository ekleyin
helm repo add sonarqube https://SonarSource.github.io/helm-chart-sonarqube
helm repo update

# SonarQube'u kurun
helm install sonarqube sonarqube/sonarqube -f sonarqube-values.yaml -n sonarqube --create-namespace

# Hosts dosyasına ekleyin
echo "$(minikube ip) sonarqube.local" | sudo tee -a /etc/hosts

# SonarQube'a erişin: http://sonarqube.local
```

**Jenkins SonarQube Entegrasyonu:**

1. **Manage Jenkins > Tools > SonarQube Scanner installations:**
   - Name: `SonarQube-Scanner`
   - Install automatically: Yes

2. **Manage Jenkins > Configure System > SonarQube servers:**
   - Name: `sq1`
   - Server URL: `http://sonarqube.local` (Helm) veya `http://192.168.49.1:9000` (Docker)
   - Authentication token: SonarQube'dan aldığınız token

3. **Credentials > Global > Add Credential:**
   - Kind: Secret text
   - ID: `sonarqube-token`
   - Secret: SonarQube token değeri

### 3. Jenkins Credentials

Jenkins > Manage Jenkins > Credentials'da aşağıdakileri ekleyin:

```bash
# GitHub registry için (ID: github-registry)
# Username: <GITHUB_USERNAME>
# Password: <GITHUB_TOKEN> (packages scope)

# GitHub webhook için (ID: github-webhook)  
# Username: <GITHUB_USERNAME>
# Password: <GITHUB_TOKEN> (repo, hook scopes)

# Docker config için (ID: github-registry-dockerconfig)
cat ~/.docker/config.json | base64 | tr -d '\n'
# Bu output'u "Secret text" olarak kaydedin
```

### 4. Jenkins Global Configuration

**Manage Jenkins > Configure System:**

```bash
# Global Pipeline Libraries
Name: todo-app-shared-library
Default version: master
Retrieval method: Modern SCM
Source Code Management: Git
Project Repository: <YOUR_SHARED_LIBRARY_REPO>

# Global properties (Environment variables)
ARGOCD_SERVER: argocd.todo-app.local

# SonarQube Servers (eğer kullanıyorsanız)
Name: sq1
Server URL: http://sonarqube.local
```

**Manage Jenkins > Tools:**

```bash
# SonarQube Scanner installations
Name: SonarQube-Scanner
Install automatically: Yes
```

### 5. Kubernetes Cloud Configuration

**Manage Jenkins > Clouds > Add Kubernetes:**

```bash
Kubernetes URL: https://kubernetes.default.svc
Kubernetes Namespace: jenkins
Credentials: kubernetes service account
```

**Not**: Eski versiyonlarda kubeconfig dosyası gerekebilir:

```bash
# Kubeconfig dosyası oluşturun (gerekirse)
kubectl config view --raw --minify > kubeconfig.yaml

# Jenkins'te "Secret file" olarak ekleyin
# Ancak modern Kubernetes plugin'i ile bu gerekli değildir
```

### 6. Pipeline Job Oluşturma

Jenkins'te Multibranch Pipeline job oluşturun:

```bash
# Branch Sources
GitHub
Owner: <YOUR_GITHUB_USERNAME>
Repository: local-devops-infrastructure
Credentials: github-webhook

# Build Configuration
Script Path: Jenkinsfile

# Scan Repository Triggers
Periodically if not otherwise run: Yes
Interval: 1 minute

# Build Strategies
Regular branches: Any
Tags: Tags matching a pattern v*
```

---

## 🏃‍♂️ Aşama 6: GitOps ile ArgoCD

Bu son aşamada GitOps workflow'unu ArgoCD ile kuracağız.

### 1. ArgoCD Kurulumu

```bash
# ArgoCD namespace oluşturun
kubectl create namespace argocd

# ArgoCD'yi kurun
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# ArgoCD ingress'ini kurun
kubectl apply -f k8s/argocd-ingress.yaml

# Hosts dosyasına ekleyin
echo "$(minikube ip) argocd.todo-app.local" | sudo tee -a /etc/hosts
```

### 2. ArgoCD Admin Erişimi

```bash
# Admin şifresini alın
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# ArgoCD'ye web'den erişin: https://argocd.todo-app.local
# Username: admin
# Password: yukarıda aldığınız şifre
```

### 3. ArgoCD CLI Kurulumu

```bash
# ArgoCD CLI'yi indirin
curl -SL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64

# ArgoCD'ye login olun
argocd login argocd.todo-app.local --insecure --grpc-web

# API token oluşturun (Jenkins için gerekli)
kubectl patch configmap/argocd-cm --type merge -p '{"data":{"accounts.admin":"apiKey"}}' -n argocd
argocd account generate-token
```

### 4. GitOps Repository Secrets

ArgoCD'nin imajları çekebilmesi için secret'ları oluşturun:

```bash
# Staging için
kubectl create secret docker-registry github-registry-secret \
  --namespace=staging \
  --docker-server=ghcr.io \
  --docker-username=<GITHUB_USERNAME> \
  --docker-password=<GITHUB_TOKEN>

# Production için
kubectl create secret docker-registry github-registry-secret \
  --namespace=production \
  --docker-server=ghcr.io \
  --docker-username=<GITHUB_USERNAME> \
  --docker-password=<GITHUB_TOKEN>
```

**Önemli Not**: Helm chart'ınızda imagePullSecret oluşturma özelliği kapalı olmalıdır çünkü ArgoCD'nin Jenkins credential'larına erişimi yoktur. Secret'ları manuel olarak oluşturduk.

### 5. Jenkins ArgoCD Credentials

Jenkins'te ArgoCD erişimi için credential'lar ekleyin:

```bash
# Credentials > Global > Add Credential
# ID: argocd-username, Value: admin
# ID: argocd-password, Value: <ARGOCD_ADMIN_PASSWORD>
```

### 6. Root Application Deployment

```bash
# GitOps root application'ını deploy edin
kubectl apply -f todo-app-gitops/argocd-manifests/root-application.yaml -n argocd
```

Bu komut App of Apps pattern'ini başlatır ve staging/production application'larını otomatik olarak oluşturur.

### 7. Pipeline Test

Artık tam GitOps workflow'u test edebilirsiniz:

```bash
# Feature branch oluşturun
git checkout -b feature/test-pipeline
git push origin feature/test-pipeline

# Jenkins pipeline'ı build + test yapacak

# Master'a merge edin
git checkout master
git merge feature/test-pipeline
git push origin master

# Jenkins staging'e deploy edecek

# Production tag'i oluşturun
git tag v1.0.0
git push origin v1.0.0

# Jenkins production'a deploy edecek
```

### 8. ArgoCD Application Temizleme (gerekirse)

```bash
# Tüm application'ları temizlemek için finalizer'ları kaldırın
kubectl patch application staging-todo-app -n argocd -p '{"metadata":{"finalizers":null}}' --type=merge
kubectl patch application production-todo-app -n argocd -p '{"metadata":{"finalizers":null}}' --type=merge
kubectl patch application root-app -n argocd -p '{"metadata":{"finalizers":null}}' --type=merge

# Namespace'leri temizleyin
kubectl delete all --all -n staging
kubectl delete all --all -n production
```

---

## 📋 Teknoloji Özeti

Bu proje 6 farklı aşamada ilerleyebilir:

1. **🐳 Docker Compose** - Geliştirme ortamı
2. **☸️ Kubernetes** - Container orchestration
3. **⛵ Helm** - Package management + multi-environment
4. **🔧 Kustomize** - Helm alternatifi, overlay pattern
5. **🔄 Jenkins** - CI/CD pipeline
6. **🏃‍♂️ ArgoCD** - GitOps deployment

## 🔄 Pipeline Workflow Özeti

### Shared Library Functions
- `buildAllServices()` - Paralel servis build'i
- `runUnitTests()` - Paralel test çalıştırma
- `pushToRegistry()` - Docker registry'ye push
- `deployWithHelm()` - Helm deployment
- `argoDeployStaging()` - ArgoCD staging sync
- `argoDeployProduction()` - ArgoCD production sync
- `runHadolint()` - Dockerfile linting
- `runTrivyScan()` - Güvenlik taraması

### Pipeline Akışı
1. **Feature Branch** → Build + Test + Analysis
2. **Master Branch** → Registry Push + Staging Deploy
3. **Git Tag (v*)** → Production Deploy

## 🔧 Konfigürasyon

### Pre-commit Hooks
```bash
# Pre-commit'i kurun
pip install pre-commit

# Hook'ları aktive edin
pre-commit install

# Tüm dosyalarda çalıştırın
pre-commit run --all-files
```

### Jenkins Credentials
Aşağıdaki credential'ları Jenkins'te tanımlamanız gerekir:

- `github-registry`: GitHub Container Registry için
- `github-webhook`: GitHub webhook için (repo + hook scopes)
- `argocd-username`: ArgoCD kullanıcı adı
- `argocd-password`: ArgoCD şifresi
- `sonarqube-token`: SonarQube token'ı (kullanıyorsanız)

### Jenkins Global Properties
Jenkins'te aşağıdaki environment variable'ı tanımlayın:
- `ARGOCD_SERVER`: argocd.todo-app.local

## 🛠️ Troubleshooting

### Yaygın Sorunlar ve Çözümleri

#### 1. Docker Compose Sorunları
```bash
# Port çakışması
docker compose down
sudo lsof -i :3000  # Port 3000'i kullanan işlemi bulun

# Volume sorunları
docker compose down -v
docker system prune -f
```

#### 2. Kubernetes Sorunları
```bash
# Pod'ların durumunu kontrol edin
kubectl get pods -n todo-app

# Pod loglarını inceleyin
kubectl logs -f deployment/user-service -n todo-app

# Secret'ları kontrol edin
kubectl get secrets -n todo-app
```

#### 3. Image Pull Sorunları
```bash
# Registry secret'ını kontrol edin
kubectl get secret github-registry-secret -n todo-app -o yaml

# Yeni secret oluşturun
kubectl delete secret github-registry-secret -n todo-app
kubectl create secret docker-registry github-registry-secret \
  --docker-server=ghcr.io \
  --docker-username=<USERNAME> \
  --docker-password=<TOKEN> \
  -n todo-app
```

#### 4. ArgoCD Sorunları
```bash
# ArgoCD application'larını kontrol edin
kubectl get applications -n argocd

# Application detaylarını inceleyin
kubectl describe application staging-todo-app -n argocd

# ArgoCD server pod'unu yeniden başlatın
kubectl rollout restart deployment argocd-server -n argocd
```

### Health Checks
Tüm servisler `/health` endpoint'i sunar:

```bash
# Servislerin sağlık durumunu kontrol edin
curl http://localhost:8001/health  # User Service
curl http://localhost:8002/health  # Todo Service
```

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje Sahibi: Kerem AR
- GitHub: [@KeremAR](https://github.com/KeremAR)

---

**Not**: Bu proje eğitim ve demonstrasyon amaçlıdır. Production ortamında kullanmadan önce güvenlik ayarlarını gözden geçirin.