const express = require("express")
const router = express.Router()
const { Op } = require("sequelize")
const { Order, OrderItem, Product, Cart, Material, User } = require("../models")
const { authenticate, isClient } = require("../middleware/auth")
const sequelize = require("../config/database")

// Get user's orders
router.get("/", authenticate, isClient, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["id", "name", "imageUrl"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    // Format orders
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      status: order.status,
      shippingAddress: typeof order.shippingAddress === 'string'
        ? (order.shippingAddress ? JSON.parse(order.shippingAddress) : {})
        : (order.shippingAddress || {}),
      paymentMethod: order.paymentMethod,
      deliveryMethod: order.deliveryMethod,
      subtotal: Number.parseFloat(order.subtotal),
      shipping: Number.parseFloat(order.shipping),
      total: Number.parseFloat(order.total),
      createdAt: order.createdAt,
      items: order.OrderItems.map((item) => ({
        id: item.id,
        product: {
          id: item.Product.id,
          name: item.Product.name,
          imageUrl: item.Product.imageUrl,
        },
        quantity: item.quantity,
        price: Number.parseFloat(item.price),
        customizations: item.customizations,
      })),
    }))

    res.json(formattedOrders)
  } catch (err) {
    console.error("Get orders error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get order statistics
router.get("/stats", authenticate, isClient, async (req, res) => {
  try {
    // Get total orders
    const total = await Order.count({
      where: { userId: req.user.id },
    })

    // Get orders by status
    const pending = await Order.count({
      where: {
        userId: req.user.id,
        status: "pending",
      },
    })

    const processing = await Order.count({
      where: {
        userId: req.user.id,
        status: "processing",
      },
    })

    const shipped = await Order.count({
      where: {
        userId: req.user.id,
        status: "shipped",
      },
    })

    const delivered = await Order.count({
      where: {
        userId: req.user.id,
        status: "delivered",
      },
    })

    res.json({
      total,
      pending,
      processing,
      shipped,
      delivered,
    })
  } catch (err) {
    console.error("Get order stats error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get order by ID
router.get("/:id", authenticate, isClient, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["id", "name", "imageUrl"],
            },
          ],
        },
      ],
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Format order
    const formattedOrder = {
      id: order.id,
      status: order.status,
      shippingAddress: typeof order.shippingAddress === 'string'
        ? (order.shippingAddress ? JSON.parse(order.shippingAddress) : {})
        : (order.shippingAddress || {}),
      paymentMethod: order.paymentMethod,
      deliveryMethod: order.deliveryMethod,
      subtotal: Number.parseFloat(order.subtotal),
      shipping: Number.parseFloat(order.shipping),
      total: Number.parseFloat(order.total),
      createdAt: order.createdAt,
      items: order.OrderItems.map((item) => ({
        id: item.id,
        product: {
          id: item.Product.id,
          name: item.Product.name,
          imageUrl: item.Product.imageUrl,
        },
        quantity: item.quantity,
        price: Number.parseFloat(item.price),
        customizations: item.customizations,
      })),
    }

    res.json(formattedOrder)
  } catch (err) {
    console.error("Get order error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new order
router.post("/", authenticate, isClient, async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { items, shippingAddress, paymentMethod, deliveryMethod, subtotal, shipping, total } = req.body

    // Check if cart is empty
    if (!items || items.length === 0) {
      await transaction.rollback()
      return res.status(400).json({ message: "Cart is empty" })
    }

    // Create order
    console.log('shippingAddress primit la backend:', shippingAddress)
    const order = await Order.create(
      {
        userId: req.user.id,
        shippingAddress,
        paymentMethod,
        deliveryMethod,
        subtotal,
        shipping,
        total,
        status: "pending",
      },
      { transaction },
    )

    // Create order items
    for (const item of items) {
      // Get product
      const product = await Product.findByPk(item.productId, { transaction })

      if (!product) {
        await transaction.rollback()
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` })
      }

      // Check if product is in stock
      if (product.stock < item.quantity) {
        await transaction.rollback()
        return res.status(400).json({ message: `Not enough stock for product: ${product.name}` })
      }

      // Create order item
      await OrderItem.create(
        {
          orderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          customizations: item.customizations,
        },
        { transaction },
      )

      // Update product stock
      await product.update(
        {
          stock: product.stock - item.quantity,
        },
        { transaction },
      )
    }

    // Clear user's cart
    await Cart.destroy(
      {
        where: { userId: req.user.id },
      },
      { transaction },
    )

    await transaction.commit()

    res.status(201).json(order)
  } catch (err) {
    await transaction.rollback()
    console.error("Create order error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Cancel an order
router.put("/:id/cancel", authenticate, isClient, async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const order = await Order.findOne(
      {
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
        include: [
          {
            model: OrderItem,
            include: [
              {
                model: Product,
              },
            ],
          },
        ],
      },
      { transaction },
    )

    if (!order) {
      await transaction.rollback()
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if order can be cancelled
    if (order.status !== "pending" && order.status !== "processing") {
      await transaction.rollback()
      return res.status(400).json({ message: "Order cannot be cancelled" })
    }

    // Update order status
    await order.update(
      {
        status: "cancelled",
      },
      { transaction },
    )

    // Restore product stock
    for (const item of order.OrderItems) {
      await item.Product.update(
        {
          stock: item.Product.stock + item.quantity,
        },
        { transaction },
      )
    }

    await transaction.commit()

    res.json({ message: "Order cancelled successfully" })
  } catch (err) {
    await transaction.rollback()
    console.error("Cancel order error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
