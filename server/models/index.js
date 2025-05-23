const User = require("./User")
const Category = require("./Category")
const Product = require("./Product")
const Material = require("./Material")
const Cart = require("./Cart")
const Order = require("./Order")
const OrderItem = require("./OrderItem")
const Team = require("./Team")

// Define relationships
Category.hasMany(Product, { foreignKey: 'categoryId' })
Product.belongsTo(Category, { foreignKey: 'categoryId' })

User.hasMany(Cart, { foreignKey: 'userId' })
Cart.belongsTo(User, { foreignKey: 'userId' })

Product.hasMany(Cart, { foreignKey: 'productId' })
Cart.belongsTo(Product, { foreignKey: 'productId' })

User.hasMany(Order, { foreignKey: 'userId' })
Order.belongsTo(User, { foreignKey: 'userId' })

Order.hasMany(OrderItem, { foreignKey: 'orderId' })
OrderItem.belongsTo(Order, { foreignKey: 'orderId' })

Product.hasMany(OrderItem, { foreignKey: 'productId' })
OrderItem.belongsTo(Product, { foreignKey: 'productId' })

// Export models
const db = {
  User,
  Category,
  Product,
  Material,
  Cart,
  Order,
  OrderItem,
  Team,
}

Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db)
  }
})

module.exports = db
