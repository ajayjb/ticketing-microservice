### Creating secrets in k8s

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