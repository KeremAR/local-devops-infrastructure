pipeline {
    agent {
        kubernetes {
            defaultContainer 'jnlp'
            yaml '''
                apiVersion: v1
                kind: Pod
                metadata:
                  labels:
                    jenkins: slave
                spec:
                  serviceAccountName: jenkins
                  containers:
                  - name: docker
                    image: docker:20.10.16-dind
                    securityContext:
                      privileged: true
                    volumeMounts:
                    - name: docker-sock
                      mountPath: /var/run/docker.sock
                  - name: kubectl
                    image: bitnami/kubectl:latest
                    command:
                    - cat
                    tty: true
                  volumes:
                  - name: docker-sock
                    hostPath:
                      path: /var/run/docker.sock
            '''
        }
    }

    environment {
        GITHUB_REGISTRY = 'ghcr.io'
        GITHUB_USER = 'keremar'
        IMAGE_TAG = "${BUILD_NUMBER}"
        REGISTRY_CREDENTIALS = 'github-registry'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Images') {
            parallel {
                stage('Build User Service') {
                    steps {
                        container('docker') {
                            script {
                                def userServiceImage = "${GITHUB_REGISTRY}/${GITHUB_USER}/todo-app-user-service:${IMAGE_TAG}"
                                sh "docker build -t ${userServiceImage} -f user-service/Dockerfile ."
                                sh "docker tag ${userServiceImage} ${GITHUB_REGISTRY}/${GITHUB_USER}/todo-app-user-service:latest"
                            }
                        }
                    }
                }

                stage('Build Todo Service') {
                    steps {
                        container('docker') {
                            script {
                                def todoServiceImage = "${GITHUB_REGISTRY}/${GITHUB_USER}/todo-app-todo-service:${IMAGE_TAG}"
                                sh "docker build -t ${todoServiceImage} -f todo-service/Dockerfile ."
                                sh "docker tag ${todoServiceImage} ${GITHUB_REGISTRY}/${GITHUB_USER}/todo-app-todo-service:latest"
                            }
                        }
                    }
                }

                stage('Build Frontend') {
                    steps {
                        container('docker') {
                            script {
                                def frontendImage = "${GITHUB_REGISTRY}/${GITHUB_USER}/todo-app-frontend:${IMAGE_TAG}"
                                sh "docker build -t ${frontendImage} -f frontend2/frontend/Dockerfile frontend2/frontend/"
                                sh "docker tag ${frontendImage} ${GITHUB_REGISTRY}/${GITHUB_USER}/todo-app-frontend:latest"
                            }
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        container('docker') {
                            sh 'docker compose -f docker-compose.test.yml run --rm -T user-service-test'
                            sh 'docker compose -f docker-compose.test.yml run --rm -T todo-service-test'
                        }
                    }
                }
            }
        }

        stage('Push Images') {
            steps {
                container('docker') {
                    withCredentials([usernamePassword(credentialsId: "${REGISTRY_CREDENTIALS}", passwordVariable: 'REGISTRY_PASSWORD', usernameVariable: 'REGISTRY_USERNAME')]) {
                        sh '''
                            echo $REGISTRY_PASSWORD | docker login $GITHUB_REGISTRY -u $REGISTRY_USERNAME --password-stdin

                            # Push versioned images
                            docker push ${GITHUB_REGISTRY}/${GITHUB_USER}/todo-app-user-service:${IMAGE_TAG}
                            docker push ${GITHUB_REGISTRY}/${GITHUB_USER}/todo-app-todo-service:${IMAGE_TAG}
                            docker push ${GITHUB_REGISTRY}/${GITHUB_USER}/todo-app-frontend:${IMAGE_TAG}

                            # Push latest images
                            docker push ${GITHUB_REGISTRY}/${GITHUB_USER}/todo-app-user-service:latest
                            docker push ${GITHUB_REGISTRY}/${GITHUB_USER}/todo-app-todo-service:latest
                            docker push ${GITHUB_REGISTRY}/${GITHUB_USER}/todo-app-frontend:latest
                        '''
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    withCredentials([kubeconfigFile(credentialsId: 'kubernetes-config', variable: 'KUBECONFIG')]) {
                        sh '''
                            # Apply K8s manifests
                            kubectl apply -f k8s/namespace.yaml
                            kubectl apply -f k8s/user-service-deployment.yaml
                            kubectl apply -f k8s/user-service-service.yaml
                            kubectl apply -f k8s/todo-service-deployment.yaml
                            kubectl apply -f k8s/todo-service-service.yaml
                            kubectl apply -f k8s/frontend-deployment.yaml
                            kubectl apply -f k8s/frontend-service.yaml
                            kubectl apply -f k8s/ingress.yaml

                            # Restart deployments to pull latest images
                            kubectl rollout restart deployment/user-service -n todo-app
                            kubectl rollout restart deployment/todo-service -n todo-app
                            kubectl rollout restart deployment/frontend -n todo-app

                            # Wait for rollout to complete
                            kubectl rollout status deployment/user-service -n todo-app
                            kubectl rollout status deployment/todo-service -n todo-app
                            kubectl rollout status deployment/frontend -n todo-app
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "🚀 Pipeline completed successfully!"
            echo "✅ Application deployed to: http://todo-app.local"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
    }
}
