declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NATS_CLUSTER_ID: string;
      NATS_CLIENT_ID: string;
      NATS_URL: string;
    }
  }
}

export {};
