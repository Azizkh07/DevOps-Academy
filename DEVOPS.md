# 🚀 DevOps Academy - Complete DevOps Implementation Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Phase 1: Docker Containerization](#phase-1-docker-containerization)
5. [Phase 2: Kubernetes Deployment](#phase-2-kubernetes-deployment)
6. [Phase 3: CI/CD Pipelines](#phase-3-cicd-pipelines)
7. [Phase 4: GitOps with ArgoCD](#phase-4-gitops-with-argocd)
8. [Phase 5: Infrastructure as Code (Terraform)](#phase-5-infrastructure-as-code-terraform)
9. [Monitoring & Logging](#monitoring--logging)
10. [Security Best Practices](#security-best-practices)

---

## 🎯 Overview

This project demonstrates a **complete DevOps implementation** for a modern web application (DevOps Academy learning platform) using industry-standard tools and best practices.

### Technologies Used
- **Containerization**: Docker, docker-compose
- **Orchestration**: Kubernetes (EKS)
- **CI/CD**: Jenkins, GitLab CI/CD
- **GitOps**: ArgoCD
- **Infrastructure as Code**: Terraform
- **Cloud Provider**: AWS
- **Monitoring**: Prometheus, Grafana (coming soon)
- **Security**: Trivy, SonarQube, npm audit

---

## 🏗️ Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                      GitHub Repository                   │
│              (Source Code + K8s Manifests)              │
└────────────┬────────────────────────────────────────────┘
             │
             ├──► Jenkins/GitLab CI (Build & Test)
             │    │
             │    ├──► Docker Build
             │    ├──► Security Scan (Trivy)
             │    ├──► Push to Registry
             │    └──► Update K8s Manifests
             │
             ├──► ArgoCD (GitOps Deployment)
             │    │
             │    └──► Sync to Kubernetes
             │
             ▼
    ┌─────────────────────────────────┐
    │       AWS EKS Cluster           │
    │  ┌───────────────────────────┐  │
    │  │   Namespace: devops-academy│  │
    │  │                            │  │
    │  │  ┌──────────────────────┐ │  │
    │  │  │  Frontend (React)     │ │  │
    │  │  │  - 3 replicas         │ │  │
    │  │  │  - Nginx              │ │  │
    │  │  │  - HPA enabled        │ │  │
    │  │  └──────────────────────┘ │  │
    │  │                            │  │
    │  │  ┌──────────────────────┐ │  │
    │  │  │  Backend (Node.js)    │ │  │
    │  │  │  - 3 replicas         │ │  │
    │  │  │  - Express API        │ │  │
    │  │  │  - HPA enabled        │ │  │
    │  │  └──────────────────────┘ │  │
    │  │                            │  │
    │  │  ┌──────────────────────┐ │  │
    │  │  │  MySQL Database       │ │  │
    │  │  │  - StatefulSet        │ │  │
    │  │  │  - PersistentVolume   │ │  │
    │  │  └──────────────────────┘ │  │
    │  └───────────────────────────┘  │
    └─────────────────────────────────┘
```

---

## ✅ Prerequisites

### Required Tools
```bash
# Docker
docker --version  # 20.10+

# Docker Compose
docker-compose --version  # 1.29+

# Kubernetes CLI
kubectl version --client  # 1.28+

# AWS CLI
aws --version  # 2.0+

# Terraform
terraform --version  # 1.0+

# Helm
helm version  # 3.0+

# ArgoCD CLI
argocd version  # 2.0+
```

### AWS Account Setup
1. Create an AWS account
2. Configure AWS credentials:
```bash
aws configure
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: us-east-1
# Default output format: json
```

---

## 🐳 Phase 1: Docker Containerization

### 1.1 Understanding Docker

**Docker** allows you to package your application with all its dependencies into a container that runs consistently across any environment.

### 1.2 Building Docker Images

#### Backend Dockerfile Analysis
```dockerfile
# Multi-stage build for efficiency
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage - minimal image
FROM node:18-alpine
RUN apk add --no-cache dumb-init
USER node
WORKDIR /app
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
EXPOSE 5001
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5001/health')"
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

**Key Features:**
- ✅ Multi-stage build (reduces final image size by ~70%)
- ✅ Non-root user (security best practice)
- ✅ Health checks (for container orchestration)
- ✅ Alpine Linux (minimal base image)
- ✅ dumb-init (proper signal handling)

#### Frontend Dockerfile Analysis
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

### 1.3 Build and Run Locally

```bash
# Build images
cd backend
docker build -t devops-academy-backend:latest .

cd ../frontend
docker build --build-arg REACT_APP_API_URL=http://localhost:5001 -t devops-academy-frontend:latest .

# Run with docker-compose
cd ..
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5001
# MySQL: localhost:3307
```

### 1.4 Docker Compose Explained

```yaml
services:
  mysql:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: ROOT
      MYSQL_DATABASE: devops_academy_db
    volumes:
      - mysql_data:/var/lib/mysql  # Data persistence
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      
  backend:
    build: ./backend
    depends_on:
      mysql:
        condition: service_healthy  # Wait for MySQL
    environment:
      DATABASE_URL: mysql://root:ROOT@mysql:3306/devops_academy_db
    volumes:
      - ./backend/uploads:/app/uploads  # File uploads
      
  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "3000:80"  # Map host:container
```

**Key Concepts:**
- **Services**: Independent containers
- **Depends_on**: Startup order
- **Volumes**: Data persistence
- **Networks**: Container communication
- **Health checks**: Service readiness

---

## ☸️ Phase 2: Kubernetes Deployment

### 2.1 Understanding Kubernetes

**Kubernetes (K8s)** is a container orchestration platform that automates deployment, scaling, and management of containerized applications.

### 2.2 Setting Up Local Kubernetes

```bash
# Option 1: Minikube (recommended for learning)
minikube start --cpus 4 --memory 8192 --driver=docker

# Option 2: Docker Desktop (Windows/Mac)
# Enable Kubernetes in Docker Desktop settings

# Verify cluster
kubectl cluster-info
kubectl get nodes
```

### 2.3 Kubernetes Concepts Explained

#### Namespace
Isolated virtual cluster within a physical cluster.

```bash
kubectl apply -f k8s/namespace.yaml
kubectl get namespaces
```

#### Deployments
Manages stateless applications with replicas and rolling updates.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3  # Run 3 copies
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: azizkh07/devops-academy-backend:latest
        resources:
          requests:
            memory: "256Mi"  # Minimum required
            cpu: "200m"
          limits:
            memory: "512Mi"  # Maximum allowed
            cpu: "500m"
```

#### StatefulSet
Manages stateful applications like databases with stable network identities.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql
  replicas: 1
  # Stable storage with PersistentVolumeClaim
  volumeClaimTemplates:
  - metadata:
      name: mysql-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
```

#### Services
Exposes applications to network traffic.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  type: ClusterIP  # Internal only
  ports:
  - port: 5001
    targetPort: 5001
  selector:
    app: backend  # Routes to pods with this label
```

**Service Types:**
- **ClusterIP**: Internal cluster communication
- **LoadBalancer**: External access with cloud load balancer
- **NodePort**: External access via node IP + port

#### Ingress
HTTP/HTTPS routing to services.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: devops-academy-ingress
spec:
  rules:
  - host: devopsacademy.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 5001
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

### 2.4 Deploying to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Check deployments
kubectl get all -n devops-academy

# Check pods
kubectl get pods -n devops-academy -w

# View pod logs
kubectl logs -n devops-academy <pod-name>

# Describe pod (debugging)
kubectl describe pod -n devops-academy <pod-name>

# Execute commands in pod
kubectl exec -it -n devops-academy <pod-name> -- /bin/sh
```

### 2.5 Scaling and Auto-Scaling

```bash
# Manual scaling
kubectl scale deployment backend -n devops-academy --replicas=5

# Check HPA (Horizontal Pod Autoscaler)
kubectl get hpa -n devops-academy

# HPA will automatically scale based on CPU/Memory:
# - Min replicas: 2
# - Max replicas: 10
# - Scale up when CPU > 70%
```

---

## 🔄 Phase 3: CI/CD Pipelines

### 3.1 Jenkins Pipeline

#### 3.1.1 Installing Jenkins

```bash
# Using Docker
docker run -d -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  --name jenkins \
  jenkins/jenkins:lts

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# Access Jenkins: http://localhost:8080
```

#### 3.1.2 Configure Jenkins

1. **Install Plugins:**
   - Docker Pipeline
   - Kubernetes CLI
   - Git
   - SonarQube Scanner
   - Slack Notification

2. **Add Credentials:**
   - Docker Hub username/password (ID: `dockerhub-credentials`)
   - Kubernetes config (ID: `kubeconfig`)
   - SonarQube token (ID: `sonarqube-token`)
   - Slack webhook (ID: `slack-webhook`)

3. **Create Pipeline:**
   - New Item → Pipeline
   - Pipeline from SCM → Git
   - Repository: `https://github.com/Azizkh07/DevOps-Academy.git`
   - Script Path: `Jenkinsfile`

#### 3.1.3 Jenkinsfile Explained

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE_PREFIX = 'azizkh07'
        K8S_NAMESPACE = 'devops-academy'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Azizkh07/DevOps-Academy.git'
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Code Quality & Security') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('SonarQube Analysis') {
                    steps {
                        withSonarQubeEnv('SonarQube') {
                            sh 'sonar-scanner'
                        }
                    }
                }
                stage('Security Audit') {
                    steps {
                        sh 'npm audit --audit-level=moderate'
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        script {
                            docker.build("${DOCKER_IMAGE_PREFIX}/devops-academy-backend:${env.BUILD_NUMBER}", "./backend")
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        script {
                            docker.build("${DOCKER_IMAGE_PREFIX}/devops-academy-frontend:${env.BUILD_NUMBER}", "./frontend")
                        }
                    }
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'dockerhub-credentials') {
                        docker.image("${DOCKER_IMAGE_PREFIX}/devops-academy-backend:${env.BUILD_NUMBER}").push()
                        docker.image("${DOCKER_IMAGE_PREFIX}/devops-academy-backend:${env.BUILD_NUMBER}").push('latest')
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig']) {
                    sh """
                        kubectl set image deployment/backend backend=${DOCKER_IMAGE_PREFIX}/devops-academy-backend:${env.BUILD_NUMBER} -n ${K8S_NAMESPACE}
                        kubectl rollout status deployment/backend -n ${K8S_NAMESPACE}
                    """
                }
            }
        }
    }
    
    post {
        success {
            slackSend(color: 'good', message: "✅ Build #${env.BUILD_NUMBER} succeeded!")
        }
        failure {
            slackSend(color: 'danger', message: "❌ Build #${env.BUILD_NUMBER} failed!")
        }
    }
}
```

**Pipeline Stages Explained:**
1. **Checkout**: Clone repository
2. **Install Dependencies**: npm ci (clean install)
3. **Code Quality**: Lint, SonarQube, security audit (parallel)
4. **Build**: Create Docker images (parallel)
5. **Push**: Upload to Docker registry
6. **Deploy**: Update Kubernetes deployment
7. **Post**: Slack notifications

### 3.2 GitLab CI/CD

#### 3.2.1 .gitlab-ci.yml Explained

```yaml
# Pipeline stages
stages:
  - build
  - test
  - security
  - docker
  - deploy
  - notify

# Global variables
variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

# Build jobs (parallel)
build:backend:
  stage: build
  image: node:18-alpine
  script:
    - cd backend
    - npm ci
    - npm run build
  artifacts:
    paths:
      - backend/dist/
    expire_in: 1 hour

build:frontend:
  stage: build
  image: node:18-alpine
  script:
    - cd frontend
    - npm ci
    - npm run build
  artifacts:
    paths:
      - frontend/build/
    expire_in: 1 hour

# Test jobs
test:backend:
  stage: test
  script:
    - cd backend
    - npm ci
    - npm test
  coverage: '/Statements\s*:\s*(\d+\.\d+)%/'

# Security scanning
security:trivy:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL azizkh07/devops-academy-backend:latest

# Docker build and push
docker:backend:
  stage: docker
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD
    - docker build -t azizkh07/devops-academy-backend:$CI_COMMIT_SHORT_SHA ./backend
    - docker push azizkh07/devops-academy-backend:$CI_COMMIT_SHORT_SHA
  only:
    - main
    - develop

# Deploy to staging
deploy:staging:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context devops-academy-staging
    - kubectl set image deployment/backend backend=azizkh07/devops-academy-backend:$CI_COMMIT_SHORT_SHA
    - kubectl rollout status deployment/backend -n devops-academy
  environment:
    name: staging
    url: https://staging.devopsacademy.com
  only:
    - develop

# Deploy to production (manual)
deploy:production:
  stage: deploy
  script:
    - kubectl set image deployment/backend backend=azizkh07/devops-academy-backend:$CI_COMMIT_SHORT_SHA
  environment:
    name: production
    url: https://devopsacademy.com
  when: manual
  only:
    - main

# ArgoCD sync
deploy:argocd-sync:
  stage: deploy
  script:
    - argocd app sync devops-academy
    - argocd app wait devops-academy --health
  only:
    - main

# Slack notification
notify:slack:
  stage: notify
  script:
    - |
      curl -X POST -H 'Content-type: application/json' \
      --data "{\"text\":\"✅ Deployment successful: $CI_PROJECT_NAME #$CI_PIPELINE_ID\"}" \
      $SLACK_WEBHOOK_URL
  when: on_success
```

---

## 🔁 Phase 4: GitOps with ArgoCD

### 4.1 Installing ArgoCD

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Expose ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Login via CLI
argocd login localhost:8080

# Access UI: https://localhost:8080
# Username: admin
# Password: (from above command)
```

### 4.2 Deploying Application with ArgoCD

```bash
# Create application
kubectl apply -f argocd/application.yaml

# Or via CLI
argocd app create devops-academy \
  --repo https://github.com/Azizkh07/DevOps-Academy.git \
  --path k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace devops-academy \
  --sync-policy automated \
  --auto-prune \
  --self-heal

# Check application status
argocd app get devops-academy

# Sync manually (if not automated)
argocd app sync devops-academy

# View in UI
# https://localhost:8080
```

### 4.3 GitOps Workflow

1. **Developer pushes code to GitHub**
2. **CI/CD builds and pushes Docker image**
3. **CI/CD updates K8s manifests with new image tag**
4. **ArgoCD detects Git changes**
5. **ArgoCD syncs changes to Kubernetes cluster**
6. **Application automatically updated**

**Benefits:**
- ✅ Git as single source of truth
- ✅ Declarative configuration
- ✅ Automated deployments
- ✅ Rollback capability (git revert)
- ✅ Audit trail (git history)

---

## 🏗️ Phase 5: Infrastructure as Code (Terraform)

### 5.1 Understanding Terraform

**Terraform** allows you to define cloud infrastructure as code, making it version-controlled, repeatable, and automated.

### 5.2 Terraform Project Structure

```
terraform/
├── main.tf           # Main configuration
├── variables.tf      # Input variables
├── outputs.tf        # Output values
├── terraform.tfvars  # Variable values
└── modules/
    ├── vpc/          # VPC module
    ├── eks/          # EKS cluster module
    ├── rds/          # RDS database module
    └── s3/           # S3 storage module
```

### 5.3 Deploying Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Plan infrastructure changes
terraform plan

# Apply changes
terraform apply

# View outputs
terraform output

# Destroy infrastructure (when done)
terraform destroy
```

### 5.4 Terraform Workflow

```
terraform init
    ↓
terraform plan (preview changes)
    ↓
terraform apply (create resources)
    ↓
Resources created in AWS:
  - VPC with public/private subnets
  - EKS cluster with node groups
  - RDS MySQL database
  - S3 bucket for uploads
  - Security groups
  - IAM roles
    ↓
kubectl configured automatically
    ↓
Deploy applications to EKS
```

### 5.5 Terraform Modules Explained

#### VPC Module
- Creates Virtual Private Cloud
- 3 public subnets (for load balancers)
- 3 private subnets (for applications)
- NAT gateways for internet access
- Route tables for traffic routing

#### EKS Module
- Managed Kubernetes cluster
- Auto-scaling node groups
- IAM roles for pods (IRSA)
- CloudWatch logging enabled
- Security groups

#### RDS Module
- MySQL 5.7 database
- Multi-AZ for high availability
- Automated backups (7 days retention)
- Encryption at rest
- Secrets Manager for credentials

#### S3 Module
- File upload storage
- Versioning enabled
- Lifecycle policies (transition to Glacier)
- Server-side encryption
- CORS configuration

---

## 📊 Monitoring & Logging

### Coming Soon: Prometheus & Grafana

```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring

# Install Grafana
helm install grafana grafana/grafana -n monitoring

# Access Grafana
kubectl port-forward svc/grafana -n monitoring 3000:80
```

---

## 🔒 Security Best Practices

### Implemented Security Measures

1. **Container Security**
   - ✅ Non-root users in containers
   - ✅ Read-only root filesystems
   - ✅ Security scanning with Trivy
   - ✅ Minimal base images (Alpine)

2. **Kubernetes Security**
   - ✅ Network policies (coming soon)
   - ✅ Resource limits and requests
   - ✅ Secrets management
   - ✅ RBAC (Role-Based Access Control)

3. **Infrastructure Security**
   - ✅ Private subnets for applications
   - ✅ Security groups
   - ✅ Encryption at rest (RDS, S3)
   - ✅ Secrets Manager for credentials

4. **CI/CD Security**
   - ✅ Dependency scanning (npm audit)
   - ✅ Static code analysis (SonarQube)
   - ✅ Container image scanning (Trivy)
   - ✅ Signed commits (recommended)

---

## 🎓 Learning Resources

### Docker
- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Kubernetes
- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [Kubernetes Patterns](https://www.redhat.com/en/resources/kubernetes-patterns-ebook)

### Jenkins
- [Jenkins User Documentation](https://www.jenkins.io/doc/)
- [Pipeline Tutorial](https://www.jenkins.io/doc/book/pipeline/)

### GitLab CI/CD
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)

### ArgoCD
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [GitOps Guide](https://www.gitops.tech/)

### Terraform
- [Terraform Documentation](https://www.terraform.io/docs)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

---

## 📝 Next Steps

1. **Test the entire pipeline:**
   ```bash
   # Make a code change
   git add .
   git commit -m "test: trigger pipeline"
   git push origin main
   
   # Watch Jenkins/GitLab build
   # Watch ArgoCD sync
   # Verify deployment
   ```

2. **Set up monitoring:**
   - Install Prometheus & Grafana
   - Create dashboards
   - Set up alerts

3. **Production readiness:**
   - Configure SSL/TLS
   - Set up custom domain
   - Enable CDN
   - Configure backup strategy

4. **Advanced topics:**
   - Service mesh (Istio)
   - Progressive delivery (Flagger)
   - Chaos engineering (Chaos Mesh)

---

## 🤝 Contributing

This is a learning project! Feel free to:
- Fork the repository
- Create feature branches
- Submit pull requests
- Open issues for questions

---

## 📧 Contact

**Author**: Aziz Khaled  
**GitHub**: [@Azizkh07](https://github.com/Azizkh07)  
**LinkedIn**: [Your LinkedIn Profile]

---

## ⭐ Show Your Support

If this project helped you learn DevOps, please give it a star on GitHub! ⭐

---

**Made with ❤️ for the DevOps community**
