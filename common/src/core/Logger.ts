import winston, { format } from "winston";
import fs from "fs";
import DailyRotateFile from "winston-daily-rotate-file";
import { sanitizedConfig } from "@/config/config";

const dir = sanitizedConfig.LOG_DIR;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const logfileRotateTransport = new DailyRotateFile({
  level: sanitizedConfig.LOG_LEVEL,
  // @ts-ignore
  filename: dir + "/%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  handleExceptions: true,
  maxSize: "20m",
  maxFiles: "14d",
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json()
  ),
});

const consoleTransport = new winston.transports.Console({
  level: process.env.LOG_LEVEL,
  format: format.combine(
    format.colorize({ all: true }),
    format.timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    format.align(),
    format.printf(
      (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
    )
  ),
});

export const logger = winston.createLogger({
  transports: [consoleTransport, logfileRotateTransport],
  exceptionHandlers: [logfileRotateTransport],
  exitOnError: false,
});
