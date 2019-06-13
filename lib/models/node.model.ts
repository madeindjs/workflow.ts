import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';
import { database } from '../config/database';



export class Node extends Model {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public name!: string;
  
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}
  
const sequelize = new Sequelize({
    database: 'some_db',
    dialect: 'sqlite',
    username: 'root',
    password: '',
    storage: ':memory:',
});

Node.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
    },
    {
        tableName: 'users',
        sequelize: database, // this bit is important
    }
);

Node.sync({force: true}).then(() => console.log("Node table created"))
