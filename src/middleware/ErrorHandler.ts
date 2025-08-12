import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { z, ZodError } from "zod";

export const errorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  console.error("Unexpected error: ", err);
  if (err instanceof ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: "Internal server error.",
  });
};
