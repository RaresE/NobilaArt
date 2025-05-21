const express = require("express")
const router = express.Router()
const { Op } = require("sequelize")
const { Product, Category } = require("../models")
const { authenticate, isAdmin } = require("../middleware/auth")

// Get all products with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sortBy = "name", sortOrder = "asc", page = 1, limit = 12 } = req.query

    // Build filter conditions
    const whereConditions = {}

    if (category) {
      whereConditions.categoryId = category
    }

    if (search) {
      whereConditions.name = {
        [Op.like]: `%${search}%`,
      }
    }

    if (minPrice) {
      whereConditions.price = {
        ...whereConditions.price,
        [Op.gte]: minPrice,
      }
    }

    if (maxPrice) {
      whereConditions.price = {
        ...whereConditions.price,
        [Op.lte]: maxPrice,
      }
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Get products
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    })

    // Calculate total pages
    const totalPages = Math.ceil(count / limit)

    // Format response
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number.parseFloat(product.price),
      stock: product.stock,
      imageUrl: product.imageUrl,
      dimensions: product.dimensions,
      weight: product.weight,
      featured: product.featured,
      availableColors: product.availableColors,
      specifications: product.specifications,
      category: product.Category ? product.Category.name : null,
      categoryId: product.categoryId,
    }))

    res.json({
      products: formattedProducts,
      total: count,
      totalPages,
      currentPage: Number.parseInt(page),
    })
  } catch (err) {
    console.error("Get products error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get featured products
router.get("/featured", async (req, res) => {
  try {
    const featuredProducts = await Product.findAll({
      where: { featured: true },
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
      limit: 8,
    })

    // Format response
    const formattedProducts = featuredProducts.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number.parseFloat(product.price),
      imageUrl: product.imageUrl,
      category: product.Category ? product.Category.name : null,
    }))

    res.json(formattedProducts)
  } catch (err) {
    console.error("Get featured products error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
    })

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Format response
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number.parseFloat(product.price),
      stock: product.stock,
      imageUrl: product.imageUrl,
      dimensions: product.dimensions,
      weight: product.weight,
      featured: product.featured,
      availableColors: product.availableColors,
      specifications: product.specifications,
      category: product.Category ? product.Category.name : null,
      categoryId: product.categoryId,
    }

    res.json(formattedProduct)
  } catch (err) {
    console.error("Get product error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new product (admin only)
router.post("/", authenticate, isAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      categoryId,
      imageUrl,
      dimensions,
      weight,
      featured,
      availableColors,
      specifications,
    } = req.body

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      categoryId,
      imageUrl,
      dimensions,
      weight,
      featured: featured || false,
      availableColors,
      specifications,
    })

    res.status(201).json(product)
  } catch (err) {
    console.error("Create product error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Update a product (admin only)
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const {
      name,
      description,
      price,
      stock,
      categoryId,
      imageUrl,
      dimensions,
      weight,
      featured,
      availableColors,
      specifications,
    } = req.body

    // Update product
    await product.update({
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      stock: stock !== undefined ? stock : product.stock,
      categoryId: categoryId || product.categoryId,
      imageUrl: imageUrl || product.imageUrl,
      dimensions: dimensions || product.dimensions,
      weight: weight || product.weight,
      featured: featured !== undefined ? featured : product.featured,
      availableColors: availableColors || product.availableColors,
      specifications: specifications || product.specifications,
    })

    res.json(product)
  } catch (err) {
    console.error("Update product error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a product (admin only)
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    await product.destroy()

    res.json({ message: "Product deleted successfully" })
  } catch (err) {
    console.error("Delete product error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
