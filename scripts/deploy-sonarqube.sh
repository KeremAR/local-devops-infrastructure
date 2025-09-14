#!/bin/bash

# SonarQube Helm Deployment Script
# Bu script SonarQube'u Minikube'de deploy eder

set -e

echo "🚀 SonarQube Helm Deployment Starting..."

# Helm repo'yu ekle
echo "📦 Adding SonarQube Helm repository..."
helm repo add sonarqube https://SonarSource.github.io/helm-chart-sonarqube
helm repo update

# Namespace oluştur
echo "🏗️ Creating sonarqube namespace..."
kubectl create namespace sonarqube --dry-run=client -o yaml | kubectl apply -f -

# SonarQube'u deploy et
echo "🔧 Deploying SonarQube with Helm..."
helm upgrade --install sonarqube sonarqube/sonarqube \
  --namespace sonarqube \
  --values helm/sonarqube-values.yaml \
  --timeout 10m \
  --wait

# Deployment durumunu kontrol et
echo "🔍 Checking deployment status..."
kubectl get pods -n sonarqube
kubectl get svc -n sonarqube
kubectl get ingress -n sonarqube

# Minikube IP'sini al ve hosts dosyası için bilgi ver
MINIKUBE_IP=$(minikube ip)
echo ""
echo "✅ SonarQube deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Add to /etc/hosts: $MINIKUBE_IP sonarqube.local"
echo "2. Access SonarQube at: http://sonarqube.local"
echo "3. Login with: admin / admin123"
echo ""
echo "🔧 Commands to add to /etc/hosts:"
echo "sudo echo '$MINIKUBE_IP sonarqube.local' >> /etc/hosts"
echo ""
echo "📊 Check deployment status:"
echo "kubectl get pods -n sonarqube"
echo "kubectl logs -f deployment/sonarqube -n sonarqube"
