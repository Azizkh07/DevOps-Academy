# 🚀 DevOps Academy - Quick Start Guide

Welcome to DevOps Academy! This guide will help you get started quickly.

## 🎯 Project Overview

DevOps Academy is a comprehensive learning platform showcasing modern DevOps practices including:
- 🐳 Docker containerization
- ☸️ Kubernetes orchestration
- 🔄 CI/CD pipelines (Jenkins & GitLab)
- 🔁 GitOps with ArgoCD
- 🏗️ Infrastructure as Code (Terraform)

## 📋 Prerequisites

Before starting, ensure you have:
- [x] Git installed
- [x] Node.js 18+ installed
- [x] Docker & Docker Compose installed
- [x] (Optional) Kubernetes cluster access

## 🚀 Quick Start (Local Development)

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/Azizkh07/DevOps-Academy.git
cd DevOps-Academy

# 2. Copy environment file
copy .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. Access the application
# Frontend: http://localhost:3000
# Backend:  http://localhost:5001
# MySQL:    localhost:3307
```

### Option 2: Manual Setup

#### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### Database
```bash
# Start MySQL
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=ROOT \
  -e MYSQL_DATABASE=legal_education_mysql5 \
  -p 3307:3306 \
  mysql:5.7
```

## 👨‍💼 Default Admin Credentials

```
Email:    admin@devopsacademy.com
Password: admin123
```

## 📁 Project Structure

```
DevOps-Academy/
├── backend/              # Node.js Express API
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── frontend/             # React Application
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── k8s/                  # Kubernetes manifests
├── argocd/               # ArgoCD configurations
├── terraform/            # Infrastructure as Code
├── docker-compose.yml    # Local orchestration
├── Jenkinsfile           # Jenkins CI/CD
└── .gitlab-ci.yml        # GitLab CI/CD
```

## 🔧 Available Scripts

### Backend
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm test            # Run tests
```

### Frontend
```bash
npm start           # Start development server
npm run build       # Build for production
npm test            # Run tests
```

## 🐳 Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Rebuild and restart
docker-compose up -d --build
```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (Minikube, EKS, GKE, AKS)
- kubectl configured
- Docker images pushed to registry

### Deploy
```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy database
kubectl apply -f k8s/mysql-deployment.yaml

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Check status
kubectl get all -n devops-academy

# Access application
kubectl port-forward svc/frontend -n devops-academy 3000:80
```

## 🔄 CI/CD Setup

### Jenkins
1. Install Jenkins
2. Install required plugins (Docker, Kubernetes, Git)
3. Add credentials (Docker Hub, Kubeconfig)
4. Create pipeline from SCM
5. Point to this repository's `Jenkinsfile`

### GitLab CI/CD
1. Push code to GitLab
2. Add CI/CD variables:
   - `CI_REGISTRY_USER`
   - `CI_REGISTRY_PASSWORD`
   - `KUBE_CONFIG`
3. Pipeline runs automatically on push

## 🔁 ArgoCD Setup

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Create application
kubectl apply -f argocd/application.yaml
```

## 🏗️ Terraform Infrastructure

```bash
cd terraform

# Initialize
terraform init

# Plan
terraform plan

# Apply
terraform apply

# View outputs
terraform output
```

## 📚 Documentation

- **[DEVOPS.md](./DEVOPS.md)** - Complete DevOps implementation guide
- **[terraform/README.md](./terraform/README.md)** - Terraform documentation
- **Backend API** - See `backend/README.md`
- **Frontend** - See `frontend/README.md`

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Docker Build Fails
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Database Connection Error
```bash
# Check MySQL is running
docker-compose ps mysql

# Check logs
docker-compose logs mysql

# Verify credentials in .env file
```

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5001
DATABASE_URL=mysql://root:ROOT@localhost:3307/legal_education_mysql5
JWT_SECRET=your-jwt-secret
DEFAULT_ADMIN_EMAIL=admin@devopsacademy.com
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5001
```

## 📊 Monitoring

### View Application Logs
```bash
# Docker
docker-compose logs -f backend
docker-compose logs -f frontend

# Kubernetes
kubectl logs -f deployment/backend -n devops-academy
kubectl logs -f deployment/frontend -n devops-academy
```

### Check Resource Usage
```bash
# Docker
docker stats

# Kubernetes
kubectl top nodes
kubectl top pods -n devops-academy
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

## 🌐 Accessing the Application

### Local Development
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Health**: http://localhost:5001/health

### Kubernetes
```bash
# Port forward frontend
kubectl port-forward svc/frontend -n devops-academy 3000:80

# Port forward backend
kubectl port-forward svc/backend -n devops-academy 5001:5001
```

## 📦 Building for Production

```bash
# Build Docker images
docker build -t azizkh07/devops-academy-backend:latest ./backend
docker build -t azizkh07/devops-academy-frontend:latest ./frontend

# Push to registry
docker push azizkh07/devops-academy-backend:latest
docker push azizkh07/devops-academy-frontend:latest
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📧 Support

- **Email**: admin@devopsacademy.com
- **GitHub Issues**: [Open an issue](https://github.com/Azizkh07/DevOps-Academy/issues)
- **Documentation**: See [DEVOPS.md](./DEVOPS.md)

## 📝 License

This project is licensed under the MIT License.

## ⭐ Show Your Support

If this project helped you, please give it a ⭐!

---

**Happy Learning! 🚀**
