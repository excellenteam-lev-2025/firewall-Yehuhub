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
  DEV_DATABASE: z.url(),
  PRODUCTION_DATABASE: z.url(),
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

const { ENV, PORT, DEV_DATABASE, PRODUCTION_DATABASE, LOG_FILE_PATH } =
  parsedEnv.data;

export const config = {
  env: {
    ENV,
    PORT,
    DATABASE_URL: ENV === "dev" ? DEV_DATABASE : PRODUCTION_DATABASE,
    LOG_FILE_PATH,
  },
  constants: {
    blacklist: "blacklist",
    whitelist: "whitelist",
  },
};
