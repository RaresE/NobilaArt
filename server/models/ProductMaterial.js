const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const ProductMaterial = sequelize.define("ProductMaterial", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  materialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Materials',
      key: 'id'
    }
  },
  quantityNeeded: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
})

module.exports = ProductMaterial 