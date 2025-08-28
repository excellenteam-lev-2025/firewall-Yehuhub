import express from "express";
import {
  addPorts,
  validatePortList,
  removePorts,
} from "../../controllers/PortController";
import { validateModeMiddleware } from "../../middleware/Validation";

const portRouter = express.Router();

portRouter.post("/", validateModeMiddleware, validatePortList, addPorts);

portRouter.delete("/", validateModeMiddleware, validatePortList, removePorts);

export default portRouter;
