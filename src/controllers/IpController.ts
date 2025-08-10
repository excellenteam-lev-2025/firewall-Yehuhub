import { Request, Response, NextFunction } from "express";
import { validateIp } from "../utils/validators";
import {
  insertIpList,
  doesIpExists,
  deleteIpList,
} from "../repository/IpRepository";

export const validateIpList = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { values } = req.body;

  if (!Array.isArray(values) || values.length === 0) {
    return res
      .status(400)
      .json({ error: "'values' must be a non-empty array of IPs" });
  }

  const invalidIp = values.find((ip: string) => !validateIp(ip));

  if (invalidIp)
    return res
      .status(400)
      .json({ error: "One or more IP addresses are invalid" });

  next();
};

export const addIp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { mode, values } = req.body;

  try {
    await insertIpList(values, mode);
  } catch (err: any) {
    if (err.name === "SequelizeUniqueConstraintError") {
      console.log({ message: "UNIQUE CONSTRAINT ERROR", error: err.name });
      return res.status(400).json({
        error: "One or more IP addresses already exist in the db",
      });
    }
    console.log({ message: "DB ERROR", error: err });
    return res.status(500).json({
      error: "Internal server error while inserting IP addresses",
    });
  }

  return res
    .status(200)
    .json({ type: "ip", mode: mode, values: values, status: "success" });
};

export const removeIp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { mode, values } = req.body;

  try {
    const ipExistsResult = await Promise.all(
      values.map(async (ip: string) => ({
        ip: ip,
        exists: await doesIpExists(ip, mode),
      }))
    );

    const ipNotExists = ipExistsResult.find((ip) => !ip.exists);

    if (ipNotExists) {
      return res
        .status(400)
        .json({ error: "One or more IP addresses not found in the database" });
    }

    await deleteIpList(values, mode);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Internal server error while inserting IP addresses",
    });
  }

  return res
    .status(200)
    .json({ type: "ip", mode: mode, values: values, status: "success" });
};
