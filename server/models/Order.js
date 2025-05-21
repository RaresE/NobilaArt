const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.ENUM("pending", "processing", "shipped", "delivered", "cancelled"),
    defaultValue: "pending",
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
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  shipping: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
})

module.exports = Order
