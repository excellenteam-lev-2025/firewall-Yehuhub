import express from "express";
import ipRouter from "./api/IpRouter";
import urlRouter from "./api/UrlRouter";
import portRouter from "./api/PortRouter";
import rulesRouter from "./api/RulesRouter";

const apiRouter = express.Router();

apiRouter.use("/ip", ipRouter);
apiRouter.use("/url", urlRouter);
apiRouter.use("/port", portRouter);
apiRouter.use("/rules", rulesRouter);

export default apiRouter;
