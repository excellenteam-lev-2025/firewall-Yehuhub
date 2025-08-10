import { Request, Response, NextFunction } from "express";
import { getAllIps, updateIps } from "../repository/IpRepository";
import { getAllUrls, updateUrls } from "../repository/UrlRepository";
import { getAllPorts, updatePorts } from "../repository/PortRepository";

export interface updateList {
  ids: number[];
  mode: "blacklist" | "whitelist";
  active: boolean;
}

const validateIdList = (idList: unknown): boolean => {
  console.log(idList);
  return (
    Array.isArray(idList) &&
    idList.every((id) => typeof id === "number" && !isNaN(id))
  );
};

const validateMode = (mode: unknown): boolean => {
  return (
    typeof mode === "string" &&
    (mode.toLowerCase() === "blacklist" || mode.toLowerCase() === "whitelist")
  );
};

const validateActiveStatus = (active: unknown): boolean => {
  return typeof active === "boolean";
};

const validateParameters = (updateObject: updateList): boolean => {
  if (Object.keys(updateObject).length === 0) return true;

  return (
    validateActiveStatus(updateObject.active) &&
    validateIdList(updateObject.ids) &&
    validateMode(updateObject.mode)
  );
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

    return res.status(200).json({ ips, urls, ports });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const toggleRuleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { urls, ports, ips } = req.body;

  if (urls && !validateParameters(urls)) {
    return res
      .status(400)
      .json({ error: "invalid url rule activation parameters" });
  }
  if (ips && !validateParameters(ips)) {
    return res
      .status(400)
      .json({ error: "invalid ips rule activation parameters" });
  }
  if (ports && !validateParameters(ports)) {
    return res
      .status(400)
      .json({ error: "invalid ports rule activation parameters" });
  }

  try {
    const updatedUrls = await updateUrls(urls);
    const updatedPorts = await updatePorts(ports);
    const updatedIps = await updateIps(ips);
    return res.status(200).json({
      updatedUrls,
      updatedPorts,
      updatedIps,
    });
  } catch (err) {
    console.log(err);
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
