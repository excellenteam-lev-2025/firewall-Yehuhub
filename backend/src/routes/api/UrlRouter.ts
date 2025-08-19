import express from "express";
import { validateModeMiddleware } from "../../middleware/Validation";
import {
  validateUrlList,
  addUrls,
  removeUrls,
} from "../../controllers/UrlController";

const urlRouter = express.Router();

urlRouter.post("/", validateModeMiddleware, validateUrlList, addUrls);

urlRouter.delete("/", validateModeMiddleware, validateUrlList, removeUrls);

export default urlRouter;
