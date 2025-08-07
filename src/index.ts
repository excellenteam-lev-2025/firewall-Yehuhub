import app from "./server";
import sequelize from "./db/DbSetup";

(async () => {
  try {
    //connect to db
    await sequelize.authenticate();

    await sequelize.sync();

    app.listen(3000, () => {
      console.log("App started on port 3000");
    });
  } catch (err) {
    console.log("unable to connect to db: ", err);
    process.exit(1);
  }
})();
