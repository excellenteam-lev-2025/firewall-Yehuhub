import { Request, Response, NextFunction } from "express";
import {
  insertPortList,
  deletePortList,
  getAllExistingPorts,
} from "../repository/PortRepository";
import { StatusCodes } from "http-status-codes";
import { PortListInput, portListSchema } from "../schemas/PortSchema";

export const validatePortList = (
  req: Request<{}, {}, PortListInput>,
  res: Response,
  next: NextFunction
): void | Response => {
  try {
    portListSchema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

export const addPorts = async (
  req: Request<{}, {}, PortListInput>,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { mode, values } = req.body;
  try {
    await insertPortList({ mode, values });
  } catch (err) {
    next(err);
  }

  return res
    .status(StatusCodes.OK)
    .json({ type: "port", mode: mode, values: values, status: "success" });
};

export const removePorts = async (
  req: Request<{}, {}, PortListInput>,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { mode, values } = req.body;

  try {
    const allExistingIps = await getAllExistingPorts({ mode, values });
    const existingIps = allExistingIps.map((ip) => ip.value);
    const ipsNotExisting = values.filter((ip) => !existingIps.includes(ip));
    if (ipsNotExisting.length > 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "One or more IP addresses not found in the database" });
    }

    await deletePortList({ values, mode });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error while removing IP addresses",
    });
  }

  return res
    .status(StatusCodes.OK)
    .json({ type: "port", mode: mode, values: values, status: "success" });
};
