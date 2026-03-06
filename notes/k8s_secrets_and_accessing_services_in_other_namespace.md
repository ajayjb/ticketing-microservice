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
http://<service-name>.<namespace>.svc.cluster.local/<path>
```

### 🔧 Example

```js
// Inside getServerSideProps
export async function getServerSideProps(context) {
  const response = await fetch(
    'http://auth-svc.default.svc.cluster.local/api/auth/v1/user/currentUser',
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

### Using tsc to build
- Why we use TSUP instead of TSC:
  TypeScript (tsc) does not handle import aliases correctly — it doesn’t throw an error, but simply leaves the alias unchanged in the compiled output.
  To solve this, we use tsup for building. It offers several advantages:

  Supports path aliases
  Faster compilation
  Bundles the entire codebase into a single output file (or multiple formats if needed)

- Module and resolution settings in tsconfig.json:
  If you set "module": "node18" and "moduleResolution": "node18", Node.js expects all import paths to include file extensions (e.g., import './test.js').
  To avoid this strict behavior, it’s often more practical to use:

  "module": "commonjs",
  "moduleResolution": "node"
  However, this distinction becomes less important when using tools like tsx for development and tsup for builds, since they handle much of this automatically.

- Impact of package.json > type field:
  When running .cjs or .mjs files, Node.js ignores the "type" field — the file extension alone determines the module system:
  
  If type is commonjs tsup produces .js as commonjs and .mjs so if wont conflict with our type we can run node .js or .mjs without worrying about type. since
  type is commonjs it can run using node .js file. For .mjs node will understand its commonjs file.

  If type is module tsup produces .js as modulejs and .cjs so if wont conflict with our type we can run node .js or .cjs without worrying about type. since type is module it can run using node .js file. For .cjs node will understand its commonjs file.

 .mjs → treated as ESM
 .cjs → treated as CommonJS

 But for .js files, the "type" field does matter:
 "type": "module" → .js is treated as ESM
 "type": "commonjs" → .js is treated as CommonJS

 we can explicitly distinguish formats in tsup config:
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    };
  }
