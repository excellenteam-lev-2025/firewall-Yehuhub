import { Sequelize } from "sequelize";
import { config } from "../config/env";

const sequelize = new Sequelize(config.env.DATABASE_URL, {
  dialect: "postgres",
});

export default sequelize;
