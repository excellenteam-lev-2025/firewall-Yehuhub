import express from "express";
import {
  getAllRules,
  toggleRuleStatus,
  validateUpdateObject,
} from "../../controllers/RulesController";

const rulesRouter = express.Router();

rulesRouter.get("/", getAllRules);
rulesRouter.patch("/", validateUpdateObject, toggleRuleStatus);

export default rulesRouter;
