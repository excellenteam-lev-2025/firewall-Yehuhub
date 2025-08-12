import express from "express";
import { getAllRules } from "../../controllers/RulesController";

const rulesRouter = express.Router();

rulesRouter.get("/", getAllRules);
// rulesRouter.patch("/", toggleRuleStatus);

export default rulesRouter;
