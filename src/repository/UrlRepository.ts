import sequelize from "../db/DbSetup";
import Url from "../models/Url";
import { Op } from "sequelize";
import { updateList } from "../controllers/RulesController";

export const insertUrlList = async (
  urlList: string[],
  mode: string
): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const records = urlList.map((url) => ({
      value: url,
      mode: mode,
      active: true,
    }));

    await Url.bulkCreate(records, {
      validate: true,
      transaction,
    });

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export const deleteUrlList = async (
  urlList: string[],
  mode: string
): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    await Url.destroy({
      where: {
        value: { [Op.in]: urlList },
        mode: mode, // not strictly necessary as we already validated that in doesUrlExists
      },
      transaction,
    });

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export const doesUrlExists = async (
  url: string,
  mode: string
): Promise<Boolean> => {
  const found = await Url.findOne({
    where: { value: url, mode: mode },
  });
  return found !== null;
};

export const getAllUrls = async () => {
  try {
    const [blacklist, whitelist] = await Promise.all([
      Url.findAll({
        where: {
          mode: "blacklist",
        },
        raw: true,
        attributes: { exclude: ["mode", "active"] },
      }),

      Url.findAll({
        where: {
          mode: "whitelist",
        },
        raw: true,
        attributes: { exclude: ["mode", "active"] },
      }),
    ]);
    return {
      blacklist,
      whitelist,
    };
  } catch (err) {
    throw err;
  }
};

export const updateUrls = async (urls: updateList) => {
  if (Object.keys(urls).length === 0) return [];

  const transaction = await sequelize.transaction();
  try {
    const found = await Url.findAll({
      where: { id: urls.ids, mode: urls.mode },
      attributes: ["id"],
      transaction,
      raw: true,
    });

    if (found.length !== urls.ids.length) {
      throw new Error("One or more of the requested url ids not found");
    }
    await Url.update(
      { active: urls.active },
      { where: { id: urls.ids, mode: urls.mode }, transaction }
    );

    const result = await Url.findAll({
      where: {
        id: urls.ids,
        mode: urls.mode,
      },
      raw: true,
      attributes: { exclude: ["mode"] },
      transaction,
    });
    await transaction.commit();
    return result;
  } catch (err) {
    console.error(err);
    await transaction.rollback();
    throw err;
  }
};
