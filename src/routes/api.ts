import express from "express";
import ipRouter from "./api/IpRouter";
import urlRouter from "./api/UrlRouter";

const apiRouter = express.Router();

apiRouter.use("/ip", ipRouter);
apiRouter.use("/url", urlRouter);

export default apiRouter;
