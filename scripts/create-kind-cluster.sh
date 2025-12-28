#!/bin/bash

# 🚀 DevOps Academy - Kind Cluster Setup Script
# This script creates a Kind cluster optimized for local development

set -e

echo "🚀 Creating Kind cluster for DevOps Academy..."

# Create Kind cluster with port mappings
cat <<EOF | kind create cluster --name devops-academy --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  # Frontend port
  - containerPort: 30000
    hostPort: 8080
    protocol: TCP
  # Backend port  
  - containerPort: 30001
    hostPort: 5001
    protocol: TCP
  # Ingress HTTP
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  # Ingress HTTPS
  - containerPort: 443
    hostPort: 443
    protocol: TCP
  # n8n port
  - containerPort: 30678
    hostPort: 30678
    protocol: TCP
  # Jenkins port
  - containerPort: 30080
    hostPort: 30080
    protocol: TCP
  # Prometheus port
  - containerPort: 30090
    hostPort: 30090
    protocol: TCP
  # Grafana port
  - containerPort: 30300
    hostPort: 30300
    protocol: TCP
EOF

echo "✅ Kind cluster created successfully!"

# Verify cluster
echo "🔍 Verifying cluster..."
kubectl cluster-info --context kind-devops-academy
kubectl get nodes

echo "✅ Cluster is ready!"
echo ""
echo "Next steps:"
echo "1. Deploy application: kubectl apply -f k8s/"
echo "2. Check status: kubectl get all -n devops-academy"
echo "3. Access frontend: kubectl port-forward -n devops-academy svc/frontend 8080:80"
