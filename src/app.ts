import express, { Application } from "express";
import apiRouter from "./routes/api";
import { db } from "./services/DbService";
import { config } from "./config/env";
import "./config/logger";
import { errorHandler } from "./middleware/ErrorHandler";

const app: Application = express();

app.use(express.json());

//routes
app.use("/api/firewall", apiRouter);

(async () => {
  try {
    app.listen(config.env.PORT, () => {
      console.log(`App started on port ${config.env.PORT}`);
    });
  } catch (err) {
    console.log("Unable to connect to db: ", err);
    process.exit(1);
  }
})();

// error handler
app.use(errorHandler);

export default app;
