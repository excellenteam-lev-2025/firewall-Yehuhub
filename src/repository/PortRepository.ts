import { db } from "../services/DbService";
import { config } from "../config/env";
import { portTable } from "../db/schema";
import { ZodError } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { portInsertSchema, PortListInput } from "../schemas/PortSchema";

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

export const getAllExistingPorts = async (data: PortListInput) => {
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
      .select({ id: portTable.id, value: portTable.value })
      .from(portTable)
      .where(eq(portTable.mode, config.constants.blacklist)),
    db
      .select({ id: portTable.id, value: portTable.value })
      .from(portTable)
      .where(eq(portTable.mode, config.constants.whitelist)),
  ]);
  return {
    blacklist,
    whitelist,
  };
};

// export const updatePorts = async (ports: updateList) => {
//   if (Object.keys(ports).length === 0) return [];
//   const transaction = await sequelize.transaction();
//   try {
//     const found = await Port.findAll({
//       where: { id: ports.ids, mode: ports.mode },
//       attributes: ["id"],
//       transaction,
//       raw: true,
//     });

//     if (found.length !== ports.ids.length) {
//       throw new Error("One or more of the requested port ids not found");
//     }
//     await Port.update(
//       { active: ports.active },
//       { where: { id: ports.ids, mode: ports.mode }, transaction }
//     );

//     const result = await Port.findAll({
//       where: {
//         id: ports.ids,
//         mode: ports.mode,
//       },
//       raw: true,
//       attributes: { exclude: ["mode"] },
//       transaction,
//     });
//     await transaction.commit();
//     return result;
//   } catch (err) {
//     console.error(err);
//     await transaction.rollback();
//     throw err;
//   }
// };
