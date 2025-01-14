import "dotenv/config";

interface ENV {
  PORT: number | undefined;
}

const getConfig = (): ENV => {
  return {
    PORT: process.env?.PORT ? Number(process.env.PORT) : undefined,
  };
};

const getSanitizedConfig = (config: ENV): ENV => {
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
