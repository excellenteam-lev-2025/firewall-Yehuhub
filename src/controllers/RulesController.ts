import { Request, Response, NextFunction } from "express";
import { getAllIps } from "../repository/IpRepository";
import { getAllUrls } from "../repository/UrlRepository";
import { getAllPorts } from "../repository/PortRepository";

export const getAllRules = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const ips = await getAllIps();
    const urls = await getAllUrls();
    const ports = await getAllPorts();

    return res.status(200).json({ ips, urls, ports });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const toggleRuleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
