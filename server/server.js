const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
const path = require("path")

// Load environment variables
dotenv.config()

// Import database connection
const dbConnection = require("./config/database")
const db = require("./models")

const authRoutes = require("./routes/auth")
const productRoutes = require("./routes/products")
const categoryRoutes = require("./routes/categories")
const materialRoutes = require("./routes/materials")
const cartRoutes = require("./routes/cart")
const orderRoutes = require("./routes/orders")
const adminRoutes = require("./routes/admin")

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/materials", materialRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/admin", adminRoutes)

// Test database connection
dbConnection.authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.")

    // Sync database models FĂRĂ force:true
    return dbConnection.sync()
  })
  .then(async () => {
    console.log("Database models synchronized successfully.")
    // SEED LOGIC
    // 1. Admin user
    const admin = await db.User.findOne({ where: { email: 'admin@mobilux.com' } });
    if (!admin) {
      await db.User.create({
        name: 'Admin User',
        email: 'admin@mobilux.com',
        password: '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', // hash pentru 'password123'
        role: 'admin',
        address: 'Strada Admin 1',
        phone: '0700000000'
      });
    }

    // 2. Categorii
    // const categories = [
    //   { name: 'Living Room', description: 'Furniture for your living room', imageUrl: 'https://via.placeholder.com/300x300?text=Living+Room' },
    //   { name: 'Bedroom', description: 'Comfortable bedroom furniture', imageUrl: 'https://via.placeholder.com/300x300?text=Bedroom' },
    //   { name: 'Dining Room', description: 'Elegant dining room sets', imageUrl: 'https://via.placeholder.com/300x300?text=Dining+Room' },
    //   { name: 'Office', description: 'Professional office furniture', imageUrl: 'https://via.placeholder.com/300x300?text=Office' },
    //   { name: 'Kitchen', description: 'Functional kitchen furniture', imageUrl: 'https://via.placeholder.com/300x300?text=Kitchen' }
    // ];
    // for (const cat of categories) {
    //   await db.Category.findOrCreate({ where: { name: cat.name }, defaults: cat });
    // }

    // 3. Materiale
    // const materials = [
    //   { name: 'Oak Wood', description: 'High quality oak wood', stock: 100, unit: 'sqm', lowStockThreshold: 20 },
    //   { name: 'Pine Wood', description: 'Affordable pine wood', stock: 150, unit: 'sqm', lowStockThreshold: 30 },
    //   { name: 'Walnut Wood', description: 'Elegant walnut wood', stock: 80, unit: 'sqm', lowStockThreshold: 15 },
    //   { name: 'Leather', description: 'Premium quality leather', stock: 50, unit: 'sqm', lowStockThreshold: 10 },
    //   { name: 'Cotton Fabric', description: 'Soft cotton fabric', stock: 200, unit: 'sqm', lowStockThreshold: 40 },
    //   { name: 'Velvet Fabric', description: 'Luxurious velvet fabric', stock: 60, unit: 'sqm', lowStockThreshold: 15 },
    //   { name: 'Metal Frame', description: 'Durable metal frames', stock: 120, unit: 'pcs', lowStockThreshold: 25 },
    //   { name: 'Glass', description: 'Tempered glass', stock: 90, unit: 'sqm', lowStockThreshold: 20 },
    //   { name: 'Marble', description: 'Elegant marble tops', stock: 30, unit: 'sqm', lowStockThreshold: 8 },
    //   { name: 'Foam Padding', description: 'Comfortable foam padding', stock: 100, unit: 'kg', lowStockThreshold: 20 }
    // ];
    // for (const mat of materials) {
    //   await db.Material.findOrCreate({ where: { name: mat.name }, defaults: mat });
    // }

    // 4. Produse (exemplu pentru Living Room)
    const livingRoom = await db.Category.findOne({ where: { name: 'Living Room' } });
    if (livingRoom) {
      await db.Product.findOrCreate({
        where: { name: 'Modern Sofa' },
        defaults: {
          description: 'A comfortable modern sofa for your living room',
          price: 1299.99,
          stock: 15,
          imageUrl: 'https://via.placeholder.com/300x300?text=Modern+Sofa',
          dimensions: '220x85x75 cm',
          weight: 45.5,
          featured: true,
          availableColors: ['Black', 'Gray', 'Blue', 'Beige'],
          specifications: { seats: 3, material: 'Fabric', frame: 'Wood' },
          categoryId: livingRoom.id
        }
      });
      await db.Product.findOrCreate({
        where: { name: 'Leather Armchair' },
        defaults: {
          description: 'Elegant leather armchair',
          price: 799.99,
          stock: 20,
          imageUrl: 'https://via.placeholder.com/300x300?text=Leather+Armchair',
          dimensions: '80x85x75 cm',
          weight: 25.0,
          featured: true,
          availableColors: ['Black', 'Brown', 'White'],
          specifications: { seats: 1, material: 'Leather', frame: 'Wood' },
          categoryId: livingRoom.id
        }
      });
    }
    // Poți adăuga și alte produse pentru celelalte categorii după același model

    // 5. Echipe (teams)
    const teams = [
      { name: 'Echipa Slefuire', description: 'Echipa specializată în șlefuirea lemnului și pregătirea suprafețelor.' },
      { name: 'Echipa Montaj', description: 'Echipa responsabilă cu montajul mobilierului la client.' },
      { name: 'Echipa Vopsire', description: 'Echipa care se ocupă de vopsirea și finisarea pieselor de mobilier.' },
      { name: 'Echipa Transport', description: 'Echipa care asigură transportul produselor către clienți.' },
    ];
    for (const team of teams) {
      await db.Team.findOrCreate({ where: { name: team.name }, defaults: team });
    }
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err)
  })

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
