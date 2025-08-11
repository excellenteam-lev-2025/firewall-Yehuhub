import winston from "winston";
import { config } from "./env";

const isDev = config.env.ENV === "dev";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    isDev
      ? new winston.transports.Console()
      : new winston.transports.File({ filename: config.env.LOG_FILE_PATH }),
  ],
});

console.log = (...args) => logger.info(...args);
console.error = (...args) => logger.error(...args);
console.warn = (...args) => logger.warn(...args);
console.info = (...args) => logger.info(...args);
