import sequelize from "../services/DbService";
import Ip from "../types/models/Ip";
import { Op, where } from "sequelize";
import { updateList } from "../controllers/RulesController";

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

export const getAllIps = async () => {
  try {
    const [blacklist, whitelist] = await Promise.all([
      Ip.findAll({
        where: {
          mode: "blacklist",
        },
        raw: true,
        attributes: { exclude: ["mode", "active"] },
      }),

      Ip.findAll({
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

export const updateIps = async (ips: updateList) => {
  if (Object.keys(ips).length === 0) return [];

  const transaction = await sequelize.transaction();
  try {
    const found = await Ip.findAll({
      where: { id: ips.ids, mode: ips.mode },
      attributes: ["id"],
      transaction,
      raw: true,
    });

    if (found.length !== ips.ids.length) {
      throw new Error("One or more of the requested ip ids not found");
    }
    await Ip.update(
      { active: ips.active },
      { where: { id: ips.ids, mode: ips.mode }, transaction }
    );

    const result = await Ip.findAll({
      where: {
        id: ips.ids,
        mode: ips.mode,
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
