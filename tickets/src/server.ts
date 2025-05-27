import "@/database/index";
import { sanitizedConfig } from "@/config/config";
import app from "@/app";

app.init(sanitizedConfig.PORT);
