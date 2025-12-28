# 🚀 DevOps Academy

> A modern, multilingual learning platform for mastering DevOps practices, CI/CD, Cloud Computing, and Infrastructure as Code.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)](https://www.typescriptlang.org/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [DevOps Practices](#devops-practices)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**DevOps Academy** is a comprehensive e-learning platform designed to help developers and IT professionals master modern DevOps practices. The platform offers:

- 📚 Structured courses on CI/CD, Docker, Kubernetes, and more
- 🎥 Video-based learning with secure streaming
- 🌍 Multi-language support (English, French, Arabic)
- 👥 User management and course enrollment
- 📝 Blog/articles for industry insights
- 📱 Responsive, mobile-friendly design

## ✨ Features

### Core Features
- **User Authentication & Authorization** - Secure JWT-based authentication
- **Course Management** - Browse, enroll, and track progress
- **Video Streaming** - Secure video content delivery
- **Blog System** - DevOps articles and best practices
- **Admin Dashboard** - Content and user management
- **Multilingual Support** - i18n with English, French, and Arabic
- **Responsive Design** - Mobile-first approach with Tailwind CSS

### DevOps Features
- 🔄 CI/CD pipeline examples
- 🐳 Docker containerization tutorials
- ☸️ Kubernetes orchestration courses
- ☁️ Cloud platform integration (AWS, Azure)
- 🏗️ Infrastructure as Code (Terraform, Ansible)
- 📊 Monitoring and logging best practices

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - Modern UI library
- **TypeScript** - Type-safe development
- **React Router** - Client-side routing
- **i18next** - Internationalization
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend
- **MySQL** - Relational database
- **JWT** - Authentication tokens
- **Multer & Sharp** - File upload and image processing
- **Helmet & CORS** - Security middleware

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.x
- **npm** >= 9.x or **yarn** >= 1.22
- **MySQL** >= 5.7 or **MySQL 8.x**
- **Git** (for version control)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/devops-academy.git
cd devops-academy
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=devops_academy

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=100MB
UPLOAD_PATH=./uploads
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5001
```

### Database Setup

1. Create the database:
```sql
CREATE DATABASE devops_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Run migrations (if available):
```bash
cd backend
npm run migrate
```

## 🏃 Running the Application

### Development Mode

#### Start Backend
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5001`

#### Start Frontend
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

### Production Build

#### Build Backend
```bash
cd backend
npm run build
npm start
```

#### Build Frontend
```bash
cd frontend
npm run build:prod
```

## 📁 Project Structure

```
devops-academy/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entry point
│   ├── uploads/             # User-uploaded files
│   ├── migrations/          # Database migrations
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities and services
│   │   ├── locales/         # i18n translations
│   │   ├── styles/          # CSS files
│   │   ├── App.tsx          # Root component
│   │   └── index.tsx        # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

## 🔄 DevOps Practices

This project demonstrates several DevOps best practices:

### 1. Version Control
- Git for source control
- Branching strategy (main, develop, feature branches)
- Semantic versioning

### 2. CI/CD Pipeline
```yaml
# Example: .github/workflows/ci.yml
name: CI Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
```

### 3. Containerization
```dockerfile
# Example Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5001
CMD ["npm", "start"]
```

### 4. Infrastructure as Code
- Docker Compose for local development
- Terraform scripts for cloud infrastructure (to be added)
- Kubernetes manifests for container orchestration (to be added)

### 5. Monitoring & Logging
- Structured logging with Morgan
- Error tracking (to be implemented)
- Performance monitoring (to be implemented)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Project Lead** - [@Azizkh07](https://github.com/Azizkh07)

## 🙏 Acknowledgments

- React community for excellent documentation
- Node.js ecosystem for powerful tools
- DevOps community for best practices and inspiration

## 📧 Contact

For questions or support, please contact:
- Email: support@devopsacademy.com
- Website: https://devopsacademy.com

---

**Built with ❤️ by the DevOps Academy Team**
