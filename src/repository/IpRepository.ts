import sequelize from "../db/DbSetup";
import Ip from "../models/Ip";
import { Op } from "sequelize";

export const insertIpList = async (
  ipList: string[],
  mode: string
): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const records = ipList.map((ip) => ({
      value: ip,
      mode: mode,
      active: true,
    }));

    await Ip.bulkCreate(records, {
      validate: true,
      transaction,
    });

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export const deleteIpList = async (
  ipList: string[],
  mode: string
): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    await Ip.destroy({
      where: {
        value: { [Op.in]: ipList },
        mode: mode, // not strictly necessary as we already validated that in doesIpExists
      },
      transaction,
    });

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export const doesIpExists = async (
  ip: string,
  mode: string
): Promise<Boolean> => {
  const found = await Ip.findOne({
    where: { value: ip, mode: mode },
  });
  return found !== null;
};
