import "@/database/index";
import { sanitizedConfig } from "@/config/config";
import app from "@/app";

const startApp = async () => {
  app.init(sanitizedConfig.PORT);
};

startApp();
