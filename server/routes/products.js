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
    const whereConditions = {
      isVisible: true
    }

    if (category) {
      whereConditions.categoryId = category
    }

    if (search) {
      whereConditions[Op.or] = [
        {
          name: {
            [Op.like]: `%${search}%`,
          }
        },
        {
          description: {
            [Op.like]: `%${search}%`,
          }
        }
      ]
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
      availableMaterials: product.availableMaterials,
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
      where: { featured: true, isVisible: true },
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
    const product = await Product.findOne({
      where: {
        id: req.params.id,
        isVisible: true
      },
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
    let availableMaterials = product.availableMaterials;
    if (typeof availableMaterials === 'string') {
      try {
        availableMaterials = JSON.parse(availableMaterials);
      } catch {
        availableMaterials = [];
      }
    }
    let availableColors = product.availableColors;
    if (typeof availableColors === 'string') {
      try {
        availableColors = JSON.parse(availableColors);
      } catch {
        availableColors = [];
      }
    }
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
      availableColors,
      specifications: product.specifications,
      category: product.Category ? product.Category.name : null,
      categoryId: product.categoryId,
      availableMaterials,
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
    console.log('CREATE PRODUCT req.body:', req.body);
    let {
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
      availableMaterials,
    } = req.body

    // Normalizez availableMaterials la array de id-uri
    if (!Array.isArray(availableMaterials)) {
      availableMaterials = [];
    } else if (typeof availableMaterials[0] === 'object' && availableMaterials[0] !== null) {
      availableMaterials = availableMaterials.map(m => m.value)
    }
    console.log('CREATE PRODUCT availableMaterials to save:', availableMaterials);

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
      availableMaterials,
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
    console.log('UPDATE PRODUCT req.body:', req.body);
    const product = await Product.findByPk(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    let {
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
      availableMaterials,
    } = req.body

    // Normalizez availableMaterials la array de id-uri
    if (!Array.isArray(availableMaterials)) {
      availableMaterials = [];
    } else if (typeof availableMaterials[0] === 'object' && availableMaterials[0] !== null) {
      availableMaterials = availableMaterials.map(m => m.value)
    }
    console.log('UPDATE PRODUCT availableMaterials to save:', availableMaterials);

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
      availableMaterials: availableMaterials || product.availableMaterials,
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

// Toggle product visibility (admin only)
router.put("/:id/visibility", authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    await product.update({
      isVisible: !product.isVisible
    })

    res.json({
      message: `Product ${product.isVisible ? 'made visible' : 'hidden'} successfully`,
      product
    })
  } catch (err) {
    console.error("Toggle product visibility error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
