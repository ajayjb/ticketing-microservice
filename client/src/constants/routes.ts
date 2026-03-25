export const ROUTES = {
  HOME: "/",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  TICKETS: (slug: string) => {
    return `/tickets/${slug}`;
  },
  ORDERS: (id: string) => {
    return `/orders/${id}`;
  },
};

export const PUBLIC_ROUTES = ["/signin", "/signup"];
