import { config } from "../config/env";
import { drizzle } from "drizzle-orm/node-postgres";

let dbInstance: ReturnType<typeof drizzle> | null = null;

export const getDb = () => {
  if (!dbInstance) {
    dbInstance = drizzle(config.env.DATABASE_URL);
  }
  return dbInstance;
};

export const testDbConnection = async (
  maxRetries: number = 5
): Promise<void> => {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      await getDb().execute("SELECT 1");
      console.log("DB connected");
      return;
    } catch (err) {
      attempts++;
      console.error("Connection to DB Failed, retrying");
      await new Promise((res) =>
        setTimeout(res, config.env.DB_CONNECTION_INTERVAL)
      );
    }
  }
  throw new Error("Could not connect to db after max retries");
};

const db = getDb();
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
