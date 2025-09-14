@Library('todo-app-shared-library') _

// All project-specific configuration is defined here
def config = [
    appName: 'todo-app',
    services: [
        [name: 'user-service', dockerfile: 'user-service/Dockerfile'],
        [name: 'todo-service', dockerfile: 'todo-service/Dockerfile'],
        [name: 'frontend', dockerfile: 'frontend2/frontend/Dockerfile', context: 'frontend2/frontend/']
    ],
    // Services that have unit tests to be run individually
    unitTestServices: [
        [name: 'user-service', dockerfile: 'user-service/Dockerfile.test', context: '.'],
        [name: 'todo-service', dockerfile: 'todo-service/Dockerfile.test', context: '.']
    ],
    // Services that have integration tests to be run with docker-compose
    integrationTestServices: ['user-service-test', 'todo-service-test'],
    composeFile: 'docker-compose.test.yml',
    // Services to be deployed to Kubernetes
    deploymentServices: ['user-service', 'todo-service', 'frontend'],
    registry: 'ghcr.io',
    username: 'keremar',
    namespace: 'todo-app',
    manifestsPath: 'k8s',
    deploymentUrl: 'http://todo-app.local'
]

pipeline {
    agent {
        kubernetes {
            defaultContainer 'jnlp'
            yaml com.company.jenkins.Utils.getPodTemplate()
        }
    }

    environment {
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
                    echo "🔨 Building all services in parallel..."
                    def builtImages = buildAllServices(
                        services: config.services,
                        registry: config.registry,
                        username: config.username,
                        imageTag: env.IMAGE_TAG,
                        appName: config.appName
                    )
                    env.BUILT_IMAGES = builtImages.join(',')
                    echo "Built images: ${env.BUILT_IMAGES}"
                }
            }
        }

        stage('Unit Tests') {
            steps {
                script {
                    echo "🧪 Running unit tests..."
                    runUnitTests(services: config.unitTestServices)
                }
            }
        }

        stage('Integration Tests') {
            steps {
                script {
                    echo "🧪 Running backend integration tests..."
                    echo "----------------------SKIPPING FOR NOW----------------------"
                    // runIntegrationTests(services: config.integrationTestServices)
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
                        namespace: config.namespace,
                        manifestsPath: config.manifestsPath,
                        services: config.deploymentServices
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
                com.company.jenkins.Utils.notifyGitHub(this, 'success', 'Pipeline completed successfully!', config.deploymentUrl)
            }
        }
        failure {
            script {
                com.company.jenkins.Utils.notifyGitHub(this, 'failure', 'Pipeline failed!')
            }
        }
    }
}
