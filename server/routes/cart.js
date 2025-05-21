const express = require("express")
const router = express.Router()
const { Cart, Product, Material } = require("../models")
const { authenticate, isClient } = require("../middleware/auth")

// Get user's cart
router.get("/", authenticate, isClient, async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "imageUrl"],
        },
      ],
    })

    // Format cart items
    const formattedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        let materialName = null

        // If item has material customization, get material name
        if (item.customizations && item.customizations.material) {
          const material = await Material.findByPk(item.customizations.material)
          if (material) {
            materialName = material.name
          }
        }

        return {
          id: item.id,
          product: {
            id: item.Product.id,
            name: item.Product.name,
            price: Number.parseFloat(item.Product.price),
            imageUrl: item.Product.imageUrl,
          },
          quantity: item.quantity,
          customizations: {
            ...item.customizations,
            materialName,
          },
        }
      }),
    )

    res.json(formattedCartItems)
  } catch (err) {
    console.error("Get cart error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Add item to cart
router.post("/", authenticate, isClient, async (req, res) => {
  try {
    const { productId, quantity, customizations } = req.body

    // Check if product exists
    const product = await Product.findByPk(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" })
    }

    // Check if material exists if specified
    if (customizations && customizations.material) {
      const material = await Material.findByPk(customizations.material)
      if (!material) {
        return res.status(404).json({ message: "Material not found" })
      }
    }

    // Check if item already exists in cart
    let cartItem = await Cart.findOne({
      where: {
        userId: req.user.id,
        productId,
      },
    })

    if (cartItem) {
      // Update quantity
      await cartItem.update({
        quantity: cartItem.quantity + quantity,
        customizations: customizations || cartItem.customizations,
      })
    } else {
      // Create new cart item
      cartItem = await Cart.create({
        userId: req.user.id,
        productId,
        quantity,
        customizations,
      })
    }

    // Get updated cart
    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "imageUrl"],
        },
      ],
    })

    // Format cart items
    const formattedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        let materialName = null

        // If item has material customization, get material name
        if (item.customizations && item.customizations.material) {
          const material = await Material.findByPk(item.customizations.material)
          if (material) {
            materialName = material.name
          }
        }

        return {
          id: item.id,
          product: {
            id: item.Product.id,
            name: item.Product.name,
            price: Number.parseFloat(item.Product.price),
            imageUrl: item.Product.imageUrl,
          },
          quantity: item.quantity,
          customizations: {
            ...item.customizations,
            materialName,
          },
        }
      }),
    )

    res.json(formattedCartItems)
  } catch (err) {
    console.error("Add to cart error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Update cart item
router.put("/:id", authenticate, isClient, async (req, res) => {
  try {
    const { quantity } = req.body

    // Find cart item
    const cartItem = await Cart.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "stock"],
        },
      ],
    })

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" })
    }

    // Check if product is in stock
    if (cartItem.Product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" })
    }

    // Update quantity
    await cartItem.update({ quantity })

    // Get updated cart
    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "imageUrl"],
        },
      ],
    })

    // Format cart items
    const formattedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        let materialName = null

        // If item has material customization, get material name
        if (item.customizations && item.customizations.material) {
          const material = await Material.findByPk(item.customizations.material)
          if (material) {
            materialName = material.name
          }
        }

        return {
          id: item.id,
          product: {
            id: item.Product.id,
            name: item.Product.name,
            price: Number.parseFloat(item.Product.price),
            imageUrl: item.Product.imageUrl,
          },
          quantity: item.quantity,
          customizations: {
            ...item.customizations,
            materialName,
          },
        }
      }),
    )

    res.json(formattedCartItems)
  } catch (err) {
    console.error("Update cart item error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Remove item from cart
router.delete("/:id", authenticate, isClient, async (req, res) => {
  try {
    // Find cart item
    const cartItem = await Cart.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    })

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" })
    }

    // Delete cart item
    await cartItem.destroy()

    // Get updated cart
    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "imageUrl"],
        },
      ],
    })

    // Format cart items
    const formattedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        let materialName = null

        // If item has material customization, get material name
        if (item.customizations && item.customizations.material) {
          const material = await Material.findByPk(item.customizations.material)
          if (material) {
            materialName = material.name
          }
        }

        return {
          id: item.id,
          product: {
            id: item.Product.id,
            name: item.Product.name,
            price: Number.parseFloat(item.Product.price),
            imageUrl: item.Product.imageUrl,
          },
          quantity: item.quantity,
          customizations: {
            ...item.customizations,
            materialName,
          },
        }
      }),
    )

    res.json(formattedCartItems)
  } catch (err) {
    console.error("Remove from cart error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Clear cart
router.delete("/", authenticate, isClient, async (req, res) => {
  try {
    // Delete all cart items for user
    await Cart.destroy({
      where: { userId: req.user.id },
    })

    res.json([])
  } catch (err) {
    console.error("Clear cart error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
