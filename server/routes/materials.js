const express = require("express")
const router = express.Router()
const { Op } = require("sequelize")
const { Material } = require("../models")
const { authenticate, isAdmin } = require("../middleware/auth")

router.get("/", async (req, res) => {
  try {
    const materials = await Material.findAll()
    res.json(materials)
  } catch (err) {
    console.error("Get materials error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id)

    if (!material) {
      return res.status(404).json({ message: "Material not found" })
    }

    res.json(material)
  } catch (err) {
    console.error("Get material error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/", authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, stock, unit, lowStockThreshold } = req.body

    // Check if material already exists
    const existingMaterial = await Material.findOne({ where: { name } })
    if (existingMaterial) {
      return res.status(400).json({ message: "Material already exists" })
    }

    // Create material
    const material = await Material.create({
      name,
      description,
      stock: stock || 0,
      unit: unit || "pcs",
      lowStockThreshold: lowStockThreshold || 10,
    })

    res.status(201).json(material)
  } catch (err) {
    console.error("Create material error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id)

    if (!material) {
      return res.status(404).json({ message: "Material not found" })
    }

    const { name, description, stock, unit, lowStockThreshold } = req.body

    // Check if name is being changed and if it's already in use
    if (name && name !== material.name) {
      const existingMaterial = await Material.findOne({ where: { name } })
      if (existingMaterial) {
        return res.status(400).json({ message: "Material name already in use" })
      }
    }

    // Update material
    await material.update({
      name: name || material.name,
      description: description || material.description,
      stock: stock !== undefined ? stock : material.stock,
      unit: unit || material.unit,
      lowStockThreshold: lowStockThreshold || material.lowStockThreshold,
    })

    res.json(material)
  } catch (err) {
    console.error("Update material error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id)

    if (!material) {
      return res.status(404).json({ message: "Material not found" })
    }

    await material.destroy()

    res.json({ message: "Material deleted successfully" })
  } catch (err) {
    console.error("Delete material error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
