declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      ENVIRONMENT: string;
      LOG_DIR: string;
      LOG_LEVEL: string;
      VERSION: string;
      DB_NAME: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_USER: string;
      DB_USER_PWD: string;
      DB_MIN_POOL_SIZE: string;
      DB_MAX_POOL_SIZE: string;
      SALT_ROUNDS: string;
      JWT_KEY: string;
      NATS_CLUSTER_ID: string;
      NATS_CLIENT_ID: string;
      NATS_URL: string;
    }
  }
}

export {};
