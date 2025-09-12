#!/bin/bash

echo "🚀 Minikube ile Todo App deployment başlıyor..."

# Minikube'u başlat
echo "1. Minikube başlatılıyor..."
minikube start --driver=docker

# Ingress addon'unu aktif et
echo "2. Ingress addon aktif ediliyor..."
minikube addons enable ingress

# Docker environment'ı Minikube'a yönlendir
echo "3. Docker environment Minikube'a yönlendiriliyor..."
eval $(minikube docker-env)

# Docker image'ları build et
echo "4. Docker image'ları build ediliyor..."
docker build -t local-devops-infrastructure-user-service:latest -f user-service/Dockerfile .
docker build -t local-devops-infrastructure-todo-service:latest -f todo-service/Dockerfile .
docker build -t local-devops-infrastructure-frontend:latest ./frontend2/frontend

# Kubernetes dosyalarını apply et
echo "5. Kubernetes dosyaları apply ediliyor..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/user-service-deployment.yaml
kubectl apply -f k8s/user-service-service.yaml
kubectl apply -f k8s/todo-service-deployment.yaml
kubectl apply -f k8s/todo-service-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml

# /etc/hosts dosyasına entry ekle
echo "6. /etc/hosts dosyasına entry ekleniyor..."
MINIKUBE_IP=$(minikube ip)
echo "🔧 /etc/hosts dosyanıza şu satırı ekleyin:"
echo "$MINIKUBE_IP todo-app.local"

echo "✅ Deployment tamamlandı!"
echo "🌐 Uygulamaya erişim: http://todo-app.local"
echo "📊 Minikube dashboard: minikube dashboard"