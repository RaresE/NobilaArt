const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Cart = sequelize.define("Cart", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  customizations: {
    type: DataTypes.JSON,
    allowNull: true,
  },
})

module.exports = Cart
