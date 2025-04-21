interface Env {
  NEXT_PUBLIC_API_URL: string;
}

const getConfig = (): Env => {
  return {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
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
