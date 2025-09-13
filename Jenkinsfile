@Library('todo-app-shared-library') _

pipeline {
    agent {
        kubernetes {
            defaultContainer 'jnlp'
            yaml com.company.jenkins.Utils.getPodTemplate()
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

        stage('Build Services') {
            steps {
                script {
                    def config = com.company.jenkins.Utils.getServiceConfig()
                    config.imageTag = env.IMAGE_TAG

                    echo "🔨 Building all services in parallel..."
                    def builtImages = buildAllServices(config)
                    // Store images as a string for passing between stages
                    env.BUILT_IMAGES = builtImages.join(',')
                    echo "Built images: ${env.BUILT_IMAGES}"
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    echo "🧪 Running backend tests..."
                    runBackendTests()
                }
            }
        }

        stage('Push to Registry') {
            steps {
                script {
                    echo "🚀 Pushing images to registry..."
                    def images = env.BUILT_IMAGES.split(',')
                    echo "Images to push: ${images}"
                    pushToRegistry([
                        images: images,
                        registry: env.GITHUB_REGISTRY,
                        credentialsId: env.REGISTRY_CREDENTIALS
                    ])
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo "⚡ Deploying to Kubernetes..."
                    deployToKubernetes([
                        namespace: 'todo-app',
                        manifestsPath: 'k8s'
                    ])
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up the workspace...'
            deleteDir()
        }
        success {
            script {
                com.company.jenkins.Utils.notifyGitHub(this, 'success', 'Pipeline completed successfully!')
            }
        }
        failure {
            script {
                com.company.jenkins.Utils.notifyGitHub(this, 'failure', 'Pipeline failed!')
            }
        }
    }
}
