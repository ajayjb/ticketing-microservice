import "dotenv/config";

interface Env {
  PORT: number;
}

const getConfig = (): Env => {
  return {
    PORT: Number(process.env.PORT),
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
