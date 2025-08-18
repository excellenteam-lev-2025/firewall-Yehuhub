import { Request, Response, NextFunction } from "express";
import {
  insertUrlList,
  deleteUrlList,
  getAllExistingUrls,
} from "../repository/UrlRepository";
import { StatusCodes } from "http-status-codes";
import { UrlListInput, urlListSchema } from "../schemas/UrlSchema";

export const validateUrlList = (
  req: Request<{}, {}, UrlListInput>,
  res: Response,
  next: NextFunction
): void | Response => {
  try {
    urlListSchema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

export const addUrls = async (
  req: Request<{}, {}, UrlListInput>,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { mode, values } = req.body;
  try {
    await insertUrlList({ mode, values });
  } catch (err) {
    next(err);
  }

  return res
    .status(StatusCodes.OK)
    .json({ type: "url", mode: mode, values: values, status: "success" });
};

export const removeUrls = async (
  req: Request<{}, {}, UrlListInput>,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { mode, values } = req.body;

  try {
    const allExistingUrls = await getAllExistingUrls({ mode, values });
    const existingUrls = allExistingUrls.map((url) => url.value);
    const urlsNotExisting = values.filter((url) => !existingUrls.includes(url));
    if (urlsNotExisting.length > 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "One or more URLs not found in the database" });
    }

    await deleteUrlList({ values, mode });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error while removing URLs",
    });
  }

  return res
    .status(StatusCodes.OK)
    .json({ type: "url", mode: mode, values: values, status: "success" });
};
