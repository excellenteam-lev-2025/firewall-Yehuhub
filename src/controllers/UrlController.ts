import { Request, Response, NextFunction } from "express";
import { validateUrl } from "../utils/validators";
import {
  insertUrlList,
  doesUrlExists,
  deleteUrlList,
} from "../repository/UrlRepository";

export const validateUrlList = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { values } = req.body;

  if (!Array.isArray(values) || values.length === 0) {
    return res
      .status(400)
      .json({ error: "'values' must be a non-empty array of URLs" });
  }

  const invalidUrl = values.find((url: string) => !validateUrl(url));

  if (invalidUrl)
    return res.status(400).json({ error: "One or more URLs are invalid" });

  next();
};

export const addUrls = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { mode, values } = req.body;

  try {
    await insertUrlList(values, mode);
  } catch (err: any) {
    if (err.name === "SequelizeUniqueConstraintError") {
      console.log({ message: "UNIQUE CONSTRAINT ERROR", error: err.name });
      return res.status(400).json({
        error: "One or more URLs already exist in the db",
      });
    }
    console.log({ message: "DB ERROR", error: err });
    return res.status(500).json({
      error: "Internal server error while inserting URLs",
    });
  }

  return res
    .status(200)
    .json({ type: "url", mode: mode, values: values, status: "success" });
};

export const removeUrls = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { mode, values } = req.body;

  try {
    const urlExistsResult = await Promise.all(
      values.map(async (url: string) => ({
        url: url,
        exists: await doesUrlExists(url, mode),
      }))
    );

    const urlNotExists = urlExistsResult.find((url) => !url.exists);

    if (urlNotExists) {
      return res
        .status(400)
        .json({ error: "One or more URLs not found in the database" });
    }

    await deleteUrlList(values, mode);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Internal server error while inserting URLs",
    });
  }

  return res
    .status(200)
    .json({ type: "url", mode: mode, values: values, status: "success" });
};
