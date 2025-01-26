import "dotenv/config";

interface Env {
  PORT: number;
  environment: string;
}

const getConfig = (): Env => {
  return {
    PORT: Number(process.env.PORT),
    environment: process.env.environment,
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
