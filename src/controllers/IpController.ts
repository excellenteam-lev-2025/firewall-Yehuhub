import { Request, Response, NextFunction } from "express";
import {
  insertIpList,
  deleteIpList,
  getAllExistingIps,
} from "../repository/IpRepository";
import { StatusCodes } from "http-status-codes";
import { IpListInput, ipListSchema } from "../schemas/IpSchema";

export const validateIpList = (
  req: Request<{}, {}, IpListInput>,
  res: Response,
  next: NextFunction
): void | Response => {
  try {
    ipListSchema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

export const addIp = async (
  req: Request<{}, {}, IpListInput>,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { mode, values } = req.body;
  try {
    await insertIpList({ mode, values });
  } catch (err) {
    next(err);
  }

  return res
    .status(StatusCodes.OK)
    .json({ type: "ip", mode: mode, values: values, status: "success" });
};

export const removeIp = async (
  req: Request<{}, {}, IpListInput>,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { mode, values } = req.body;

  try {
    const allExistingIps = await getAllExistingIps({ mode, values });
    const existingIps = allExistingIps.map((ip) => ip.value);
    const ipsNotExisting = values.filter((ip) => !existingIps.includes(ip));
    if (ipsNotExisting.length > 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "One or more IP addresses not found in the database" });
    }

    await deleteIpList({ values, mode });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error while removing IP addresses",
    });
  }

  return res
    .status(StatusCodes.OK)
    .json({ type: "ip", mode: mode, values: values, status: "success" });
};
