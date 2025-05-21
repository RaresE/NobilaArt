const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deliveryMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  shipping: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
})

module.exports = Order
