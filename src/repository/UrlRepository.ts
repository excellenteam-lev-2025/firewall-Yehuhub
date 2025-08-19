import { getDb, DbTransaction } from "../services/DbService";
import { config } from "../config/env";
import { urlTable } from "../db/schema";
import { ZodError } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { urlInsertSchema, UrlListInput } from "../schemas/UrlSchema";
import { UpdateListInput } from "../schemas/UpdateListSchema";

const db = getDb();

export const insertUrlList = async (data: UrlListInput): Promise<void> => {
  const { values, mode } = data;
  try {
    const records = values.map((ip) => {
      return urlInsertSchema.parse({
        value: ip,
        mode,
      });
    });
    await db.transaction(async (tx) => {
      await tx.insert(urlTable).values(records);
    });
  } catch (err) {
    if (err instanceof ZodError) {
      console.error("Validation error: ", err.issues);
    }
    throw err;
  }
};

export const deleteUrlList = async (data: UrlListInput): Promise<void> => {
  const { values, mode } = data;
  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(urlTable)
        .where(and(inArray(urlTable.value, values), eq(urlTable.mode, mode)));
    });
  } catch (err) {
    if (err instanceof ZodError) {
      console.error("Validation error: ", err.issues);
    }
    throw err;
  }
};

export const getAllDuplicatedUrlsFromList = async (data: UrlListInput) => {
  const found = await db
    .select({ value: urlTable.value, mode: urlTable.mode })
    .from(urlTable)
    .where(
      and(inArray(urlTable.value, data.values), eq(urlTable.mode, data.mode))
    );
  return found;
};

export const getAllUrls = async () => {
  const [blacklist, whitelist] = await Promise.all([
    db
      .select({ id: urlTable.id, value: urlTable.value })
      .from(urlTable)
      .where(eq(urlTable.mode, config.constants.blacklist)),
    db
      .select({ id: urlTable.id, value: urlTable.value })
      .from(urlTable)
      .where(eq(urlTable.mode, config.constants.whitelist)),
  ]);
  return {
    blacklist,
    whitelist,
  };
};

export const updateUrls = async (urls: UpdateListInput, tx: DbTransaction) => {
  if (urls.ids.length === 0) return [];

  const found = await tx
    .select({ id: urlTable.id })
    .from(urlTable)
    .where(and(inArray(urlTable.id, urls.ids), eq(urlTable.mode, urls.mode)));

  if (found.length != urls.ids.length) {
    throw new Error("One or more of the requested id's not found");
  }

  return await tx
    .update(urlTable)
    .set({ active: urls.active })
    .where(and(inArray(urlTable.id, urls.ids), eq(urlTable.mode, urls.mode)))
    .returning({
      id: urlTable.id,
      value: urlTable.value,
      active: urlTable.active,
    });
};
