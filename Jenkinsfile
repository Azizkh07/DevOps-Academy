pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS = credentials('dockerhub-credentials')
        IMAGE_NAME_BACKEND = 'azizkh07/devops-academy-backend'
        IMAGE_NAME_FRONTEND = 'azizkh07/devops-academy-frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"
        SONAR_TOKEN = credentials('sonar-token')
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
                stage('Backend Lint') {
                    steps {
                        dir('backend') {
                            sh 'npm run lint || true'
                        }
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint || true'
                        }
                    }
                }
                stage('SonarQube Analysis') {
                    steps {
                        script {
                            def scannerHome = tool 'SonarScanner'
                            withSonarQubeEnv('SonarQube') {
                                sh """
                                    ${scannerHome}/bin/sonar-scanner \
                                    -Dsonar.projectKey=devops-academy \
                                    -Dsonar.sources=. \
                                    -Dsonar.host.url=${SONAR_HOST_URL} \
                                    -Dsonar.login=${SONAR_TOKEN}
                                """
                            }
                        }
                    }
                }
                stage('Security Scan') {
                    steps {
                        sh 'npm audit --audit-level=high || true'
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            script {
                                docker.build("${IMAGE_NAME_BACKEND}:${IMAGE_TAG}")
                                docker.build("${IMAGE_NAME_BACKEND}:latest")
                            }
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            script {
                                docker.build("${IMAGE_NAME_FRONTEND}:${IMAGE_TAG}")
                                docker.build("${IMAGE_NAME_FRONTEND}:latest")
                            }
                        }
                    }
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'dockerhub-credentials') {
                        docker.image("${IMAGE_NAME_BACKEND}:${IMAGE_TAG}").push()
                        docker.image("${IMAGE_NAME_BACKEND}:latest").push()
                        docker.image("${IMAGE_NAME_FRONTEND}:${IMAGE_TAG}").push()
                        docker.image("${IMAGE_NAME_FRONTEND}:latest").push()
                    }
                }
            }
        }
        
        stage('Update Kubernetes Manifests') {
            steps {
                script {
                    sh """
                        sed -i 's|image: .*backend.*|image: ${IMAGE_NAME_BACKEND}:${IMAGE_TAG}|' k8s/backend-deployment.yaml
                        sed -i 's|image: .*frontend.*|image: ${IMAGE_NAME_FRONTEND}:${IMAGE_TAG}|' k8s/frontend-deployment.yaml
                        git add k8s/
                        git commit -m "Update image tags to ${IMAGE_TAG}" || true
                        git push origin main || true
                    """
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh '''
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/mysql-deployment.yaml
                        kubectl apply -f k8s/backend-deployment.yaml
                        kubectl apply -f k8s/frontend-deployment.yaml
                        kubectl rollout status deployment/backend -n devops-academy
                        kubectl rollout status deployment/frontend -n devops-academy
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '🎉 Pipeline succeeded! DevOps Academy deployed successfully!'
            slackSend(
                color: 'good',
                message: "✅ Build #${BUILD_NUMBER} succeeded - DevOps Academy deployed!"
            )
        }
        failure {
            echo '❌ Pipeline failed!'
            slackSend(
                color: 'danger',
                message: "❌ Build #${BUILD_NUMBER} failed - Check Jenkins logs"
            )
        }
        always {
            cleanWs()
        }
    }
}
