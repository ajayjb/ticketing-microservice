## How Kubernetes Load Balancers Work

### **1. Service Object (Type: LoadBalancer)**
When you create a Kubernetes **Service** of type `LoadBalancer`, it does the following:

#### **a. Creates a Service Object**
- A **Service** is a Kubernetes resource that exposes a set of **Pods** to external or internal traffic.
- In this case, the Service is created specifically for the **Ingress NGINX Controller** pods.
- It gets an internal **ClusterIP** and a node-wide **NodePort**.

#### **b. Selects the Ingress Controller Pods**
- The Service uses **label selectors** to match the **Ingress NGINX Controller** pods.
- These are the pods that will handle incoming HTTP/HTTPS traffic.

#### **c. Opens a NodePort (Internally)**
- Even though this is a `LoadBalancer` type Service, it also **automatically opens a NodePort** (a port on each worker node).
- This allows the load balancer (created in step 2) to forward traffic to the right node.

---

### **2. External Load Balancer (Provisioned by Cloud Provider)**
If you're using a cloud provider like AWS, GCP, or Azure, Kubernetes **requests** an external load balancer from the provider.

#### **a. The Cloud Controller Manager (CCM) Steps In**
- Kubernetes delegates the creation of the actual load balancer to the **Cloud Controller Manager (CCM)**.
- The CCM talks to the cloud provider's API and provisions a **Load Balancer**.

#### **b. Cloud Load Balancer Gets an External IP**
- The cloud provider assigns a **public external IP** to the Load Balancer.
- You can see this IP by running:
  
  ```sh
  kubectl get svc -n ingress-nginx
  ```
  
- The output will show something like:
  
  ```
  NAME                   TYPE           CLUSTER-IP       EXTERNAL-IP       PORT(S)
  ingress-nginx         LoadBalancer   10.100.200.10    34.123.45.67      80:32467/TCP, 443:32468/TCP
  ```

#### **c. Load Balancer Forwards Traffic to the Service**
- The cloud Load Balancer listens for incoming requests on the **external IP**.
- It forwards those requests to the **NodePort** that the `LoadBalancer` Service opened.
- The request is then sent to one of the Ingress Controller **pods** (based on the Service’s label selector).

---

### **How Traffic Flows**
1. **Client requests `http://34.123.45.67` (External IP)**  
2. The request hits the **Cloud Load Balancer**.  
3. The Load Balancer forwards it to the Kubernetes **NodePort** on a node.  
4. The **Service** routes the request to one of the Ingress Controller **pods**.  
5. The **Ingress Controller** checks its configured rules and routes the request to the correct backend service inside the cluster.  

---

### **What If You're Running On-Premises or Bare Metal?**
- Kubernetes **does not automatically create an external load balancer** in these cases.
- You need a solution like:
  - **MetalLB**: Assigns an external IP to your `LoadBalancer` Service.
  - **Manually Configured Load Balancers**: Use HAProxy, Nginx, or a cloud LB.

---

### **Key Takeaways**
- The **Service Object** in Kubernetes ensures that traffic is routed from the Load Balancer to the Ingress Controller pods.
- The **External Load Balancer** (provisioned by the cloud provider) provides a **public IP** and forwards traffic to the Kubernetes cluster.
- The **Ingress Controller** processes the request and routes it to the correct internal Service.

