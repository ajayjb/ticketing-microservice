import "dotenv/config";

interface Env {
  ENVIRONMENT: string;
  LOG_DIR: string;
  LOG_LEVEL: string;
  SALT_ROUNDS: number;
  JWT_KEY: string;
}

const getConfig = (): Env => {
  return {
    ENVIRONMENT: process.env.ENVIRONMENT,
    LOG_DIR: process.env.LOG_DIR || "logs",
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS),
    JWT_KEY: process.env.JWT_KEY,
  };
};

const getSanitizedConfig = (config: Env): Env => {
  return config;
};

const config = getConfig();
export const sanitizedConfig = getSanitizedConfig(config);
