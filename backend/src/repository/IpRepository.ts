import { getDb } from "../services/DbService";
import { config } from "../config/env";
import { ipInsertSchema, IpListInput } from "../schemas/IpSchema";
import { ipTable } from "../db/schema";
import { ZodError } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { UpdateListInput } from "../schemas/UpdateListSchema";
import { DbTransaction } from "../services/DbService";

const db = getDb();

export const insertIpList = async (data: IpListInput): Promise<void> => {
  const { values, mode } = data;
  try {
    const records = values.map((ip) => {
      return ipInsertSchema.parse({
        value: ip,
        mode,
      });
    });
    await db.transaction(async (tx) => {
      await tx.insert(ipTable).values(records);
    });
  } catch (err) {
    if (err instanceof ZodError) {
      console.error("Validation error: ", err.issues);
    }
    throw err;
  }
};

export const deleteIpList = async (data: IpListInput): Promise<void> => {
  const { values, mode } = data;
  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(ipTable)
        .where(and(inArray(ipTable.value, values), eq(ipTable.mode, mode)));
    });
  } catch (err) {
    if (err instanceof ZodError) {
      console.error("Validation error: ", err.issues);
    }
    throw err;
  }
};

export const findExistingIps = async (data: IpListInput) => {
  const found = await db
    .select({ value: ipTable.value, mode: ipTable.mode })
    .from(ipTable)
    .where(
      and(inArray(ipTable.value, data.values), eq(ipTable.mode, data.mode))
    );
  return found;
};

// caller catches the db error for it since errors here are not meaningful enough
export const getAllIps = async () => {
  const [blacklist, whitelist] = await Promise.all([
    db
      .select({ id: ipTable.id, value: ipTable.value })
      .from(ipTable)
      .where(eq(ipTable.mode, config.constants.blacklist)),
    db
      .select({ id: ipTable.id, value: ipTable.value })
      .from(ipTable)
      .where(eq(ipTable.mode, config.constants.whitelist)),
  ]);
  return {
    blacklist,
    whitelist,
  };
};

export const updateIps = async (ips: UpdateListInput, tx: DbTransaction) => {
  if (ips.ids.length === 0) return [];

  const found = await tx
    .select({ id: ipTable.id })
    .from(ipTable)
    .where(and(inArray(ipTable.id, ips.ids), eq(ipTable.mode, ips.mode)));

  if (found.length != ips.ids.length) {
    throw new Error("One or more of the requested id's not found");
  }

  return await tx
    .update(ipTable)
    .set({ active: ips.active })
    .where(and(inArray(ipTable.id, ips.ids), eq(ipTable.mode, ips.mode)))
    .returning({
      id: ipTable.id,
      value: ipTable.value,
      active: ipTable.active,
    });
};
