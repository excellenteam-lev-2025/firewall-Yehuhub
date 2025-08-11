import express, { Application } from "express";
import apiRouter from "./routes/api";
import sequelize from "./services/DbService";
import { config } from "./config/env";
import "./config/logger";

const app: Application = express();

app.use(express.json());

//routes
app.use("/api/firewall", apiRouter);

(async () => {
  try {
    //connect to db
    await sequelize.authenticate();

    await sequelize.sync();

    app.listen(config.env.PORT, () => {
      console.log(`App started on port ${config.env.PORT}`);
    });
  } catch (err) {
    console.log("Unable to connect to db: ", err);
    process.exit(1);
  }
})();

export default app;
