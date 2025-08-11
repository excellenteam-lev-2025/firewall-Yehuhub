import { z } from "zod";
import validator from "validator";
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
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    z.treeifyError(parsedEnv.error)
  );
  process.exit(1);
}

const { ENV, PORT, DEV_DATABASE, PRODUCTION_DATABASE } = parsedEnv.data;

export const config = {
  env: {
    ENV,
    PORT,
    DATABASE: ENV === "dev" ? DEV_DATABASE : PRODUCTION_DATABASE,
  },
};
