import { db } from "../services/DbService";
import { config } from "../config/env";
import { ipInsertSchema, IpListInput } from "../schemas/IpSchema";
import { ipTable } from "../db/schema";
import { ZodError } from "zod";
import { eq, and, inArray } from "drizzle-orm";

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

export const getAllExistingIps = async (data: IpListInput) => {
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

// export const updateIps = async (ips: updateList) => {
//   if (Object.keys(ips).length === 0) return [];

//   const transaction = await sequelize.transaction();
//   try {
//     const found = await Ip.findAll({
//       where: { id: ips.ids, mode: ips.mode },
//       attributes: ["id"],
//       transaction,
//       raw: true,
//     });

//     if (found.length !== ips.ids.length) {
//       throw new Error("One or more of the requested ip ids not found");
//     }
//     await Ip.update(
//       { active: ips.active },
//       { where: { id: ips.ids, mode: ips.mode }, transaction }
//     );

//     const result = await Ip.findAll({
//       where: {
//         id: ips.ids,
//         mode: ips.mode,
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
