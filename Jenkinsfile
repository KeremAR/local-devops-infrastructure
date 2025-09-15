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
//--------------------Integration Tests Disabled for Now--------------------

    // Services that have integration tests to be run with docker-compose
    //integrationTestServices: ['user-service-test', 'todo-service-test'],


    composeFile: 'docker-compose.test.yml',
    // Services to be deployed to Kubernetes
    deploymentServices: ['user-service', 'todo-service', 'frontend'],

    // Helm deployment configuration
    helmReleaseName: 'todo-app',
    helmChartPath: 'helm-charts/todo-app', // Path to your chart directory
    helmValuesFile: 'helm-charts/todo-app/values.yaml', // Optional: Path to a custom values file

    dockerfilesToHadolint: [
        'user-service/Dockerfile',
        'user-service/Dockerfile.test',
        'todo-service/Dockerfile',
        'todo-service/Dockerfile.test',
        'frontend2/frontend/Dockerfile'
    ],

    hadolintIgnoreRules: ['DL3008', 'DL3009', 'DL3016', 'DL3059'],

//--------------------Trivy Scan Disabled for Now--------------------
    /*
    trivySeverities: 'HIGH,CRITICAL',
    trivyFailBuild: true,
    trivySkipDirs: ['/app/node_modules'],
    */

    registry: 'ghcr.io',
    username: 'keremar',
    namespace: 'todo-app',
    manifestsPath: 'k8s',
    deploymentUrl: 'local-devops-infrastructure',

    //--------------------SonarQube Analysis (docker setup) Disabled for Now--------------------
    /*
    sonarScannerName: 'SonarQube-Scanner', // Name from Jenkins -> Tools
    sonarServerName: 'sq1',               // Name from Jenkins -> System
    sonarProjectKeyPlugin: 'Local-DevOps-Infrastructure',
    */

    //FOR HELM SETUP
    //sonarProjectKey: 'local-devops-infrastructure'
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

        // FOR HELM SETUP
      //  SONAR_HOST_URL = 'http://sonarqube.local'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Static Code Analysis') {
            steps {
                script {
                     echo "🧹 Running Hadolint on all Dockerfiles..."
                    runHadolint(
                        dockerfiles: config.dockerfilesToHadolint,
                        ignoreRules: config.hadolintIgnoreRules
                    )

                    echo "🔎 Starting SonarQube analysis (Plugin Method)..."
                    echo "----------------------SKIPPING FOR NOW----------------------"


//--------------------SonarQube Analysis (docker setup) Disabled for Now--------------------
                    /*
                    sonarQubeAnalysis(
                        scannerName: config.sonarScannerName,
                        serverName: config.sonarServerName,
                        projectKey: config.sonarProjectKeyPlugin
                    )
                    */

//--------------------SonarQube Analysis (helm setup) Disabled for Now--------------------
                    /*
                    withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                        sonarQubeAnalysisHelm(
                            projectKey: config.sonarProjectKey,
                            sonarHostUrl: env.SONAR_HOST_URL,
                            sonarToken: env.SONAR_TOKEN
                        )
                    }
                    */
                }
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

        stage('Security Scan') {
            steps {
                script {
                    echo "🛡️ Scanning built images for vulnerabilities..."
                     echo "----------------------SKIPPING FOR NOW----------------------"
/*
//-------------------- Trivy Scan Disabled for Now--------------------

                    def allImages = env.BUILT_IMAGES.split(',')
                    // Filter out 'latest' tags to avoid scanning the same image twice
                    // Use a unique variable name 'image' instead of the implicit 'it' to avoid compilation errors
                    def imagesToScan = allImages.findAll { image -> !image.endsWith(':latest') }
                    echo "Filtered images to scan: ${imagesToScan}"

                    runTrivyScan(
                        images: imagesToScan,
                        severities: config.trivySeverities,
                        failOnVulnerabilities: config.trivyFailBuild,
                        skipDirs: config.trivySkipDirs
                    )
                    */
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

        stage('Deploy') {
            steps {
                script {
                    echo "⚡ Deploying to Kubernetes with Helm..."
                    deployWithHelm(
                        releaseName: config.helmReleaseName,
                        chartPath: config.helmChartPath,
                        namespace: config.namespace,
                        valuesFile: config.helmValuesFile,
                        imageTag: env.IMAGE_TAG
                    )

                    /*
                    echo "⚡ Deploying to Kubernetes..."
                    deployToKubernetes([
                        namespace: config.namespace,
                        manifestsPath: config.manifestsPath,
                        services: config.deploymentServices
                    ])
                    */
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
