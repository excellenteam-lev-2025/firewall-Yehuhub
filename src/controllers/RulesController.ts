import { Request, Response, NextFunction } from "express";
import { getAllIps } from "../repository/IpRepository";
import { getAllUrls } from "../repository/UrlRepository";
import { getAllPorts } from "../repository/PortRepository";
// import { updateList } from "../types/interfaces/UpdateList";
import { config } from "../config/env";
import { StatusCodes } from "http-status-codes";

// const validateIdList = (idList: unknown): boolean => {
//   console.log(idList);
//   return (
//     Array.isArray(idList) &&
//     idList.every((id) => typeof id === "number" && !isNaN(id))
//   );
// };

// const validateMode = (mode: unknown): boolean => {
//   return (
//     typeof mode === "string" &&
//     (mode.toLowerCase() === config.constants.blacklist ||
//       mode.toLowerCase() === config.constants.whitelist)
//   );
// };

// const validateActiveStatus = (active: unknown): boolean => {
//   return typeof active === "boolean";
// };

// const validateParameters = (updateObject: updateList): boolean => {
//   if (Object.keys(updateObject).length === 0) return true;

//   return (
//     validateActiveStatus(updateObject.active) &&
//     validateIdList(updateObject.ids) &&
//     validateMode(updateObject.mode)
//   );
// };

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

// export const toggleRuleStatus = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { urls, ports, ips } = req.body;

//   if (urls && !validateParameters(urls)) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ error: "invalid url rule activation parameters" });
//   }
//   if (ips && !validateParameters(ips)) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ error: "invalid ips rule activation parameters" });
//   }
//   if (ports && !validateParameters(ports)) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ error: "invalid ports rule activation parameters" });
//   }

//   try {
//     const updatedUrls = await updateUrls(urls);
//     const updatedPorts = await updatePorts(ports);
//     const updatedIps = await updateIps(ips);
//     return res.status(StatusCodes.OK).json({
//       updatedUrls,
//       updatedPorts,
//       updatedIps,
//     });
//   } catch (err) {
//     console.log(err);
//     if (err instanceof Error) {
//       res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
//     }
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ error: "Internal Server Error" });
//   }
// };
