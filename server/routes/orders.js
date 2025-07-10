const express = require("express")
const router = express.Router()
const { Op } = require("sequelize")
const { Order, OrderItem, Product, Cart, Material, User, ProductMaterial } = require("../models")
const { authenticate, isClient } = require("../middleware/auth")
const sequelize = require("../config/database")

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

router.get("/stats", authenticate, isClient, async (req, res) => {
  try {
    const total = await Order.count({
      where: { userId: req.user.id },
    })

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

router.post("/", authenticate, isClient, async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { items, shippingAddress, paymentMethod, deliveryMethod } = req.body

    let subtotal = 0
    let shipping = 0
    let orderStatus = 'pending'
    let needsManufacturing = false

    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        include: [{
          model: Material,
          through: ProductMaterial
        }],
        transaction
      })

      if (!product) {
        await transaction.rollback()
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` })
      }

      if (product.stock < item.quantity) {
        const canMakeFromMaterials = await Promise.all(
          product.Materials.map(async (material) => {
            const productMaterial = await ProductMaterial.findOne({
              where: {
                productId: product.id,
                materialId: material.id
              },
              transaction
            })
            const requiredQuantity = productMaterial.quantityNeeded * item.quantity
            return material.stock >= requiredQuantity
          })
        )

        if (canMakeFromMaterials.some(canMake => !canMake)) {
          await transaction.rollback()
          return res.status(400).json({ 
            message: `Not enough materials to make product: ${product.name}. Please try again later.` 
          })
        }

        orderStatus = 'processing'
        needsManufacturing = true
      }

      subtotal += product.price * item.quantity
    }

    switch (deliveryMethod) {
      case "standard":
        shipping = 10
        break
      case "express":
        shipping = 20
        break
      case "next_day":
        shipping = 30
        break
      default:
        shipping = 10
    }

    const total = subtotal + shipping

    const order = await Order.create(
      {
        userId: req.user.id,
        status: orderStatus,
        shippingAddress,
        paymentMethod,
        deliveryMethod,
        subtotal,
        shipping,
        total,
        needsManufacturing
      },
      { transaction },
    )

    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        include: [{
          model: Material,
          through: ProductMaterial
        }],
        transaction
      })

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

      if (product.stock >= item.quantity) {
        await product.update(
          {
            stock: product.stock - item.quantity,
          },
          { transaction },
        )
      } else {
        const productMaterials = await ProductMaterial.findAll({
          where: { productId: product.id },
          transaction
        });
        for (const pm of productMaterials) {
          const material = await Material.findByPk(pm.materialId, { transaction });
          if (material) {
            await material.update(
              {
                stock: material.stock - pm.quantityNeeded * item.quantity,
              },
              { transaction }
            );
          }
        }
      }
    }

    await Cart.destroy(
      {
        where: { userId: req.user.id },
      },
      { transaction },
    )

    await transaction.commit()

    let message = "Comanda a fost plasată cu succes!";
    if (order.needsManufacturing) {
      message = "Produsul nu este pe stoc, va fi realizat la comandă. Timpul de livrare va fi mai mare.";
    }
    res.status(201).json({ order, message });
  } catch (err) {
    await transaction.rollback()
    console.error("Create order error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

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

    if (order.status !== "pending" && order.status !== "processing") {
      await transaction.rollback()
      return res.status(400).json({ message: "Order cannot be cancelled" })
    }

    await order.update(
      {
        status: "cancelled",
      },
      { transaction },
    )

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
