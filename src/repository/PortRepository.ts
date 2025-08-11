import sequelize from "../services/DbService";
import Port from "../types/models/Port";
import { Op } from "sequelize";
import { updateList } from "../types/interfaces/UpdateList";
import { config } from "../config/env";

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
          mode: config.constants.blacklist,
        },
        raw: true,
        attributes: { exclude: ["mode", "active"] },
      }),

      Port.findAll({
        where: {
          mode: config.constants.whitelist,
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

export const updatePorts = async (ports: updateList) => {
  if (Object.keys(ports).length === 0) return [];
  const transaction = await sequelize.transaction();
  try {
    const found = await Port.findAll({
      where: { id: ports.ids, mode: ports.mode },
      attributes: ["id"],
      transaction,
      raw: true,
    });

    if (found.length !== ports.ids.length) {
      throw new Error("One or more of the requested port ids not found");
    }
    await Port.update(
      { active: ports.active },
      { where: { id: ports.ids, mode: ports.mode }, transaction }
    );

    const result = await Port.findAll({
      where: {
        id: ports.ids,
        mode: ports.mode,
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
