# Kubernetes Basics Guide for Beginners

## Table of Contents
1. [Introduction](#introduction)
2. [What is Kubernetes?](#what-is-kubernetes)
3. [Core Concepts](#core-concepts)
4. [Architecture](#architecture)
5. [Key Components](#key-components)
6. [Working with Kubernetes](#working-with-kubernetes)
7. [Common Commands](#common-commands)
8. [Best Practices](#best-practices)
9. [Learning Resources](#learning-resources)

---

## Introduction

Kubernetes (K8s) is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications. This guide will help you understand the fundamental concepts and get started with Kubernetes.

---

## What is Kubernetes?

Kubernetes was originally developed by Google and is now maintained by the Cloud Native Computing Foundation (CNCF). The name comes from the Greek word for "helmsman" or "pilot."

### Why Kubernetes?

**Problems it solves:**
- Manual deployment of containers across multiple servers
- Scaling applications up or down based on demand
- Managing container failures and recovery
- Load balancing and service discovery
- Rolling updates and rollbacks

**Key Benefits:**
- Automated rollouts and rollbacks
- Self-healing capabilities
- Horizontal scaling
- Service discovery and load balancing
- Storage orchestration
- Configuration and secret management

---

## Core Concepts

### 1. Containers

Containers package your application code along with its dependencies, making it portable and consistent across different environments. Kubernetes orchestrates these containers.

**Popular container runtimes:**
- Docker
- containerd
- CRI-O

### 2. Cluster

A Kubernetes cluster consists of a set of machines (nodes) that run containerized applications. Every cluster has at least one worker node and one control plane.

### 3. Nodes

**Control Plane Node (Master Node):**
- Manages the Kubernetes cluster
- Makes global decisions about the cluster
- Detects and responds to cluster events

**Worker Node:**
- Runs your containerized applications
- Hosts Pods
- Communicates with the control plane

### 4. Pods

A Pod is the smallest deployable unit in Kubernetes. It represents a single instance of a running process in your cluster.

**Key characteristics:**
- Can contain one or more containers
- Containers in a Pod share storage and network resources
- Each Pod gets a unique IP address
- Pods are ephemeral (temporary)

### 5. Namespaces

Namespaces provide a way to divide cluster resources between multiple users or teams. They create virtual clusters within a physical cluster.

**Common namespaces:**
- `default` - Default namespace for objects with no other namespace
- `kube-system` - For objects created by Kubernetes system
- `kube-public` - Readable by all users
- `kube-node-lease` - For node heartbeat data

---

## Architecture

### Control Plane Components

**1. API Server (kube-apiserver)**
- Front-end for the Kubernetes control plane
- Exposes the Kubernetes API
- Handles all REST requests

**2. etcd**
- Consistent and highly-available key-value store
- Stores all cluster data
- Acts as the cluster's database

**3. Scheduler (kube-scheduler)**
- Watches for newly created Pods
- Assigns Pods to nodes based on resource requirements

**4. Controller Manager (kube-controller-manager)**
- Runs controller processes
- Examples: Node Controller, Replication Controller, Endpoints Controller

**5. Cloud Controller Manager**
- Links your cluster to your cloud provider's API
- Manages cloud-specific components

### Node Components

**1. Kubelet**
- Agent that runs on each node
- Ensures containers are running in Pods
- Communicates with the control plane

**2. Kube-proxy**
- Network proxy on each node
- Maintains network rules
- Enables communication to Pods

**3. Container Runtime**
- Software responsible for running containers
- Examples: Docker, containerd, CRI-O

---

## Key Components

### Deployments

Deployments provide declarative updates for Pods and ReplicaSets. They define the desired state for your application.

**Example Deployment YAML:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

### Services

Services expose your application running on a set of Pods as a network service. They provide stable IP addresses and DNS names.

**Service Types:**
- **ClusterIP** (default) - Exposes service on a cluster-internal IP
- **NodePort** - Exposes service on each Node's IP at a static port
- **LoadBalancer** - Exposes service externally using a cloud provider's load balancer
- **ExternalName** - Maps service to a DNS name

**Example Service YAML:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

### ConfigMaps

ConfigMaps allow you to decouple configuration from container images, making applications portable.

**Example ConfigMap:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database_url: "mysql://db:3306"
  log_level: "info"
```

### Secrets

Secrets store sensitive information like passwords, tokens, and keys. They are similar to ConfigMaps but specifically for confidential data.

**Example Secret:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: YWRtaW4=  # base64 encoded
  password: cGFzc3dvcmQ=  # base64 encoded
```

### Volumes

Volumes provide persistent storage for containers. Data in volumes persists beyond the lifetime of a Pod.

**Volume Types:**
- emptyDir
- hostPath
- persistentVolumeClaim
- configMap
- secret
- nfs
- cloud provider-specific (AWS EBS, Azure Disk, etc.)

### Ingress

Ingress manages external access to services in a cluster, typically HTTP/HTTPS. It provides load balancing, SSL termination, and name-based virtual hosting.

**Example Ingress:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 80
```

---

## Working with Kubernetes

### Installation Options

**For Learning:**
- **Minikube** - Runs a single-node cluster on your local machine
- **Kind** (Kubernetes in Docker) - Runs Kubernetes clusters in Docker containers
- **Docker Desktop** - Includes built-in Kubernetes support

**For Production:**
- **Managed Services:** AWS EKS, Google GKE, Azure AKS, DigitalOcean Kubernetes
- **Self-hosted:** kubeadm, kops, Rancher, OpenShift

### kubectl - The Command-Line Tool

kubectl is the primary tool for interacting with Kubernetes clusters.

**Installation:**
```bash
# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# macOS
brew install kubectl

# Windows
choco install kubernetes-cli
```

**Configuration:**
kubectl uses a config file (usually at `~/.kube/config`) to connect to clusters.

---

## Common Commands

### Cluster Information
```bash
# Display cluster info
kubectl cluster-info

# View nodes
kubectl get nodes

# Describe a node
kubectl describe node <node-name>
```

### Working with Pods
```bash
# List all pods
kubectl get pods

# List pods in all namespaces
kubectl get pods --all-namespaces

# Get detailed pod information
kubectl describe pod <pod-name>

# View pod logs
kubectl logs <pod-name>

# Execute command in a pod
kubectl exec -it <pod-name> -- /bin/bash

# Delete a pod
kubectl delete pod <pod-name>
```

### Working with Deployments
```bash
# Create a deployment
kubectl create deployment nginx --image=nginx

# List deployments
kubectl get deployments

# Scale a deployment
kubectl scale deployment nginx --replicas=5

# Update deployment image
kubectl set image deployment/nginx nginx=nginx:1.16.1

# View deployment history
kubectl rollout history deployment/nginx

# Rollback a deployment
kubectl rollout undo deployment/nginx

# Delete a deployment
kubectl delete deployment nginx
```

### Working with Services
```bash
# List services
kubectl get services

# Describe a service
kubectl describe service <service-name>

# Expose a deployment as a service
kubectl expose deployment nginx --port=80 --type=LoadBalancer

# Delete a service
kubectl delete service <service-name>
```

### Working with Namespaces
```bash
# List namespaces
kubectl get namespaces

# Create a namespace
kubectl create namespace dev

# Set default namespace
kubectl config set-context --current --namespace=dev

# Delete a namespace
kubectl delete namespace dev
```

### Applying YAML Files
```bash
# Apply configuration from a file
kubectl apply -f deployment.yaml

# Apply all YAML files in a directory
kubectl apply -f ./configs/

# Delete resources defined in a file
kubectl delete -f deployment.yaml
```

### Debugging Commands
```bash
# Get events
kubectl get events

# View detailed cluster events
kubectl get events --sort-by='.lastTimestamp'

# Check resource usage
kubectl top nodes
kubectl top pods

# Port forwarding (access pod locally)
kubectl port-forward pod/nginx-pod 8080:80

# Copy files to/from pod
kubectl cp <pod-name>:/path/to/file ./local-file
```

### Context and Configuration
```bash
# View current context
kubectl config current-context

# List all contexts
kubectl config get-contexts

# Switch context
kubectl config use-context <context-name>

# View configuration
kubectl config view
```

---

## Best Practices

### 1. Resource Management

**Set resource requests and limits:**
```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "250m"
  limits:
    memory: "128Mi"
    cpu: "500m"
```

### 2. Use Namespaces

Organize resources by environment (dev, staging, production) or by team to improve organization and security.

### 3. Labels and Selectors

Use meaningful labels to organize and select resources:
```yaml
metadata:
  labels:
    app: frontend
    environment: production
    version: v1.2.3
```

### 4. Health Checks

Implement liveness and readiness probes:
```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 5. Configuration Management

- Use ConfigMaps for non-sensitive configuration
- Use Secrets for sensitive data (encrypt at rest)
- Never hardcode configuration in container images

### 6. Security Best Practices

- Run containers as non-root users
- Use Pod Security Policies/Standards
- Implement RBAC (Role-Based Access Control)
- Regularly update container images
- Scan images for vulnerabilities
- Use network policies to control traffic

### 7. Version Control

- Store all Kubernetes YAML files in version control (Git)
- Use meaningful commit messages
- Review changes before applying to production

### 8. Deployment Strategies

**Rolling Update (default):**
- Gradually replaces old Pods with new ones
- Zero downtime

**Recreate:**
- Terminates all old Pods before creating new ones
- Temporary downtime

**Blue-Green:**
- Run two identical environments
- Switch traffic from old (blue) to new (green)

**Canary:**
- Gradually roll out changes to a small subset of users
- Monitor before full rollout

### 9. Monitoring and Logging

- Implement centralized logging (ELK stack, Fluentd)
- Use monitoring tools (Prometheus, Grafana)
- Set up alerts for critical issues
- Monitor resource usage and performance

### 10. Backup and Disaster Recovery

- Regularly backup etcd data
- Have a disaster recovery plan
- Test recovery procedures
- Document runbooks for common issues

---

## Learning Resources

### Official Documentation
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kubernetes API Reference](https://kubernetes.io/docs/reference/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

### Interactive Learning
- [Kubernetes Tutorials](https://kubernetes.io/docs/tutorials/)
- [Play with Kubernetes](https://labs.play-with-k8s.com/)
- [Katacoda Kubernetes Scenarios](https://www.katacoda.com/courses/kubernetes)

### Certifications
- **CKA** - Certified Kubernetes Administrator
- **CKAD** - Certified Kubernetes Application Developer
- **CKS** - Certified Kubernetes Security Specialist

### Books
- "Kubernetes Up & Running" by Kelsey Hightower
- "The Kubernetes Book" by Nigel Poulton
- "Kubernetes in Action" by Marko Lukša

### Community
- [Kubernetes Slack](https://slack.k8s.io/)
- [Kubernetes GitHub](https://github.com/kubernetes/kubernetes)
- [CNCF Community](https://www.cncf.io/community/)

---

## Quick Reference: Common Workflows

### Deploying an Application

1. **Create a deployment:**
   ```bash
   kubectl create deployment myapp --image=myapp:1.0
   ```

2. **Expose it as a service:**
   ```bash
   kubectl expose deployment myapp --port=80 --type=LoadBalancer
   ```

3. **Scale the application:**
   ```bash
   kubectl scale deployment myapp --replicas=3
   ```

4. **Update the application:**
   ```bash
   kubectl set image deployment/myapp myapp=myapp:2.0
   ```

5. **Monitor the rollout:**
   ```bash
   kubectl rollout status deployment/myapp
   ```

### Troubleshooting

1. **Check pod status:**
   ```bash
   kubectl get pods
   kubectl describe pod <pod-name>
   ```

2. **View logs:**
   ```bash
   kubectl logs <pod-name>
   kubectl logs <pod-name> --previous  # Previous container logs
   ```

3. **Check events:**
   ```bash
   kubectl get events --sort-by='.lastTimestamp'
   ```

4. **Test connectivity:**
   ```bash
   kubectl run test --image=busybox --rm -it -- sh
   ```

---

## Glossary

- **Cluster:** A set of nodes running containerized applications
- **Node:** A worker machine in Kubernetes (VM or physical machine)
- **Pod:** Smallest deployable unit, contains one or more containers
- **Deployment:** Manages ReplicaSets and provides declarative updates
- **Service:** Exposes applications running in Pods
- **Namespace:** Virtual cluster within a physical cluster
- **ConfigMap:** API object to store non-confidential data
- **Secret:** Object to store sensitive information
- **Volume:** Directory accessible to containers in a Pod
- **Ingress:** Manages external access to services
- **Label:** Key-value pair attached to objects for identification
- **Selector:** Used to select resources based on labels
- **Controller:** Control loop that watches cluster state
- **Kubelet:** Agent running on each node
- **kubectl:** Command-line tool for Kubernetes

---

## Next Steps

1. **Set up a local cluster** using Minikube or Kind
2. **Deploy your first application** using a simple YAML file
3. **Experiment with scaling** and updates
4. **Learn about advanced topics** like StatefulSets, DaemonSets, and Jobs
5. **Explore Helm** for package management
6. **Study security** concepts and RBAC
7. **Practice with real projects** and contribute to open source

---

**Remember:** Kubernetes has a steep learning curve, but with practice and experimentation, you'll become proficient. Start small, experiment often, and don't be afraid to break things in your development environment!

Good luck on your Kubernetes journey! 🚀
