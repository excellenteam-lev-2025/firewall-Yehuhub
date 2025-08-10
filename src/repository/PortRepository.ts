import sequelize from "../db/DbSetup";
import Port from "../models/Port";
import { Op } from "sequelize";

export const insertPortList = async (
  portList: number[],
  mode: string
): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const records = portList.map((port) => ({
      value: port,
      mode: mode,
      active: true,
    }));

    await Port.bulkCreate(records, {
      validate: true,
      transaction,
    });

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export const deletePortList = async (
  portList: number[],
  mode: string
): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    await Port.destroy({
      where: {
        value: { [Op.in]: portList },
        mode: mode,
      },
      transaction,
    });

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export const doesPortExists = async (
  port: number,
  mode: string
): Promise<Boolean> => {
  const found = await Port.findOne({
    where: { value: port, mode: mode },
  });
  return found !== null;
};

export const getAllPorts = async () => {
  try {
    const [blacklist, whitelist] = await Promise.all([
      Port.findAll({
        where: {
          mode: "blacklist",
        },
        raw: true,
        attributes: { exclude: ["mode", "active"] },
      }),

      Port.findAll({
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
