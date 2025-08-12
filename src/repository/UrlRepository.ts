import { db } from "../services/DbService";
import { config } from "../config/env";
import { urlTable } from "../db/schema";
import { ZodError } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { urlInsertSchema, UrlListInput } from "../schemas/UrlSchema";

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

export const getAllExistingUrls = async (data: UrlListInput) => {
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

// export const updateUrls = async (urls: updateList) => {
//   if (Object.keys(urls).length === 0) return [];

//   const transaction = await sequelize.transaction();
//   try {
//     const found = await Url.findAll({
//       where: { id: urls.ids, mode: urls.mode },
//       attributes: ["id"],
//       transaction,
//       raw: true,
//     });

//     if (found.length !== urls.ids.length) {
//       throw new Error("One or more of the requested url ids not found");
//     }
//     await Url.update(
//       { active: urls.active },
//       { where: { id: urls.ids, mode: urls.mode }, transaction }
//     );

//     const result = await Url.findAll({
//       where: {
//         id: urls.ids,
//         mode: urls.mode,
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
