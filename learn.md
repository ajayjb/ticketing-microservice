# Creating secrets in k8s

```
kubectl create secret generic jwt-secret \
  --from-literal=JWT_KEY=tbs8263AGSHLyndgdye \
  --from-literal=KEY_2=key2
```

### Viewing secrets in k8s

```
kubectl get secret jwt-secret -o jsonpath="{.data.JWT_KEY}" | base64 --decode
``` 

### Deleting secrets in k8s
- Kubernetes doesn’t allow deleting a single key from a secret directly 

```
kubectl delete secret jwt-secret
``` 

# 📘 Calling Internal Services in Next.js on Local Kubernetes

## 📜 Overview

When running a Next.js app inside a local Kubernetes cluster (e.g., Minikube, Docker Desktop, or Kind), it's important to correctly handle service-to-service and client-to-server communication.

---

## 🧱 1. Client-Side Requests (Browser)

Use the **Ingress domain** (e.g., `http://tickets.com`) for requests made from the browser.

### ✅ Requirements

* An Ingress controller (e.g., NGINX Ingress) is configured.

* Your local machine routes the domain to localhost via `/etc/hosts`:

  ```bash
  127.0.0.1 tickets.com
  ```

* Ingress is routing requests to the correct Kubernetes services.

### ✅ Example

```js
// Browser-side fetch
fetch('http://tickets.com/api/auth/v1/user/currentUser');
```

---

## 🛠️ 2. Server-Side Requests (getServerSideProps, API Routes)

Use Kubernetes internal DNS to call services from within the cluster:

```
http://<service-name>.<namespace>.svc.cluster.local:<port>/<path>
```

### 🔧 Example

```js
// Inside getServerSideProps
export async function getServerSideProps(context) {
  const response = await fetch(
    'http://auth-svc.default.svc.cluster.local:3000/api/auth/v1/user/currentUser',
    {
      headers: {
        cookie: context.req.headers.cookie || "", // Forward auth cookies
      },
    }
  );

  const data = await response.json();

  return { props: { user: data.user || null } };
}
```

> 🔄 This avoids reliance on external DNS or Ingress for server-to-server communication.

---

## 🧺as 3. Development Tips

* Use `kubectl get svc` to list your services and get their names.
* Use the correct namespace (usually `default`).
* Ensure ports are correctly exposed by the services.
* For debugging, use `kubectl exec` or `kubectl port-forward` to test services.

---

## 🛡️ Security Notes

* Always forward cookies when your internal calls require authentication.
* Avoid hardcoding sensitive data. Use Kubernetes secrets and environment variables.

---

## 🧵 Summary

| Context          | URL Format                                                                   |
| ---------------- | ---------------------------------------------------------------------------- |
| Browser (client) | `http://tickets.com/api/...` (via Ingress + /etc/hosts)                      |
| Server-side      | `http://auth-svc.default.svc.cluster.local:3000/api/...` (K8s DNS + service) |

# Publising packages to npm

### Private packages
npm login
npm publish

### Public packages
npm login
npm publish --access public

### Patch version
npm version patch
npm publish
