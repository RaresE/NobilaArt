const express = require("express")
const router = express.Router()
const { Op } = require("sequelize")
const { User, Product, Category, Material, Order, OrderItem } = require("../models")
const { authenticate, isAdmin } = require("../middleware/auth")
const sequelize = require("../config/database")

// Admin dashboard statistics
router.get("/dashboard/stats", authenticate, isAdmin, async (req, res) => {
  try {
    // Get total orders
    const totalOrders = await Order.count()

    // Get total revenue
    const ordersForRevenue = await Order.findAll({
      where: {
        status: {
          [Op.ne]: "cancelled",
        },
      },
    });
    console.log('Comenzi incluse în total revenue:', ordersForRevenue.map(o => o.total));
    const revenueResult = await Order.findOne({
      attributes: [[sequelize.fn("SUM", sequelize.col("total")), "totalRevenue"]],
      where: {
        status: {
          [Op.ne]: "cancelled",
        },
      },
    })
    const totalRevenue = revenueResult.getDataValue("totalRevenue") || 0

    // Get pending orders
    const pendingOrders = await Order.count({
      where: {
        status: "pending",
      },
    })

    // Get low stock items
    const lowStockItems = await Product.count({
      where: {
        stock: {
          [Op.lte]: 10,
        },
      },
    })

    // Get total products
    const totalProducts = await Product.count()

    res.json({
      totalOrders,
      totalRevenue: Number.parseFloat(totalRevenue),
      pendingOrders,
      lowStockItems,
      totalProducts,
    })
  } catch (err) {
    console.error("Get admin dashboard stats error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all orders for admin
router.get("/orders", authenticate, isAdmin, async (req, res) => {
  try {
    const { status, startDate, endDate, search, page = 1, limit = 10 } = req.query

    // Build filter conditions
    const whereConditions = {}

    if (status) {
      whereConditions.status = status
    }

    if (startDate) {
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        [Op.gte]: new Date(startDate),
      }
    }

    if (endDate) {
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        [Op.lte]: new Date(endDate),
      }
    }

    // Search logic
    let userInclude = {
      model: User,
      attributes: ["id", "name", "email"],
    };
    if (search) {
      if (!isNaN(Number(search))) {
        // Search by order ID
        whereConditions.id = Number(search);
      } else {
        // Search by customer name or email
        userInclude.where = {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        };
      }
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Get orders
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereConditions,
      include: [
        userInclude,
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
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    })

    // Calculate total pages
    const totalPages = Math.ceil(count / limit)

    // Format orders
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      status: order.status,
      user: {
        id: order.User.id,
        name: order.User.name,
        email: order.User.email,
      },
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
      })),
    }))

    res.json({
      orders: formattedOrders,
      total: count,
      totalPages,
      currentPage: Number.parseInt(page),
    })
  } catch (err) {
    console.error("Get admin orders error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get order by ID for admin
router.get("/orders/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "phone", "address"],
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["id", "name", "imageUrl", "price"],
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
      user: {
        id: order.User.id,
        name: order.User.name,
        email: order.User.email,
        phone: order.User.phone,
        address: order.User.address,
      },
      shippingAddress: order.shippingAddress,
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
          price: Number.parseFloat(item.Product.price),
        },
        quantity: item.quantity,
        price: Number.parseFloat(item.price),
        customizations: item.customizations,
      })),
    }

    res.json(formattedOrder)
  } catch (err) {
    console.error("Get admin order error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Update order status
router.put("/orders/:id/status", authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.body

    // Validate status
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const order = await Order.findByPk(req.params.id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Update order status
    await order.update({ status })

    res.json({ message: "Order status updated successfully" })
  } catch (err) {
    console.error("Update order status error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all products for admin
router.get("/products", authenticate, isAdmin, async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sortBy = "name", sortOrder = "asc", page = 1, limit = 10 } = req.query

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
      availableMaterials: product.availableMaterials,
    }))

    res.json({
      products: formattedProducts,
      total: count,
      totalPages,
      currentPage: Number.parseInt(page),
    })
  } catch (err) {
    console.error("Get admin products error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Bulk delete products
router.post("/products/bulk-delete", authenticate, isAdmin, async (req, res) => {
  try {
    const { productIds } = req.body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "No products selected" })
    }

    // Delete products
    await Product.destroy({
      where: {
        id: {
          [Op.in]: productIds,
        },
      },
    })

    res.json({ message: "Products deleted successfully" })
  } catch (err) {
    console.error("Bulk delete products error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all materials for admin
router.get("/materials", authenticate, isAdmin, async (req, res) => {
  try {
    const { search, sortBy = "name", sortOrder = "asc", lowStock, outOfStock } = req.query

    // Build filter conditions
    const whereConditions = {}

    if (search) {
      whereConditions.name = {
        [Op.like]: `%${search}%`,
      }
    }

    if (lowStock === "true") {
      whereConditions[Op.and] = sequelize.literal("stock <= lowStockThreshold AND stock > 0")
    }

    if (outOfStock === "true") {
      whereConditions.stock = 0
    }

    // Get materials
    const materials = await Material.findAll({
      where: whereConditions,
      order: [[sortBy, sortOrder]],
    })

    res.json(materials)
  } catch (err) {
    console.error("Get admin materials error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get users for admin
router.get("/users", authenticate, isAdmin, async (req, res) => {
  try {
    const { search, role, sortBy = "name", sortOrder = "asc", page = 1, limit = 10 } = req.query

    // Build filter conditions
    const whereConditions = {}

    if (role) {
      whereConditions.role = role
    }

    if (search) {
      whereConditions[Op.or] = [
        {
          name: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          email: {
            [Op.like]: `%${search}%`,
          },
        },
      ]
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Get users
    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      attributes: { exclude: ["password"] },
      order: [[sortBy, sortOrder]],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    })

    // Calculate total pages
    const totalPages = Math.ceil(count / limit)

    res.json({
      users,
      total: count,
      totalPages,
      currentPage: Number.parseInt(page),
    })
  } catch (err) {
    console.error("Get admin users error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Create admin user
router.post("/users", authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "client",
    })

    // Return user data (without password)
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } catch (err) {
    console.error("Create admin user error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Update product by ID
router.put("/products/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await product.update(updateData);
    res.json(product);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update material by ID
router.put("/materials/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    await material.update(updateData);
    res.json(material);
  } catch (err) {
    console.error("Update material error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new product
router.post("/products", authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get product by ID for admin
router.get("/products/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.json(product)
  } catch (err) {
    console.error("Get admin product by id error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
