import { config } from "../config/env";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(config.env.DATABASE_URL);
