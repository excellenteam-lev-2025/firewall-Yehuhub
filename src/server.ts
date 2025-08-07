import express, { Application } from "express";

import apiRouter from "./routes/api";

const app: Application = express();

//
app.use(express.json());

//routes
app.use("/api/firewall", apiRouter);

export default app;
