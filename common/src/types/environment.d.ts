declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENVIRONMENT: string;
      LOG_DIR: string;
      LOG_LEVEL: string;
      SALT_ROUNDS: string;
      JWT_KEY: string;
    }
  }
}

export {};
