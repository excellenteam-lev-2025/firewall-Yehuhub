import { Request, Response, NextFunction } from "express";
import { getAllIps } from "../repository/IpRepository";
import { getAllUrls } from "../repository/UrlRepository";
import { getAllPorts } from "../repository/PortRepository";
import { config } from "../config/env";
import { StatusCodes } from "http-status-codes";
import { UpdateAllInput, updateAllSchema } from "../schemas/UpdateListSchema";
import { toggleStatus } from "../repository/RulesRepository";

const validateUpdateObject = async (
  req: Request<{}, {}, UpdateAllInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    updateAllSchema.parse(req.body); //zod errors are caught in the error handler
    next();
  } catch (err) {
    next(err);
  }
};

export const getAllRules = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const ips = await getAllIps();
    const urls = await getAllUrls();
    const ports = await getAllPorts();

    return res.status(StatusCodes.OK).json({ ips, urls, ports });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
};

export const toggleRuleStatus = async (
  req: Request<{}, {}, UpdateAllInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = updateAllSchema.parse(req.body);
    const updateResult = await toggleStatus(validatedData);
    return res.status(StatusCodes.OK).json(updateResult);
  } catch (err) {
    next(err);
  }
};
