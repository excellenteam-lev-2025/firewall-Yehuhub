import express from "express";
import { getAllRules } from "../../controllers/RulesController";

const rulesRouter = express.Router();

rulesRouter.get("/", getAllRules);

export default rulesRouter;
