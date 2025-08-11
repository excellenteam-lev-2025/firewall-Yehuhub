const dbURL = "postgres://admin:Aa123456@localhost:5432/firewalldb"; //this needs to be in a .env file
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(dbURL, { dialect: "postgres" });

export default sequelize;
