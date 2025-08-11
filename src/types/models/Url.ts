import { DataTypes, Model } from "sequelize";
import sequelize from "../../services/DbService";
import { config } from "../../config/env";

class Url extends Model {
  public id!: number;
  public value!: string;
  public mode!: string;
  public active!: boolean;
}

Url.init(
  {
    value: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    mode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [[config.constants.blacklist, config.constants.whitelist]],
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
    tableName: "url",
    timestamps: false,
  }
);

export default Url;
