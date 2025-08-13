import { z } from "zod";
import validator from "validator";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  ENV: z
    .enum(["dev", "production"], {
      message: "ENV must be either 'dev' or 'production'",
    })
    .default("dev"),
  PORT: z
    .string()
    .refine((val) => validator.isPort(val), {
      message: "Invalid port provided",
    })
    .transform(Number),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_IP: z.string().refine((val) => validator.isIP(val), "Invalid db ip"),
  DB_NAME_PROD: z.string(),
  DB_NAME_DEV: z.string(),
  DB_PORT: z.string().refine((val) => validator.isPort(val), "Invalid db port"),
  DB_CONNECTION_INTERVAL: z
    .string()
    .refine((val) => validator.isNumeric(val))
    .transform(Number)
    .default(5000),
  LOG_FILE_PATH: z.string().refine((filePath) => {
    try {
      path.parse(filePath);
      return filePath.length > 0;
    } catch {
      return false;
    }
  }, "invalid file name"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    z.treeifyError(parsedEnv.error)
  );
  process.exit(1);
}

const {
  ENV,
  PORT,
  LOG_FILE_PATH,
  DB_NAME_DEV,
  DB_IP,
  DB_NAME_PROD,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
  DB_CONNECTION_INTERVAL,
} = parsedEnv.data;

const dbNames = {
  dev: DB_NAME_DEV,
  production: DB_NAME_PROD,
};

export const config = {
  env: {
    ENV,
    PORT,
    DATABASE_URL: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_IP}:${DB_PORT}/${dbNames[ENV]}`,
    LOG_FILE_PATH,
    DB_CONNECTION_INTERVAL,
  },
  constants: {
    blacklist: "blacklist",
    whitelist: "whitelist",
  },
};
