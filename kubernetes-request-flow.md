# Kubernetes Request Flow - Simple Overview

## High-Level Flow

```
Client (Browser / API / curl)
        |
        v
External Load Balancer (Cloud / Docker Desktop / Tunnel)
        |
        v
Ingress Controller Service (LoadBalancer / NodePort)
        |
        v
Ingress Controller Pod (NGINX / HAProxy / Traefik)
        |
        v
Backend Service (ClusterIP)
        |
        v
kube-proxy (iptables / IPVS rules)
        |
        v
Pod (Container Application)
```

---

## Example Scenario

User visits: `https://api.example.com/products`

Your cluster has:
- AWS LoadBalancer
- NGINX Ingress Controller
- Product Service (3 replicas)

---

## The Flow

```
1. Browser
   └─> DNS lookup: api.example.com → 52.100.10.20 (LoadBalancer IP)

2. AWS Load Balancer (52.100.10.20)
   └─> Forwards to Node: 10.0.1.50:30443 (NodePort)

3. Node receives packet
   └─> iptables (kube-proxy rules) changes destination
   └─> From: 10.0.1.50:30443
   └─> To: 10.244.1.10:443 (Ingress Pod IP)

4. NGINX Ingress Pod (10.244.1.10)
   └─> Terminates TLS (HTTPS → HTTP)
   └─> Checks Host: api.example.com ✓
   └─> Checks Path: /products ✓
   └─> Proxies to: product-service:80

5. CoreDNS resolves service name
   └─> product-service → 10.96.100.50 (ClusterIP)

6. iptables (kube-proxy rules) again
   └─> From: 10.96.100.50:80 (virtual IP)
   └─> To: 10.244.2.25:8080 (random Pod IP)

7. Product Pod (10.244.2.25)
   └─> Application processes request
   └─> Returns JSON response

8. Response flows back
   └─> Pod → Service → Ingress → Node → LoadBalancer → Browser
```

---

## Visual Diagram

```
        [Browser]
            |
    DNS: api.example.com
            ↓
╔═══════════════════════════════════════════════════╗
║  OUTSIDE CLUSTER                                  ║
║  [AWS LoadBalancer: 52.100.10.20]                ║
║  (Created by cloud provider, not K8s)             ║
╚═══════════════════════════════════════════════════╝
            |
     Pick a Node randomly
            ↓
╔═══════════════════════════════════════════════════╗
║  INSIDE CLUSTER                                   ║
║                                                   ║
║  [Node: 10.0.1.50:30443] ← External request       ║
║            |                                      ║
║    iptables DNAT (kube-proxy rules)              ║
║            ↓                                      ║
║  [Ingress Controller Pod: 10.244.1.10:443]       ║
║  (NGINX process)                                  ║
║            |                                      ║
║    • TLS termination                              ║
║    • Host/path matching                           ║
║    • Proxy to backend                             ║
║            ↓                                      ║
║      DNS: product-service                         ║
║            ↓                                      ║
║  [Service: 10.96.100.50:80] ← Virtual IP          ║
║            |                                      ║
║    iptables DNAT (kube-proxy rules)              ║
║            ↓                                      ║
║  [Product Pod: 10.244.2.25:8080]                 ║
║  (Your application)                               ║
║            |                                      ║
║    Process request                                ║
║            ↓                                      ║
║    Return response (reverse path)                 ║
╚═══════════════════════════════════════════════════╝
```

---

## Key Components

### 1. Ingress Controller Service (LoadBalancer type)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: ingress-nginx-controller
  namespace: ingress-nginx
spec:
  type: LoadBalancer  # Requests external LB from cloud
  ports:
  - port: 443
    targetPort: 443
    nodePort: 30443
  selector:
    app: ingress-nginx  # Selects Ingress Controller Pods
```

- **What it is:** Kubernetes Service for NGINX Ingress Controller
- **What it does:** Requests a LoadBalancer from cloud provider
- **Actual LoadBalancer:** Created OUTSIDE cluster (AWS NLB/ELB)
- **Points to:** All nodes on NodePort 30443
- **Routes to:** Ingress Controller Pods (NGINX)

### 2. Ingress Controller Pod (NGINX)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ingress-nginx-controller
  namespace: ingress-nginx
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: controller
        image: registry.k8s.io/ingress-nginx/controller:v1.9.0
        ports:
        - containerPort: 443
```

- **What it is:** Actual NGINX process running in Pods
- **What it does:** Layer 7 HTTP/HTTPS routing
- **Reads:** Ingress resources
- **Routes to:** Backend Services based on host/path

### 3. Ingress (Routing rules)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /products
        backend:
          service:
            name: product-service
            port: 80
```

- **What it does:** HTTP routing (host/path)
- **Runs as:** NGINX Pod(s)
- **Routes to:** Backend Services

### 4. Service (Stable endpoint)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: product-service
spec:
  selector:
    app: product
  ports:
  - port: 80
    targetPort: 8080
```

- **What it does:** Virtual IP for Pods
- **Type:** Just metadata (not a process!)
- **kube-proxy:** Creates iptables rules

### 5. Pods (Actual application)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: product-api:v1
        ports:
        - containerPort: 8080
