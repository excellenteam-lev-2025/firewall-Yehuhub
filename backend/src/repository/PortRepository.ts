import { getDb } from "../services/DbService";
import { config } from "../config/env";
import { portTable } from "../db/schema";
import { ZodError } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { portInsertSchema, PortListInput } from "../schemas/PortSchema";
import { UpdateListInput } from "../schemas/UpdateListSchema";
import { DbTransaction } from "../services/DbService";

const db = getDb();

export const insertPortList = async (data: PortListInput): Promise<void> => {
  const { values, mode } = data;
  try {
    const records = values.map((ip) => {
      return portInsertSchema.parse({
        value: ip,
        mode,
      });
    });
    await db.transaction(async (tx) => {
      await tx.insert(portTable).values(records);
    });
  } catch (err) {
    if (err instanceof ZodError) {
      console.error("Validation error: ", err.issues);
    }
    throw err;
  }
};

export const deletePortList = async (data: PortListInput): Promise<void> => {
  const { values, mode } = data;
  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(portTable)
        .where(and(inArray(portTable.value, values), eq(portTable.mode, mode)));
    });
  } catch (err) {
    if (err instanceof ZodError) {
      console.error("Validation error: ", err.issues);
    }
    throw err;
  }
};

export const findExistingPorts = async (data: PortListInput) => {
  const found = await db
    .select({ value: portTable.value, mode: portTable.mode })
    .from(portTable)
    .where(
      and(inArray(portTable.value, data.values), eq(portTable.mode, data.mode))
    );
  return found;
};

export const getAllPorts = async () => {
  const [blacklist, whitelist] = await Promise.all([
    db
      .select({
        id: portTable.id,
        value: portTable.value,
        active: portTable.active,
      })
      .from(portTable)
      .where(eq(portTable.mode, config.constants.blacklist)),
    db
      .select({
        id: portTable.id,
        value: portTable.value,
        active: portTable.active,
      })
      .from(portTable)
      .where(eq(portTable.mode, config.constants.whitelist)),
  ]);
  return {
    blacklist,
    whitelist,
  };
};

export const updatePorts = async (
  ports: UpdateListInput,
  tx: DbTransaction
) => {
  if (ports.ids.length === 0) return [];

  const found = await tx
    .select({ id: portTable.id })
    .from(portTable)
    .where(
      and(inArray(portTable.id, ports.ids), eq(portTable.mode, ports.mode))
    );

  if (found.length != ports.ids.length) {
    throw new Error("One or more of the requested id's not found");
  }

  return await tx
    .update(portTable)
    .set({ active: ports.active })
    .where(
      and(inArray(portTable.id, ports.ids), eq(portTable.mode, ports.mode))
    )
    .returning({
      id: portTable.id,
      value: portTable.value,
      active: portTable.active,
    });
};
