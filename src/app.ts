import express, { Application } from "express";

import apiRouter from "./routes/api";
import sequelize from "./db/DbSetup";

const app: Application = express();

app.use(express.json());

//routes
app.use("/api/firewall", apiRouter);

(async () => {
  try {
    //connect to db
    await sequelize.authenticate();

    await sequelize.sync();

    app.listen(3000, () => {
      console.log("App started on port 3000");
    });
  } catch (err) {
    console.log("Unable to connect to db: ", err);
    process.exit(1);
  }
})();

export default app;