```

- **What it does:** Runs your application
- **Has:** Real IP address (10.244.x.x)
- **Handles:** Actual HTTP requests

---

## Important Concepts

### Services are NOT processes

```
❌ Wrong: Service receives traffic and forwards it
✅ Right: Service is just config; kernel routes via iptables
```

### kube-proxy doesn't proxy

```
❌ Wrong: kube-proxy forwards each request
✅ Right: kube-proxy creates iptables rules once; kernel does the rest
```

### How iptables works

```bash
# kube-proxy creates rules like this:

# For Service IP 10.96.100.50:80
-A KUBE-SERVICES -d 10.96.100.50 -p tcp --dport 80 \
   -j KUBE-SVC-PRODUCT

# Random Pod selection (33% each)
-A KUBE-SVC-PRODUCT -m statistic --probability 0.33 \
   -j DNAT --to-destination 10.244.2.25:8080

-A KUBE-SVC-PRODUCT -m statistic --probability 0.50 \
   -j DNAT --to-destination 10.244.2.26:8080

-A KUBE-SVC-PRODUCT \
   -j DNAT --to-destination 10.244.2.27:8080
```

**Result:** Kernel changes packet destination automatically

---

## Packet Transformation Example

### Request Path

```
Step 1: Browser to LoadBalancer
  Source: 203.0.113.45:54321
  Dest:   52.100.10.20:443

Step 2: LoadBalancer to Node
  Source: 203.0.113.45:54321
  Dest:   10.0.1.50:30443

Step 3: Node to Ingress Pod (after iptables)
  Source: 203.0.113.45:54321
  Dest:   10.244.1.10:443

Step 4: Ingress to Service (after TLS termination)
  Source: 10.244.1.10:39123
  Dest:   10.96.100.50:80

Step 5: Service to Pod (after iptables)
  Source: 10.244.1.10:39123
  Dest:   10.244.2.25:8080  ← Application receives this
```

---

## Common Questions

### Q: What is a Service? Is it a process?
**A:** No! A Service is NOT a process. It's just metadata stored in Kubernetes (etcd):
- A virtual IP (ClusterIP)
- A selector (which Pods to route to)
- Port mappings

The actual routing is done by **iptables rules** created by kube-proxy. There's no Service "process" running anywhere.

### Q: Does kube-proxy forward requests?
**A:** No! kube-proxy does NOT forward traffic. It:
1. Watches Services and Endpoints
2. Creates iptables/IPVS rules
3. That's it - the Linux kernel does all the actual forwarding

Think of kube-proxy as a "rule programmer" not a "traffic forwarder."

### Q: When does kube-proxy create iptables rules?
**A:** During the "setup phase":
- When kube-proxy first starts (syncs all Services)
- When a Service is created (~100-200ms after creation)
- When a Service is modified
- When Pods are added/removed (Endpoints change)
- When a Service is deleted

Once rules are created, they work automatically without kube-proxy involvement.

### Q: Do I need to configure LoadBalancer to forward to NodePort?
**A:** No! When you create a Service with `type: LoadBalancer`:
1. Kubernetes allocates a NodePort automatically
2. Cloud provider creates the LoadBalancer
3. LoadBalancer is auto-configured to forward to all nodes on that NodePort

Everything happens automatically via cloud controller integration.

### Q: Can I access Service from outside cluster?
**A:** Not directly. Only via:
- LoadBalancer
- NodePort
- Ingress

### Q: What if a Pod dies?
**A:** 
1. Kubernetes removes it from Endpoints
2. kube-proxy updates iptables (removes Pod IP)
3. New traffic doesn't go there
4. Takes ~1 second

### Q: How does load balancing work?
**A:**
- **LoadBalancer:** Cloud provider (flow hash)
- **Service:** Random (iptables default)
- **Ingress:** Round-robin (NGINX default)

### Q: Where does DNS come from?
**A:** CoreDNS (runs as Pods in kube-system)
- Resolves service names: `product-service` → ClusterIP
- Auto-created for every Service

---

## Quick Troubleshooting

```bash
# 1. Check Service
kubectl get svc product-service
kubectl get endpoints product-service  # Should show Pod IPs

# 2. Check Ingress
kubectl get ingress
kubectl describe ingress api-ingress

# 3. Test Pod directly
kubectl port-forward pod/product-abc123 8080:8080
curl localhost:8080/products

# 4. Check iptables rules
iptables-save | grep product-service

# 5. Check Ingress logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

---

## One-Line Summary

> **LoadBalancer → Node → Ingress Pod (L7 routing) → Service (virtual IP) → Pod (actual app)**

---

## What Actually Moves Traffic

| Component | Role |
|-----------|------|
| **LoadBalancer** | Routes external → nodes |
| **iptables** | Changes packet destination |
| **Kernel** | Forwards packets |
| **CNI** | Pod-to-Pod networking |
| **NGINX** | HTTP routing |

**Not involved in data path:** kube-proxy, API server, kubelet

---

## Remember

- Services = configuration (metadata)
- kube-proxy = rule creator (not a proxy)
- iptables/kernel = actual packet forwarder
- Pods = where your code runs

Everything in between is just routing!
