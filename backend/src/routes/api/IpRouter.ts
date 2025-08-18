import express from "express";
import {
  addIp,
  validateIpList,
  removeIp,
} from "../../controllers/IpController";
import { validateModeMiddleware } from "../../middleware/Validation";

const ipRouter = express.Router();

ipRouter.post("/", validateModeMiddleware, validateIpList, addIp);

ipRouter.delete("/", validateModeMiddleware, validateIpList, removeIp);

export default ipRouter;
