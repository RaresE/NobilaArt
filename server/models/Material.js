const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Material = sequelize.define("Material", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "pcs",
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  },
})

module.exports = Material
