import "dotenv/config";

interface Env {
  NATS_CLUSTER_ID: string;
  NATS_CLIENT_ID: string;
  NATS_URL: string;
}

const getConfig = (): Env => {
  return {
    NATS_CLUSTER_ID: process.env.NATS_CLUSTER_ID,
    NATS_CLIENT_ID: process.env.NATS_CLIENT_ID,
    NATS_URL: process.env.NATS_URL,
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
