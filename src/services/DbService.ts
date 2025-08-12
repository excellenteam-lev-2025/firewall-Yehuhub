import { config } from "../config/env";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(config.env.DATABASE_URL);

export const testDbConnection = async (): Promise<void> => {
  while (true) {
    try {
      await db.execute("SELECT 1");
      console.log("DB connected");
      break;
    } catch (err) {
      console.error("Connection to DB Failed, retrying");
      await new Promise((res) =>
        setTimeout(res, config.env.DB_CONNECTION_INTERVAL)
      );
    }
  }
};

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
