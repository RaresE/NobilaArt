const User = require("./User")
const Category = require("./Category")
const Product = require("./Product")
const Material = require("./Material")
const Cart = require("./Cart")
const Order = require("./Order")
const OrderItem = require("./OrderItem")

// Define relationships
Category.hasMany(Product, { foreignKey: 'categoryId' })
Product.belongsTo(Category, { foreignKey: 'categoryId' })

User.hasMany(Cart)
Cart.belongsTo(User)

Product.hasMany(Cart)
Cart.belongsTo(Product)

User.hasMany(Order)
Order.belongsTo(User)

Order.hasMany(OrderItem)
OrderItem.belongsTo(Order)

Product.hasMany(OrderItem)
OrderItem.belongsTo(Product)

// Export models
module.exports = {
  User,
  Category,
  Product,
  Material,
  Cart,
  Order,
  OrderItem,
}
