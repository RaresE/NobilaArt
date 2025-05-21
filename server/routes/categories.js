const express = require("express")
const router = express.Router()
const { Category } = require("../models")
const { authenticate, isAdmin } = require("../middleware/auth")

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll()
    res.json(categories)
  } catch (err) {
    console.error("Get categories error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id)

    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json(category)
  } catch (err) {
    console.error("Get category error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new category (admin only)
router.post("/", authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body

    // Check if category already exists
    const existingCategory = await Category.findOne({ where: { name } })
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" })
    }

    // Create category
    const category = await Category.create({
      name,
      description,
      imageUrl,
    })

    res.status(201).json(category)
  } catch (err) {
    console.error("Create category error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Update a category (admin only)
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id)

    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    const { name, description, imageUrl } = req.body

    // Check if name is being changed and if it's already in use
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } })
      if (existingCategory) {
        return res.status(400).json({ message: "Category name already in use" })
      }
    }

    // Update category
    await category.update({
      name: name || category.name,
      description: description || category.description,
      imageUrl: imageUrl || category.imageUrl,
    })

    res.json(category)
  } catch (err) {
    console.error("Update category error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a category (admin only)
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id)

    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    await category.destroy()

    res.json({ message: "Category deleted successfully" })
  } catch (err) {
    console.error("Delete category error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
