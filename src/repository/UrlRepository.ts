import sequelize from "../db/DbSetup";
import Url from "../models/Url";
import { Op } from "sequelize";

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
