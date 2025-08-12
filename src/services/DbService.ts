import { config } from "../config/env";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(config.env.DATABASE_URL);

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
