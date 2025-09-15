# Jenkins Shared Library - Helm Deployment Extension

This directory contains additional Jenkins shared library functions for Helm-based deployments.

## Functions

### deployWithHelm(config)

Deploys applications to Kubernetes using Helm charts with advanced configuration options.

#### Parameters

- `namespace` (String, default: 'default'): Target Kubernetes namespace
- `helmChart` (String, default: './helm-charts/todo-app'): Path to Helm chart
- `releaseName` (String, default: 'todo-app'): Helm release name
- `valueFiles` (List, default: []): List of values files to use
- `timeout` (String, default: '300s'): Deployment timeout
- `wait` (Boolean, default: true): Wait for deployment completion
- `upgrade` (Boolean, default: true): Enable upgrade functionality
- `install` (Boolean, default: true): Enable installation functionality
- `createNamespace` (Boolean, default: true): Create namespace if it doesn't exist
- `dryRun` (Boolean, default: false): Perform dry run
- `debug` (Boolean, default: false): Enable debug output

#### Example Usage

```groovy
deployWithHelm([
    namespace: 'todo-app',
    helmChart: './helm-charts/todo-app',
    releaseName: 'todo-app-dev',
    timeout: '600s',
    wait: true
])
```

#### Return Value

Returns a map containing:
- `success`: Boolean indicating deployment success
- `releaseName`: The Helm release name used
- `namespace`: The target namespace
- `chart`: The chart path used

## Installation

1. Copy the `vars/` directory to your Jenkins shared library repository
2. Configure Jenkins to use your shared library
3. Use the functions in your Jenkinsfile as shown in the examples above

## Requirements

- Helm 3.x installed on Jenkins agents
- kubectl configured with appropriate cluster access
- Kubernetes cluster with necessary permissions
