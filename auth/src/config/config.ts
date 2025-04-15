import "dotenv/config";

interface Db {
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_USER_PWD: string;
  DB_MIN_POOL_SIZE: number;
  DB_MAX_POOL_SIZE: number;
}

interface Env extends Db {
  PORT: number;
  ENVIRONMENT: string;
  LOG_DIR: string;
  LOG_LEVEL: string;
  VERSION: string;
  SALT_ROUNDS: number;
}

const getConfig = (): Env => {
  return {
    PORT: Number(process.env.PORT),
    ENVIRONMENT: process.env.ENVIRONMENT,
    LOG_DIR: process.env.LOG_DIR,
    LOG_LEVEL: process.env.LOG_LEVEL,
    VERSION: process.env.VERSION,
    DB_NAME: process.env.DB_NAME,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: parseInt(process.env.DB_PORT),
    DB_USER: process.env.DB_USER,
    DB_USER_PWD: process.env.DB_USER_PWD,
    DB_MIN_POOL_SIZE: parseInt(process.env.DB_MIN_POOL_SIZE),
    DB_MAX_POOL_SIZE: parseInt(process.env.DB_MAX_POOL_SIZE),
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS),
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
const sanitizedConfig = getSanitizedConfig(config);

const db = {
  name: sanitizedConfig.DB_NAME,
  host: sanitizedConfig.DB_HOST,
  port: sanitizedConfig.DB_PORT,
  user: sanitizedConfig.DB_USER,
  password: sanitizedConfig.DB_USER_PWD,
  minPoolSize: sanitizedConfig.DB_MIN_POOL_SIZE,
  maxPoolSize: sanitizedConfig.DB_MAX_POOL_SIZE,
};

export { sanitizedConfig, db };
