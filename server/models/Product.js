const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dimensions: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isVisible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  availableColors: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  availableMaterials: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  specifications: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
})

module.exports = Product
