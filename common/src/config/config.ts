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
    LOG_DIR: process.env.LOG_DIR,
    LOG_LEVEL: process.env.LOG_LEVEL,
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS),
    JWT_KEY: process.env.JWT_KEY,
  };
};

const getSanitizedConfig = (config: Env): Env => {
  for (const [key, value] of Object.entries(config)) {
    if (!value) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }

  return config;
};

const config = getConfig();
export const sanitizedConfig = getSanitizedConfig(config);
