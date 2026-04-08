export const API_ENDPOINT = {
  USER: {
    SIGNIN: "/api/v1/auth/user/signin",
    SIGNUP: "/api/v1/auth/user/signup",
    SIGNOUT: "/api/v1/auth/user/signout",
    CURRENT_USER: "/api/v1/auth/user/currentUser",
  },
  TICKETS: {
    CREATE: "/api/v1/tickets/create",
    FIND_ALL: "/api/v1/tickets/findAll",
    FIND_BY_ID: "/api/v1/tickets/findById",
    FIND_ONE: "/api/v1/tickets/findOne",
    UPDATE: "/api/v1/tickets/update",
    DELETE: "/api/v1/tickets/remove",
  },
  ORDERS: {
    CREATE: "/api/v1/orders/create",
    FIND_BY_USER: "/api/v1/orders/findByUser",
    CANCEL: "/api/v1/orders/cancel",
    FIND_BY_ID: "/api/v1/orders/findById",
  },
  PAYMENTS: {
    CREATE: "/api/v1/payments/create",
  },
};

// export const INGRESS_NGINX_CONTROLLER_SVC_URL =
//   "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local";

export const INGRESS_NGINX_CONTROLLER_SVC_URL = "http://tix.ajayjb.shop"
