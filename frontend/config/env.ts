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
  SERVER_URL: z
    .string()
    .refine((val) => validator.isURL(val), { message: "Invalid server url" }),
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

const { ENV, PORT, LOG_FILE_PATH, SERVER_URL } = parsedEnv.data;

export const config = {
  env: {
    ENV,
    PORT,
    SERVER_URL,
    LOG_FILE_PATH,
  },
  constants: {
    RULES_URL: "http://localhost:3000/api/firewall/rules",
  },
};
