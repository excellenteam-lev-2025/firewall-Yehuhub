import { DataTypes, Model } from "sequelize";
import sequelize from "../db/DbSetup";

class Port extends Model {
  public id!: number;
  public value!: number;
  public mode!: string;
  public active!: boolean;
}

Port.init(
  {
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    mode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [["blacklist", "whitelist"]],
          msg: "'mode' must be either 'blacklist' or 'whitelist'",
        },
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "port",
    timestamps: false,
  }
);

export default Port;
