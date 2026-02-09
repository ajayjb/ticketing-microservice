export const API_ENDPOINT = {
  USER: {
    SIGNIN: "/api/v1/auth/user/signin",
    SIGNUP: "/api/v1/auth/user/signup",
    SIGNOUT: "/api/v1/auth/user/signout",
    CURRENT_USER: "/api/v1/auth/user/currentUser",
  },
};

export const INGRESS_NGINX_CONTROLLER_SVC_URL =
  "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local";
