import { Request, Response, NextFunction } from "express";
import { validatePort } from "../utils/validators";
import {
  deletePortList,
  doesPortExists,
  insertPortList,
} from "../repository/PortRepository";

export const validatePortList = (
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

  const invalidPort = values.find((port: number) => !validatePort(port));

  if (invalidPort)
    return res.status(400).json({ error: "One or more Ports are invalid" });

  next();
};

export const addPorts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { mode, values } = req.body;

  try {
    await insertPortList(values, mode);
  } catch (err: any) {
    if (err.name === "SequelizeUniqueConstraintError") {
      console.log({ message: "UNIQUE CONSTRAINT ERROR", error: err.name });
      return res.status(400).json({
        error: "One or more Ports already exist in the db",
      });
    }
    console.log({ message: "DB ERROR", error: err });
    return res.status(500).json({
      error: "Internal server error while inserting Ports",
    });
  }

  return res
    .status(200)
    .json({ type: "port", mode: mode, values: values, status: "success" });
};

export const removePorts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { mode, values } = req.body;

  try {
    const portExistsResult = await Promise.all(
      values.map(async (port: number) => ({
        port: port,
        exists: await doesPortExists(port, mode),
      }))
    );

    const portNotExists = portExistsResult.find((port) => !port.exists);

    if (portNotExists) {
      return res
        .status(400)
        .json({ error: "One or more Ports not found in the database" });
    }

    await deletePortList(values, mode);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Internal server error while inserting Ports",
    });
  }

  return res
    .status(200)
    .json({ type: "port", mode: mode, values: values, status: "success" });
};
