import "@/database/index";
import { sanitizedConfig } from "@/config/config";
import app from "@/app";

const startApp = async () => {
  console.log("Starting auth microservice...")
  app.init(sanitizedConfig.PORT);
};

startApp();
