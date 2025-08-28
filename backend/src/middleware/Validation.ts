import { Request, Response, NextFunction } from "express";
import { validateMode } from "../utils/validators";

export const validateModeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { mode } = req.body;

  if (typeof mode !== "string" || !validateMode(mode?.trim())) {
    return res
      .status(400)
      .json({ error: "'mode' must be a blacklist or whitelist" });
  }
  req.body.mode = mode.toLowerCase().trim();
  next();
};
