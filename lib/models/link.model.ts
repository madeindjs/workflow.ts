// lib/models/node.model.ts
import { Model, DataTypes } from "sequelize";
import { database } from "../config/database";
// import { Node } from "./node.model";

export class Link extends Model {
  public id!: number;
  public fromId!: number;
  public toId!: number;
  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface LinkInterface {
  name: string;
  fromId: number;
  toId: number;
}

Link.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    fromId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    toId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  },
  {
    // underscored: true,
    tableName: "links",
    sequelize: database // this bit is important
  }
);

// Link.belongsTo(Node, { targetKey: "id" });

Link.sync({ force: true }).then(() => console.log("Link table created"));
