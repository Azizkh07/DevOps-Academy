#!/bin/bash

# 🚀 DevOps Academy - Phase 2 Ubuntu VM Automated Setup
# This script automates the entire Phase 2 deployment

set -e

echo "================================"
echo "🚀 DevOps Academy - Phase 2 Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    error "This script must run on Ubuntu Linux"
    exit 1
fi

# Step 1: Check Docker
info "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    error "Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    success "Docker installed"
else
    success "Docker already installed"
fi

# Step 2: Check kubectl
info "Checking kubectl installation..."
if ! command -v kubectl &> /dev/null; then
    error "kubectl not found. Installing..."
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
    rm kubectl
    success "kubectl installed"
else
    success "kubectl already installed"
fi

# Step 3: Check Kind
info "Checking Kind installation..."
if ! command -v kind &> /dev/null; then
    error "Kind not found. Installing..."
    curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
    chmod +x ./kind
    sudo mv ./kind /usr/local/bin/kind
    success "Kind installed"
else
    success "Kind already installed"
fi

# Step 4: Create Kind cluster
info "Creating Kind cluster..."
if kind get clusters | grep -q "devops-academy"; then
    info "Cluster already exists. Deleting and recreating..."
    kind delete cluster --name devops-academy
fi

./scripts/create-kind-cluster.sh
success "Kind cluster created"

# Step 5: Build Docker images
info "Building backend image..."
docker build -t devops-academy-backend:latest ./backend
success "Backend image built"

info "Building frontend image..."
docker build -t devops-academy-frontend:latest ./frontend
success "Frontend image built"

# Step 6: Load images into Kind
info "Loading images into Kind cluster..."
kind load docker-image devops-academy-backend:latest --name devops-academy
kind load docker-image devops-academy-frontend:latest --name devops-academy
success "Images loaded into cluster"

# Step 7: Deploy to Kubernetes
info "Deploying namespace..."
kubectl apply -f k8s/namespace.yaml
success "Namespace created"

info "Deploying MySQL (this takes 2-3 minutes)..."
kubectl apply -f k8s/mysql-deployment.yaml
kubectl wait --for=condition=ready pod -l app=mysql -n devops-academy --timeout=300s
success "MySQL deployed and ready"

# Step 8: Import database
info "Importing database schema..."
if [ -f "frontend/education_platform_backup_mysql5.sql" ]; then
    # Wait a bit more for MySQL to be fully ready
    sleep 10
    
    # Copy SQL file to pod
    kubectl cp frontend/education_platform_backup_mysql5.sql devops-academy/mysql-0:/tmp/backup.sql
    
    # Import database
    kubectl exec -n devops-academy mysql-0 -- mysql -ulegal_app_user -pROOT legal_education_mysql5 -e "SOURCE /tmp/backup.sql"
    
    # Verify
    TABLES=$(kubectl exec -n devops-academy mysql-0 -- mysql -ulegal_app_user -pROOT legal_education_mysql5 -e "SHOW TABLES;" | tail -n +2 | wc -l)
    
    if [ "$TABLES" -gt 0 ]; then
        success "Database imported successfully ($TABLES tables)"
    else
        error "Database import may have failed"
    fi
else
    error "SQL backup file not found at frontend/education_platform_backup_mysql5.sql"
    info "You'll need to import the database manually"
fi

# Step 9: Deploy Backend
info "Deploying Backend..."
kubectl apply -f k8s/backend-deployment.yaml
kubectl wait --for=condition=ready pod -l app=backend -n devops-academy --timeout=300s
success "Backend deployed and ready"

# Step 10: Deploy Frontend
info "Deploying Frontend..."
kubectl apply -f k8s/frontend-deployment.yaml
kubectl wait --for=condition=ready pod -l app=frontend -n devops-academy --timeout=300s
success "Frontend deployed and ready"

# Step 11: Verify deployment
echo ""
echo "================================"
echo "📊 Deployment Status"
echo "================================"
kubectl get all -n devops-academy
echo ""

# Step 12: Setup port forwarding
info "Setting up port forwarding..."
# Kill any existing port forwards
pkill -f "kubectl port-forward" 2>/dev/null || true

# Start port forwards in background
nohup kubectl port-forward -n devops-academy svc/frontend 8080:80 --address=0.0.0.0 > /tmp/frontend-pf.log 2>&1 &
nohup kubectl port-forward -n devops-academy svc/backend 5001:5001 --address=0.0.0.0 > /tmp/backend-pf.log 2>&1 &

sleep 3
success "Port forwarding configured"

# Step 13: Test endpoints
echo ""
echo "================================"
echo "🧪 Testing Endpoints"
echo "================================"

info "Testing backend health..."
if curl -s http://localhost:5001/health > /dev/null; then
    success "Backend health check passed"
else
    error "Backend health check failed"
fi

info "Testing backend API..."
if curl -s http://localhost:5001/api/courses > /dev/null; then
    success "Backend API responding"
else
    error "Backend API not responding"
fi

# Final summary
echo ""
echo "================================"
echo "✅ Phase 2 Deployment Complete!"
echo "================================"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://$(hostname -I | awk '{print $1}'):8080"
echo "   Backend:  http://$(hostname -I | awk '{print $1}'):5001"
echo ""
echo "🔐 Login Credentials:"
echo "   Email:    admin@devopsacademy.com"
echo "   Password: admin123"
echo ""
echo "📝 Useful Commands:"
echo "   View pods:    kubectl get pods -n devops-academy"
echo "   View logs:    kubectl logs -n devops-academy -l app=backend -f"
echo "   Port forward: kubectl port-forward -n devops-academy svc/frontend 8080:80 --address=0.0.0.0"
echo ""
echo "🚀 Next Steps: Open PHASE2_UBUNTU_DEPLOYMENT.md for monitoring, ArgoCD, and CI/CD setup"
echo ""
