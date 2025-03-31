declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      ENVIRONMENT: string;
      LOG_DIR: string;
      LOG_LEVEL: string,
      VERSION: string
    }
  }
}

export {};
