export const API_ENDPOINT = {
  USER: {
    SIGNIN: "/api/auth/v1/user/signin",
    SIGNUP: "/api/auth/v1/user/signup",
    SIGNOUT: "/api/auth/v1/user/signout",
    CURRENT_USER: "/api/auth/v1/user/currentUser",
  },
};

export const INGRESS_NGINX_CONTROLLER_SVC_URL =
  "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local";
