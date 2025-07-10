const express = require("express")
const router = express.Router()
const { Cart, Product, Material, ProductMaterial } = require("../models")
const { authenticate, isClient } = require("../middleware/auth")

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

    const formattedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        let materialName = null

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

router.post("/", authenticate, isClient, async (req, res) => {
  try {
    const { productId, quantity, customizations } = req.body

    const product = await Product.findByPk(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    if (product.stock < quantity) {
      const productMaterials = await ProductMaterial.findAll({ where: { productId: product.id } });
      let canMake = true;
      for (const pm of productMaterials) {
        const material = await Material.findByPk(pm.materialId);
        if (!material || material.stock < pm.quantityNeeded * quantity) {
          canMake = false;
          break;
        }
      }
      if (!canMake) {
        return res.status(400).json({ message: "Not enough stock available and not enough materials to make the product." });
      }
      req.addToCartMessage = "Produsul nu este pe stoc, dar poate fi realizat la comandă. Va dura mai mult pentru livrare.";
    }

    if (customizations && customizations.material) {
      const material = await Material.findByPk(customizations.material)
      if (!material) {
        return res.status(404).json({ message: "Material not found" })
      }
    }

    let cartItem = await Cart.findOne({
      where: {
        userId: req.user.id,
        productId,
      },
    })

    if (cartItem) {
      await cartItem.update({
        quantity: cartItem.quantity + quantity,
        customizations: customizations || cartItem.customizations,
      })
    } else {
      cartItem = await Cart.create({
        userId: req.user.id,
        productId,
        quantity,
        customizations,
      })
    }

    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "imageUrl"],
        },
      ],
    })

    const formattedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        let materialName = null

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

    if (req.addToCartMessage) {
      return res.json({
        success: true,
        message: req.addToCartMessage,
        cart: formattedCartItems
      });
    }
    res.json(formattedCartItems)
  } catch (err) {
    console.error("Add to cart error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/:id", authenticate, isClient, async (req, res) => {
  try {
    const { quantity } = req.body

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

    if (cartItem.Product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" })
    }

    await cartItem.update({ quantity })

    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "imageUrl"],
        },
      ],
    })

    const formattedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        let materialName = null

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

router.delete("/:id", authenticate, isClient, async (req, res) => {
  try {
    const cartItem = await Cart.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    })

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" })
    }

    await cartItem.destroy()

    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "imageUrl"],
        },
      ],
    })

    const formattedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        let materialName = null

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

router.delete("/", authenticate, isClient, async (req, res) => {
  try {
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
