import "dotenv/config";

type Env = {
  PORT: number;
  ENVIRONMENT: string;
  LOG_DIR: string;
  LOG_LEVEL: string;
  VERSION: string;
};

const getConfig = (): Env => {
  return {
    PORT: Number(process.env.PORT),
    ENVIRONMENT: process.env.ENVIRONMENT,
    LOG_DIR: process.env.LOG_DIR,
    LOG_LEVEL: process.env.LOG_LEVEL,
    VERSION: process.env.VERSION,
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

export { sanitizedConfig };
